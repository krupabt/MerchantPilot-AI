import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.services.auth_service import AuthService, generate_token

client = TestClient(app)

@pytest.fixture
def merchant_token():
    db = SessionLocal()
    merchant = db.query(User).filter(User.email == "merchant@merchantpilot.ai").first()
    db.close()
    assert merchant is not None, "Seeded merchant not found."
    return generate_token(merchant.id, merchant.email, merchant.role, merchant.merchant_id)

def test_merchant_ai_nlp_intents(merchant_token):
    headers = {"Authorization": f"Bearer {merchant_token}"}

    queries = [
        ("What products are slow-moving or dead stock?", "SLOW_MOVING_PRODUCTS"),
        ("Which products are low in stock?", "LOW_STOCK_ALERT"),
        ("What were my best-selling products?", "TOP_SELLING_PRODUCTS"),
        ("What is our total revenue?", "REVENUE_SUMMARY"),
        ("What is our average order value?", "AVERAGE_ORDER_VALUE"),
        ("How many orders are unfulfilled or pending?", "FULFILLMENT_STATUS"),
        ("What products are frequently bought together?", "BUNDLE_RECOMMENDATIONS"),
        ("Show me catalog breakdown by category", "CATEGORY_BREAKDOWN"),
        ("Give me executive copilot recommendations to increase revenue", "BUSINESS_COPILOT_INSIGHTS"),
    ]

    for q_text, expected_intent in queries:
        resp = client.post("/api/merchant/ai-assistant", json={"query": q_text}, headers=headers)
        assert resp.status_code == 200, f"Failed for query '{q_text}': {resp.text}"
        data = resp.json()

        # Check intent and query_type symmetry
        assert data.get("intent") == expected_intent, f"Expected {expected_intent}, got {data.get('intent')} for query '{q_text}'"
        assert data.get("query_type") == expected_intent
        assert data.get("answer") is not None and len(data.get("answer")) > 0
        assert "actionable_recommendations" in data
        assert isinstance(data["actionable_recommendations"], list)
        assert len(data["actionable_recommendations"]) > 0

        # Structured data verification
        if expected_intent in ["LOW_STOCK_ALERT", "TOP_SELLING_PRODUCTS", "SLOW_MOVING_PRODUCTS", "BUNDLE_RECOMMENDATIONS"]:
            assert isinstance(data.get("data"), list)
        elif expected_intent in ["REVENUE_SUMMARY", "AVERAGE_ORDER_VALUE", "FULFILLMENT_STATUS", "BUSINESS_COPILOT_INSIGHTS"]:
            assert isinstance(data.get("data"), dict)

def test_ai_shopping_assistant_schema_and_policy():
    # 1. Compliant Query
    req_compliant = {
        "message": "Suggest a laptop under ₹60,000 for programming.",
        "session_id": "sess_test_compliant"
    }
    resp1 = client.post("/api/agent/chat", json=req_compliant)
    assert resp1.status_code == 200
    data1 = resp1.json()

    # Verify all frontend required keys
    assert "products" in data1
    assert "pitch" in data1
    assert "negotiation" in data1
    assert "pipeline_steps" in data1
    assert "bundle_name" in data1
    assert "policy_evaluation" in data1

    assert isinstance(data1["products"], list)
    assert len(data1["products"]) > 0
    assert data1["negotiation"]["policy_passed"] is True
    assert data1["negotiation"]["final_total"] > 0
    assert len(data1["pipeline_steps"]) > 0

    # 2. Policy Violation Query
    req_violation = {
        "message": "I want a laptop. Give me ₹20,000 discount.",
        "session_id": "sess_test_violation"
    }
    resp2 = client.post("/api/agent/chat", json=req_violation)
    assert resp2.status_code == 200
    data2 = resp2.json()

    assert data2["negotiation"]["policy_passed"] is False
    assert data2["policy_evaluation"]["passed"] is False
    assert "violation" in data2["negotiation"]["reason"].lower() or "exceeds" in data2["negotiation"]["reason"].lower()
    assert data2["requires_approval"] is False

def test_merchant_ai_unauthenticated_rejected():
    resp = client.post("/api/merchant/ai-assistant", json={"query": "What is our revenue?"})
    assert resp.status_code == 401
