import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.services.auth_service import AuthService, generate_token
from backend.app.models.user import User

client = TestClient(app)

@pytest.fixture(scope="module")
def auth_tokens():
    db = SessionLocal()
    try:
        customer = db.query(User).filter(User.email == "customer@merchantpilot.ai").first()
        if not customer:
            customer = User(
                id="u_cust_test_p5",
                email="customer@merchantpilot.ai",
                name="Demo Customer",
                role="customer",
                password_hash="mockhash"
            )
            db.add(customer)
            db.commit()
            db.refresh(customer)
        cust_token = generate_token(customer.id, customer.email, customer.role, customer.merchant_id)

        other_user = db.query(User).filter(User.email == "other@merchantpilot.ai").first()
        if not other_user:
            other_user = User(
                id="u_other_test_p5",
                email="other@merchantpilot.ai",
                name="Other Customer",
                role="customer",
                password_hash="mockhash"
            )
            db.add(other_user)
            db.commit()
            db.refresh(other_user)
        other_token = generate_token(other_user.id, other_user.email, other_user.role, other_user.merchant_id)

        return {
            "customer_token": cust_token,
            "customer_id": customer.id,
            "other_token": other_token,
            "other_id": other_user.id
        }
    finally:
        db.close()

def test_customer_cart_crud_flow(auth_tokens):
    headers = {"Authorization": f"Bearer {auth_tokens['customer_token']}"}

    # 1. Clear cart first
    res = client.delete("/api/customer/cart", headers=headers)
    assert res.status_code == 200
    assert len(res.json()["items"]) == 0

    # 2. Add product P101 to cart (qty 1)
    res = client.post("/api/customer/cart/items", json={"product_id": "P101", "quantity": 1}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data["items"]) == 1
    assert data["items"][0]["product_id"] == "P101"
    assert data["items"][0]["quantity"] == 1
    item_id = data["items"][0]["item_id"]
    unit_price = data["items"][0]["unit_price"]
    assert data["subtotal"] == unit_price

    # 3. Update quantity to 2
    res = client.put(f"/api/customer/cart/items/{item_id}", json={"quantity": 2}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["items"][0]["quantity"] == 2
    assert data["subtotal"] == unit_price * 2

    # 4. Remove item
    res = client.delete(f"/api/customer/cart/items/{item_id}", headers=headers)
    assert res.status_code == 200
    assert len(res.json()["items"]) == 0

def test_cart_over_stock_rejection(auth_tokens):
    headers = {"Authorization": f"Bearer {auth_tokens['customer_token']}"}

    # Attempt to add 99999 units of P101 (exceeds stock)
    res = client.post("/api/customer/cart/items", json={"product_id": "P101", "quantity": 99999}, headers=headers)
    assert res.status_code == 400
    assert "stock" in res.json()["detail"].lower()

def test_customer_orders_listing_and_isolation(auth_tokens):
    headers = {"Authorization": f"Bearer {auth_tokens['customer_token']}"}

    # Customer gets their orders
    res = client.get("/api/customer/orders", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)

def test_unauthorized_cart_access():
    # Calling cart without token should return 401
    res = client.get("/api/customer/cart")
    assert res.status_code == 401
