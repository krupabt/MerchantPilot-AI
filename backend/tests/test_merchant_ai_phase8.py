import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.services.auth_service import generate_token

client = TestClient(app)

@pytest.fixture(scope="module")
def merchant_token():
    db = SessionLocal()
    try:
        merchant_user = db.query(User).filter(User.role == "merchant").first()
        if not merchant_user:
            merchant_user = User(
                id="u_merch_ai_test",
                email="merchant@merchantpilot.ai",
                name="Demo Merchant",
                role="merchant",
                merchant_id="m_1001",
                password_hash="mock"
            )
            db.add(merchant_user)
            db.commit()
            db.refresh(merchant_user)
        token = generate_token(merchant_user.id, merchant_user.email, merchant_user.role, merchant_user.merchant_id)
        return token
    finally:
        db.close()

def test_merchant_ai_low_stock_query(merchant_token):
    headers = {"Authorization": f"Bearer {merchant_token}"}
    res = client.post("/api/merchant/ai-assistant", json={"query": "Which products are low in stock?"}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "LOW_STOCK_ALERT"
    assert "structured_table" in data
    assert "headers" in data["structured_table"]

def test_merchant_ai_top_sellers_query(merchant_token):
    headers = {"Authorization": f"Bearer {merchant_token}"}
    res = client.post("/api/merchant/ai-assistant", json={"query": "Which products sold the most?"}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "TOP_SELLING_PRODUCTS"
    assert "answer" in data

def test_merchant_ai_aov_query(merchant_token):
    headers = {"Authorization": f"Bearer {merchant_token}"}
    res = client.post("/api/merchant/ai-assistant", json={"query": "What is our average order value?"}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "AVERAGE_ORDER_VALUE"
    assert "aov" in data["data"]

def test_merchant_ai_bundle_query(merchant_token):
    headers = {"Authorization": f"Bearer {merchant_token}"}
    res = client.post("/api/merchant/ai-assistant", json={"query": "What product bundles should I create to increase revenue?"}, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "BUNDLE_RECOMMENDATIONS"
    assert "structured_table" in data
