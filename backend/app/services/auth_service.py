import os
import hmac
import hashlib
import uuid
import base64
import json
from typing import Tuple, Optional
from sqlalchemy.orm import Session
from backend.app.models.user import User
from backend.app.schemas.auth import SignUpRequest, SignInRequest, UserResponse, AuthResponse

SECRET_KEY = "merchantpilot-auth-secret-key-prod-secure-token"

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

def generate_token(user_id: str, email: str, role: str) -> str:
    """Generate a tamper-evident signed token."""
    payload = json.dumps({"user_id": user_id, "email": email, "role": role, "nonce": uuid.uuid4().hex}).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload).decode("utf-8")
    sig = hmac.new(SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{sig}"

def verify_token(token: str) -> Optional[dict]:
    """Verify token signature and return payload dict if valid."""
    try:
        payload_b64, sig = token.split(".")
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), payload_b64.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        payload_bytes = base64.urlsafe_b64decode(payload_b64.encode("utf-8"))
        return json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        return None

class AuthService:
    @staticmethod
    def sign_up(db: Session, request: SignUpRequest) -> AuthResponse:
        email_clean = request.email.lower().strip()
        existing = db.query(User).filter(User.email == email_clean).first()
        if existing:
            raise ValueError("An account with this email address already exists.")

        user_id = f"usr_{uuid.uuid4().hex[:10]}"
        pwd_hash = hash_password(request.password)

        new_user = User(
            id=user_id,
            name=request.name.strip(),
            email=email_clean,
            password_hash=pwd_hash,
            role=request.role or "merchant"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        token = generate_token(new_user.id, new_user.email, new_user.role)
        return AuthResponse(
            success=True,
            message="Account created successfully.",
            token=token,
            user=UserResponse(
                id=new_user.id,
                name=new_user.name,
                email=new_user.email,
                role=new_user.role,
                created_at=new_user.created_at
            )
        )

    @staticmethod
    def sign_in(db: Session, request: SignInRequest) -> AuthResponse:
        email_clean = request.email.lower().strip()
        user = db.query(User).filter(User.email == email_clean).first()
        if not user or not verify_password(request.password, user.password_hash):
            raise ValueError("Invalid email or password.")

        token = generate_token(user.id, user.email, user.role)
        return AuthResponse(
            success=True,
            message="Sign in successful.",
            token=token,
            user=UserResponse(
                id=user.id,
                name=user.name,
                email=user.email,
                role=user.role,
                created_at=user.created_at
            )
        )

    @staticmethod
    def get_current_user_from_token(db: Session, token: str) -> Optional[UserResponse]:
        payload = verify_token(token)
        if not payload or "user_id" not in payload:
            return None
        user = db.query(User).filter(User.id == payload["user_id"]).first()
        if not user:
            return None
        return UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            created_at=user.created_at
        )
