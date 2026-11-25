import pytest
from backend.app.services.audit_service import AuditService
from backend.app.models.audit import AuditLog

def test_audit_logging_and_filtering(client, db_session):
    """Test /api/audit/logs endpoint and filtering capabilities."""
    AuditService.log_event(
        db=db_session,
        actor="AI_BUYER",
        session_id="sess_test_99",
        action="INQUIRY_TEST",
        reason="Testing audit system",
        decision="PERMITTED"
    )

    from backend.app.models.user import User
    from backend.app.services.auth_service import generate_token

    merchant = db_session.query(User).filter(User.email == "merchant@merchantpilot.ai").first()
    token = generate_token(merchant.id, merchant.email, merchant.role, merchant.merchant_id)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/audit/logs?session_id=sess_test_99", headers=headers)
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_count"] >= 1
    assert data["logs"][0]["session_id"] == "sess_test_99"
    assert data["logs"][0]["action"] == "INQUIRY_TEST"
