import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.auth_service import AuthService
from backend.app.schemas.auth import SignInRequest

client = TestClient(app)

def test_unauthenticated_merchant_endpoints_return_401():
    endpoints = [
        "/api/dashboard/stats",
        "/api/merchant/products",
        "/api/merchant/sales",
        "/api/policies",
        "/api/audit/logs",
        "/api/revenue/insights"
    ]
    for ep in endpoints:
        res = client.get(ep)
        assert res.status_code == 401, f"Expected 401 for unauthenticated {ep}, got {res.status_code}: {res.text}"

def test_customer_role_forbidden_from_merchant_endpoints(db_session):
    # Authenticate as customer
    res_login = client.post("/api/auth/signin", json={
        "email": "customer@merchantpilot.ai",
        "password": "Customer@123456"
    })
    assert res_login.status_code == 200, f"Customer login failed: {res_login.text}"
    token = res_login.json()["token"]
    cust_headers = {"Authorization": f"Bearer {token}"}

    # Verify 403 Forbidden on merchant endpoints
    merchant_endpoints = [
        "/api/dashboard/stats",
        "/api/merchant/products",
        "/api/policies",
        "/api/audit/logs",
        "/api/revenue/insights"
    ]
    for ep in merchant_endpoints:
        res = client.get(ep, headers=cust_headers)
        assert res.status_code == 403, f"Expected 403 Forbidden for customer on {ep}, got {res.status_code}: {res.text}"

    # Verify customer cannot create a product (POST /api/merchant/products)
    res_prod = client.post("/api/merchant/products", json={
        "id": "HACK_PROD_1",
        "name": "Unauthorized Hack Item",
        "price": 100.0,
        "cost_price": 50.0,
        "stock": 10
    }, headers=cust_headers)
    assert res_prod.status_code == 403

    # Verify customer cannot record a POS sale (POST /api/merchant/sales)
    res_sale = client.post("/api/merchant/sales", json={
        "items": [{"product_id": "ACC_USB_01", "quantity": 1}],
        "payment_method": "CASH"
    }, headers=cust_headers)
    assert res_sale.status_code == 403

def test_customer_cannot_access_another_customers_order(db_session):
    # Customer 1 login
    res1 = client.post("/api/auth/signin", json={
        "email": "customer@merchantpilot.ai",
        "password": "Customer@123456"
    })
    token1 = res1.json()["token"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # Query an order that does not belong to Customer 1
    res = client.get("/api/customer/orders/ord_nonexistent_or_other", headers=headers1)
    assert res.status_code in (403, 404)
