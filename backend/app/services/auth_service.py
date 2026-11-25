import os
import time
import hmac
import hashlib
import uuid
import base64
import json
import re
from typing import Tuple, Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models.user import User
from backend.app.models.merchant import Merchant
from backend.app.models.policy import Policy
from backend.app.models.cart import Cart
from backend.app.schemas.auth import SignUpRequest, SignInRequest, UserResponse, AuthResponse, ProfileUpdateRequest

SECRET_KEY = getattr(settings, "AUTH_SECRET_KEY", "merchantpilot-auth-secret-key-prod-secure-token")
TOKEN_EXPIRE_SECONDS = getattr(settings, "TOKEN_EXPIRE_HOURS", 24) * 3600

def hash_password(password: str) -> str:
    """Hash password using PBKDF2-HMAC-SHA256 with a random 16-byte salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
    return f"{salt.hex()}${key.hex()}"

def verify_password(password: str, stored_hash: str) -> bool:
    """Verify password against stored salt$hash format using constant-time comparison."""
    try:
        salt_hex, key_hex = stored_hash.split("$")
        salt = bytes.fromhex(salt_hex)
        expected_key = bytes.fromhex(key_hex)
        key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100000)
        return hmac.compare_digest(key, expected_key)
    except Exception:
        return False

def generate_token(user_id: str, email: str, role: str, merchant_id: Optional[str] = None) -> str:
    """Generate a tamper-evident signed token with expiration timestamp."""
    now = int(time.time())
    payload = {
        "user_id": user_id,
        "email": email,
        "role": role,
        "merchant_id": merchant_id,
        "iat": now,
        "exp": now + TOKEN_EXPIRE_SECONDS,
        "nonce": uuid.uuid4().hex
    }
    payload_bytes = json.dumps(payload).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode("utf-8")
    sig = hmac.new(SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"

def verify_token(token: str) -> Optional[dict]:
    """Verify token signature and return payload dict if valid and unexpired."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        payload_b64, sig = parts
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        payload_bytes = base64.urlsafe_b64decode(payload_b64.encode("utf-8"))
        payload = json.loads(payload_bytes.decode("utf-8"))
        
        # Check token expiration
        if "exp" in payload and time.time() > payload["exp"]:
            return None  # Token expired
            
        return payload
    except Exception:
        return None

