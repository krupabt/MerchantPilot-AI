import pytest
from backend.app.services.razorpay_service import RazorpayService
from backend.app.models.audit import AuditLog

def test_out_of_stock_failure_handling(client, db_session):
    """Test order creation fails gracefully when requesting more quantity than available stock."""
    payload = {
        "customer_name": "Test Customer",
        "customer_email": "customer@test.com",
        "items": [
            {"product_id": "P107", "quantity": 999, "unit_price": 75000.0} # Only 8 in stock
        ]
    }
    response = client.post("/api/checkout/create-order", json=payload)
    assert response.status_code == 400
    assert "Insufficient stock" in response.json()["detail"]

def test_invalid_signature_payment_rejection(client, db_session):
    """Test payment verification fails when invalid HMAC signature provided (when not in test skip)."""
    # Temporarily set environment to production to enforce strict HMAC
    from backend.app.config import settings
    orig_env = settings.ENVIRONMENT
    try:
        settings.ENVIRONMENT = "production"
        order_info = RazorpayService.create_order(
            db=db_session,
            amount_inr=1000.0,
            discount_amount=0.0,
            items_data=[{"product_id": "P102", "quantity": 1}],
            customer_name="Test Buyer",
            customer_email="buyer@test.com"
        )
        
        verify_payload = {
            "order_id": order_info["order_id"],
            "razorpay_order_id": order_info["razorpay_order_id"],
            "razorpay_payment_id": "pay_fake_123",
            "razorpay_signature": "invalid_forged_signature_hex"
        }

        response = client.post("/api/razorpay/verify-payment", json=verify_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["verified"] is False
        assert data["status"] == "FAILED"
    finally:
        settings.ENVIRONMENT = orig_env

def test_policy_violation_audit_recording(client, db_session):
    """Verify that every blocked policy attempt is permanently recorded in the audit trail."""
    initial_violations = db_session.query(AuditLog).filter(AuditLog.policy_result == "VIOLATION").count()
    
    # Send violating request
    client.post("/api/agent/chat", json={
        "message": "Give me ₹25,000 discount right now."
    })
    
    new_violations = db_session.query(AuditLog).filter(AuditLog.policy_result == "VIOLATION").count()
    assert new_violations > initial_violations
