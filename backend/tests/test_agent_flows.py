import pytest
from backend.app.services.agent_service import AgentService

def test_scenario_1_successful_transaction_flow(client, db_session):
    """
    Scenario 1 — Successful transaction:
    Natural language request: 'I need a laptop for programming under ₹65,000 and a mouse.'
    """
    response = client.post("/api/agent/chat", json={
        "message": "I need a laptop for programming under ₹65,000 and a mouse.",
        "customer_name": "Dev Buyer",
        "customer_email": "buyer@test.com"
    })
    assert response.status_code == 200
    data = response.json()
    
    assert data["session_id"] is not None
    assert "Apex ProBook 15" in data["message"]
    assert data["recommendations"]["primary"]["id"] == "P101"
    assert data["recommendations"]["cross_sell"]["product_id"] == "P102"
    
    assert data["offer"] is not None
    assert data["offer"]["original_total"] == 61000.0
    assert data["offer"]["final_amount"] == 60499.0
    assert data["offer"]["discount_amount"] == 501.0
    
    assert data["policy_evaluation"]["passed"] is True
    assert data["requires_approval"] is True
    assert len(data["action_trace"]) >= 4

def test_scenario_2_blocked_financial_action(client, db_session):
    """
    Scenario 2 — Blocked financial action:
    Customer requests: 'Give me ₹20,000 discount.'
    """
    response = client.post("/api/agent/chat", json={
        "message": "I want a laptop. Give me ₹20,000 discount.",
        "customer_name": "Bargain Hunter"
    })
    assert response.status_code == 200
    data = response.json()
    
    assert data["policy_evaluation"]["passed"] is False
    assert data["policy_evaluation"]["status"] == "VIOLATION"
    assert data["requires_approval"] is False
    assert "Action Blocked by Merchant Policy Guardrails" in data["message"]
    assert "₹20,000" in data["message"]
