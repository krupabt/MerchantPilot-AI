import pytest
import time
from backend.app.services.auth_service import AuthService, generate_token, verify_token
from backend.app.schemas.auth import SignUpRequest, SignInRequest, ProfileUpdateRequest
from backend.app.models.user import User
from backend.app.models.merchant import Merchant
from backend.app.models.cart import Cart

def test_customer_signup_and_cart_provisioning(db_session):
    req = SignUpRequest(
        name="Test Customer 1",
        email="test_cust_1@example.com",
        password="Password@123",
        role="customer"
    )
    res = AuthService.sign_up(db_session, req)
    assert res.success is True
    assert res.user.role == "customer"
    assert res.user.merchant_id is None
    
    # Verify cart was provisioned
    cart = db_session.query(Cart).filter(Cart.customer_id == res.user.id).first()
    assert cart is not None

def test_merchant_signup_and_merchant_entity_creation(db_session):
    req = SignUpRequest(
        name="Merchant Boss",
        email="merchant_boss@example.com",
        password="Password@123",
        role="merchant",
        store_name="Boss Electronics"
    )
    res = AuthService.sign_up(db_session, req)
    assert res.success is True
    assert res.user.role == "merchant"
    assert res.user.merchant_id is not None
    
    # Verify merchant entity was created
    merchant = db_session.query(Merchant).filter(Merchant.id == res.user.merchant_id).first()
    assert merchant is not None
    assert merchant.name == "Boss Electronics"

def test_token_expiration():
    token = generate_token("test_uid", "test@example.com", "customer")
    payload = verify_token(token)
    assert payload is not None
    assert payload["user_id"] == "test_uid"
    assert payload["exp"] > time.time()

def test_invalid_password_rejected(db_session):
    req = SignInRequest(
        email="merchant@merchantpilot.ai",
        password="WrongPassword999!"
    )
    with pytest.raises(ValueError) as exc:
        AuthService.sign_in(db_session, req)
    assert "Invalid email or password" in str(exc.value)

def test_profile_update(db_session):
    user = db_session.query(User).filter(User.email == "customer@merchantpilot.ai").first()
    assert user is not None
    
    updated = AuthService.update_profile(
        db_session,
        user,
        ProfileUpdateRequest(name="Updated Demo Customer Name")
    )
    assert updated.name == "Updated Demo Customer Name"
    assert user.name == "Updated Demo Customer Name"

def test_role_authorization_endpoint(client, db_session):
    # Sign in as customer
    res_login = client.post("/api/auth/signin", json={
        "email": "customer@merchantpilot.ai",
        "password": "Customer@123456"
    })
    assert res_login.status_code == 200
    token = res_login.json()["token"]
    
    # Verify /api/auth/me returns current profile
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "customer@merchantpilot.ai"
