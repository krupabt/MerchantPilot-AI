import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.user import User
from backend.app.services.auth_service import generate_token

client = TestClient(app)

@pytest.fixture
def merchant_auth():
    db = SessionLocal()
    merchant = db.query(User).filter(User.email == "merchant@merchantpilot.ai").first()
    db.close()
    assert merchant is not None, "Seeded merchant not found."
    token = generate_token(merchant.id, merchant.email, merchant.role, merchant.merchant_id)
    return {"Authorization": f"Bearer {token}"}

def test_period_comparison_endpoint(merchant_auth):
    res = client.get("/api/merchant/analytics/period-comparison?days=7", headers=merchant_auth)
    assert res.status_code == 200
    data = res.json()
    assert "current_period" in data
    assert "previous_period" in data
    assert "growth" in data
    assert "top_gainers" in data
    assert "top_decliners" in data
    assert "causality_note" in data
    assert "correlation" in data["causality_note"].lower()

def test_inventory_intelligence_endpoint(merchant_auth):
    res = client.get("/api/merchant/inventory/intelligence?target_buffer_days=30", headers=merchant_auth)
    assert res.status_code == 200
    data = res.json()
    assert data["target_buffer_days"] == 30
    assert "summary" in data
    assert "records" in data
    assert len(data["records"]) > 0
    rec = data["records"][0]
    assert "daily_velocity" in rec
    assert "runway_days" in rec
    assert "confidence" in rec

def test_merchant_actions_flow(merchant_auth):
    # 1. Generate proactive actions
    gen_res = client.post("/api/merchant/actions/generate", headers=merchant_auth)
    assert gen_res.status_code == 200
    gen_data = gen_res.json()
    assert "actions" in gen_data
    assert len(gen_data["actions"]) > 0

    # 2. List actions
    list_res = client.get("/api/merchant/actions", headers=merchant_auth)
    assert list_res.status_code == 200
    actions = list_res.json()["actions"]
    assert len(actions) > 0

    pending = [a for a in actions if a["status"] == "PENDING"]
    if pending:
        target_action = pending[0]
        action_id = target_action["id"]

        # 3. Approve action
        app_res = client.post(f"/api/merchant/actions/{action_id}/approve", headers=merchant_auth)
        assert app_res.status_code == 200
        app_data = app_res.json()
        assert app_data["status"] == "EXECUTED"
        assert app_data["is_executed"] is True

def test_merchant_ai_assistant_with_history(merchant_auth):
    payload = {
        "query": "What is our stock runway and replenishment requirements?",
        "history": [
            {"sender": "user", "text": "Which products are low in stock?"},
            {"sender": "assistant", "text": "Apex ProBook is low in stock."}
        ]
    }
    res = client.post("/api/merchant/ai-assistant", json=payload, headers=merchant_auth)
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert "data" in data
    assert data.get("query_type") in ["STOCK_RUNWAY_INTELLIGENCE", "INVENTORY_RUNWAY"]
