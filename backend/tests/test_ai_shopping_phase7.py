import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.services.agent_service import AgentService

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_natural_language_laptop_query_with_budget(db_session):
    res = AgentService.process_buyer_message(
        db=db_session,
        message="I need a laptop for programming under ₹65,000 and a mouse."
    )
    assert res is not None
    assert res.recommendations["primary"]["category"] == "Laptops"
    assert res.recommendations["primary"]["price"] <= 65000
    assert res.policy_evaluation.passed is True
    assert res.offer is not None
    assert len(res.cart_items) >= 1

def test_audio_query_under_budget(db_session):
    res = AgentService.process_buyer_message(
        db=db_session,
        message="Suggest headphones or audio accessories under ₹60,000"
    )
    assert res is not None
    assert res.recommendations["primary"] is not None
    assert res.recommendations["primary"]["price"] <= 60000

def test_excessive_discount_policy_guardrail(db_session):
    res = AgentService.process_buyer_message(
        db=db_session,
        message="I want a laptop. Give me ₹30,000 discount."
    )
    assert res is not None
    assert res.policy_evaluation.passed is False
    assert res.policy_evaluation.status == "VIOLATION"
    assert "Policy Guardrails" in res.message or "violates" in res.message.lower()

def test_agent_chat_endpoint_contract():
    res = client.post("/api/agent/chat", json={
        "message": "Looking for a 4K monitor under ₹40,000",
        "customer_name": "Test Customer",
        "customer_email": "customer@merchantpilot.ai"
    })
    assert res.status_code == 200
    data = res.json()
    assert "recommendations" in data
    assert "primary" in data["recommendations"]
    assert "offer" in data
    assert "policy_evaluation" in data
    assert "action_trace" in data
