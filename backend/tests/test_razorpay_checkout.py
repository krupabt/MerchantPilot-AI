import pytest
import hmac
import hashlib
from backend.app.config import settings
from backend.app.services.razorpay_service import RazorpayService
from backend.app.models.order import Order

def test_create_checkout_order_api(client, db_session):
    """Test /api/checkout/create-order creating DB order and Razorpay order."""
    payload = {
        "customer_name": "Test Customer",
        "customer_email": "customer@test.com",
        "items": [
            {"product_id": "P101", "quantity": 1, "unit_price": 60000.0},
            {"product_id": "P102", "quantity": 1, "unit_price": 1000.0}
        ],
        "discount_amount": 501.0,
        "bundle_name": "Developer Starter Kit",
        "is_bundle": True
    }
    response = client.post("/api/checkout/create-order", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["order_id"].startswith("ord_db_")
    assert data["razorpay_order_id"].startswith("order_")
    assert data["amount_inr"] == 60499.0
    assert data["amount_paise"] == 6049900

def test_payment_signature_verification_success(client, db_session):
    """Test cryptographic payment verification with HMAC-SHA256 signature."""
    # Create order first
    order_info = RazorpayService.create_order(
        db=db_session,
        amount_inr=60499.0,
        discount_amount=501.0,
        items_data=[{"product_id": "P101", "quantity": 1}, {"product_id": "P102", "quantity": 1}],
        customer_name="Test Buyer",
        customer_email="buyer@test.com"
    )
    
    order_id = order_info["order_id"]
    rzp_order_id = order_info["razorpay_order_id"]
    rzp_pay_id = "pay_test_998877"

    # Compute valid HMAC signature
    valid_sig = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        f"{rzp_order_id}|{rzp_pay_id}".encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    verify_payload = {
        "order_id": order_id,
        "razorpay_order_id": rzp_order_id,
        "razorpay_payment_id": rzp_pay_id,
        "razorpay_signature": valid_sig
    }

    response = client.post("/api/razorpay/verify-payment", json=verify_payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["verified"] is True
    assert res_data["status"] == "PAID"
    
    # Check DB order status updated
    db_order = db_session.query(Order).filter(Order.id == order_id).first()
    assert db_order.status == "PAID"