class AuthService:
    @staticmethod
    def _build_user_response(db: Session, user: User) -> UserResponse:
        store_name = None
        store_slug = None
        store_description = None
        store_logo = None
        biz_category = None
        phone = None
        address = None
        onboarding_completed = False
        is_published = True
        is_demo = False
        if user.merchant_id:
            m = db.query(Merchant).filter(Merchant.id == user.merchant_id).first()
            if m:
                store_name = m.name
                store_slug = getattr(m, "slug", None) or f"store-{m.id}"
                store_description = getattr(m, "description", None)
                store_logo = getattr(m, "logo_url", None)
                biz_category = getattr(m, "business_category", "General Retail")
                phone = getattr(m, "phone", None)
                address = getattr(m, "address", None)
                onboarding_completed = getattr(m, "onboarding_completed", False)
                is_published = getattr(m, "is_published", True)
                is_demo = getattr(m, "is_demo", False)

        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            merchant_id=user.merchant_id,
            store_name=store_name,
            store_slug=store_slug,
            store_description=store_description,
            store_logo=store_logo,
            business_category=biz_category,
            business_phone=phone,
            business_address=address,
            onboarding_completed=onboarding_completed,
            is_published=is_published,
            is_demo=is_demo,
            created_at=user.created_at
        )

    @staticmethod
    def sign_up(db: Session, request: SignUpRequest) -> AuthResponse:
        email_clean = request.email.lower().strip()
        existing = db.query(User).filter(User.email == email_clean).first()
        if existing:
            raise ValueError("An account with this email address already exists.")

        user_id = f"usr_{uuid.uuid4().hex[:10]}"
        pwd_hash = hash_password(request.password)
        role = (request.role or "customer").lower().strip()
        merchant_id = None

        if role == "merchant":
            # Provision merchant entity for this user
            merchant_id = f"m_{uuid.uuid4().hex[:8]}"
            store_title = request.store_name.strip() if request.store_name else f"{request.name.strip()}'s Store"
            biz_category = request.business_category.strip() if getattr(request, "business_category", None) else "General Retail"
            
            # Generate clean, unique URL slug
            slug_base = request.store_slug.strip() if getattr(request, "store_slug", None) else store_title
            clean_slug = re.sub(r'[^a-z0-9]+', '-', slug_base.lower()).strip('-')
            if not clean_slug:
                clean_slug = f"store-{uuid.uuid4().hex[:6]}"
            
            existing_slug = db.query(Merchant).filter(Merchant.slug == clean_slug).first()
            if existing_slug:
                clean_slug = f"{clean_slug}-{uuid.uuid4().hex[:4]}"

            new_merchant = Merchant(
                id=merchant_id,
                name=store_title,
                email=email_clean,
                currency="INR",
                business_category=biz_category,
                phone=request.business_phone.strip() if getattr(request, "business_phone", None) else None,
                address=request.business_address.strip() if getattr(request, "business_address", None) else None,
                slug=clean_slug,
                description=getattr(request, "store_description", None) or f"{store_title} — Quality {biz_category}",
                onboarding_completed=False,
                is_published=True,
                is_demo=False
            )
            db.add(new_merchant)
            db.flush()

            # Create standard commercial guardrail policy for new merchant
            new_policy = Policy(
                id=f"pol_{merchant_id}",
                merchant_id=merchant_id,
                name=f"{store_title} Standard Policy",
                max_discount_percentage=10.0,
                max_discount_amount=6000.0,
                max_transaction_amount=100000.0,
                allowed_actions=[
                    "search_catalog", "get_product_details", "check_inventory",
                    "get_sales_insights", "recommend_upsell", "recommend_cross_sell",
                    "create_offer", "validate_policy", "create_cart",
                    "create_razorpay_order", "check_payment_status", "record_audit_event"
                ],
                restricted_actions=[
                    "refund", "arbitrary_price_override", "money_transfer",
                    "bypass_approval_gate", "modify_merchant_ledger"
                ],
                require_human_approval=True,
                is_active=True
            )
            db.add(new_policy)
            db.flush()

        new_user = User(
            id=user_id,
            name=request.name.strip(),
            email=email_clean,
            password_hash=pwd_hash,
            role=role,
            merchant_id=merchant_id
        )
        db.add(new_user)
        db.flush()

        # If customer, provision active Cart
        if role == "customer":
            customer_cart = Cart(
                id=f"cart_{uuid.uuid4().hex[:10]}",
                customer_id=new_user.id
            )
            db.add(customer_cart)

        db.commit()
        db.refresh(new_user)

        token = generate_token(new_user.id, new_user.email, new_user.role, new_user.merchant_id)
        return AuthResponse(
            success=True,
            message="Account created successfully.",
            token=token,
            user=AuthService._build_user_response(db, new_user)
        )

    @staticmethod
    def sign_in(db: Session, request: SignInRequest) -> AuthResponse:
        email_clean = request.email.lower().strip()
        user = db.query(User).filter(User.email == email_clean).first()
        if not user or not verify_password(request.password, user.password_hash):
            raise ValueError("Invalid email or password.")

        token = generate_token(user.id, user.email, user.role, user.merchant_id)
        return AuthResponse(
            success=True,
            message="Sign in successful.",
            token=token,
            user=AuthService._build_user_response(db, user)
        )

    @staticmethod
    def get_current_user_from_token(db: Session, token: str) -> Optional[User]:
        payload = verify_token(token)
        if not payload or "user_id" not in payload:
            return None
        user = db.query(User).filter(User.id == payload["user_id"]).first()
        return user

    @staticmethod
    def update_profile(db: Session, user: User, update_data: ProfileUpdateRequest) -> UserResponse:
        if update_data.name:
            user.name = update_data.name.strip()
        if update_data.new_password:
            if not update_data.current_password or not verify_password(update_data.current_password, user.password_hash):
                raise ValueError("Current password must be provided and correct to set a new password.")
            user.password_hash = hash_password(update_data.new_password)
        db.commit()
        db.refresh(user)
        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            merchant_id=user.merchant_id,
            created_at=user.created_at
        )
