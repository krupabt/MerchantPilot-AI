import pytest
import hmac
import hashlib
import json
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.config import settings
from backend.app.models.order import Order
from backend.app.models.product import Product
from backend.app.services.razorpay_service import RazorpayService, _is_keys_configured

client = TestClient(app)

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_checkout_server_side_paise_and_stock_validation(db_session):
    prod = db_session.query(Product).filter(Product.id == "P101").first()
    assert prod is not None

    req_data = {
        "customer_name": "Test Tester",
        "customer_email": "tester@example.com",
        "items": [
            {"product_id": "P101", "quantity": 1, "unit_price": 99.0}
        ],
        "discount_amount": 0.0
    }

    res = client.post("/api/checkout/create-order", json=req_data)
    assert res.status_code == 200
    data = res.json()

    assert data["amount_inr"] == prod.price
    assert data["amount_paise"] == int(round(prod.price * 100))
    assert data["currency"] == "INR"

def test_idempotent_payment_verification(db_session):
    prod = db_session.query(Product).filter(Product.id == "P101").first()
    initial_stock = prod.stock

    # Create order for 1 unit of P101
    order_data = RazorpayService.create_order(
        db=db_session,
        amount_inr=prod.price,
        discount_amount=0.0,
        items_data=[{"product_id": "P101", "quantity": 1}],
        customer_name="Test Customer",
        customer_email="cust@test.com"
    )
    order_id = order_data["order_id"]
    rzp_order_id = order_data["razorpay_order_id"]
    pay_id = "pay_test_idem_1"

    # Compute valid signature depending on environment
    if _is_keys_configured():
        valid_sig = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
            f"{rzp_order_id}|{pay_id}".encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
    else:
        valid_sig = "test_sig_mock_valid"

    # 1st verification
    res1 = RazorpayService.verify_payment_signature(
        db=db_session,
        order_id=order_id,
        razorpay_order_id=rzp_order_id,
        razorpay_payment_id=pay_id,
        razorpay_signature=valid_sig
    )
    assert res1["verified"] is True
    assert res1["status"] == "PAID"

    # Stock decremented by 1
    db_session.refresh(prod)
    assert prod.stock == initial_stock - 1

    # 2nd verification (Duplicate call)
    res2 = RazorpayService.verify_payment_signature(
        db=db_session,
        order_id=order_id,
        razorpay_order_id=rzp_order_id,
        razorpay_payment_id=pay_id,
        razorpay_signature=valid_sig
    )
    assert res2["verified"] is True

    # Stock must NOT be decremented again!
    db_session.refresh(prod)
    assert prod.stock == initial_stock - 1

    # Clean up stock
    prod.stock = initial_stock
    db_session.commit()

def test_webhook_hmac_and_idempotency(db_session):
    prod = db_session.query(Product).filter(Product.id == "P102").first()
    initial_stock = prod.stock

    order_data = RazorpayService.create_order(
        db=db_session,
        amount_inr=prod.price,
        discount_amount=0.0,
        items_data=[{"product_id": "P102", "quantity": 1}],
        customer_name="Webhook Tester",
        customer_email="webhook@test.com"
    )
    rzp_order_id = order_data["razorpay_order_id"]
    db_order_id = order_data["order_id"]

    webhook_payload = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": "pay_hook_12345",
                    "order_id": rzp_order_id,
                    "amount": int(round(prod.price * 100)),
                    "status": "captured"
                }
            }
        }
    }
    payload_bytes = json.dumps(webhook_payload).encode("utf-8")

    secret = settings.RAZORPAY_WEBHOOK_SECRET or "dummy_secret_for_test"
    orig_secret = settings.RAZORPAY_WEBHOOK_SECRET
    settings.RAZORPAY_WEBHOOK_SECRET = secret

    try:
        valid_signature = hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()

        # 1. Test invalid signature rejection
        res_bad = client.post(
            "/api/razorpay/webhook",
            content=payload_bytes,
            headers={"x-razorpay-signature": "invalid_sig_abc"}
        )
        assert res_bad.status_code == 400

        # 2. Test valid signature processing
        res_ok = client.post(
            "/api/razorpay/webhook",
            content=payload_bytes,
            headers={"x-razorpay-signature": valid_signature}
        )
        assert res_ok.status_code == 200
        assert res_ok.json()["status"] == "success"

        # Verify order transitioned to PAID and stock decremented
        order = db_session.query(Order).filter(Order.id == db_order_id).first()
        assert order.status == "PAID"
        db_session.refresh(prod)
        assert prod.stock == initial_stock - 1

        # 3. Test duplicate webhook arrival (idempotent)
        res_dup = client.post(
            "/api/razorpay/webhook",
            content=payload_bytes,
            headers={"x-razorpay-signature": valid_signature}
        )
        assert res_dup.status_code == 200
        db_session.refresh(prod)
        assert prod.stock == initial_stock - 1

    finally:
        settings.RAZORPAY_WEBHOOK_SECRET = orig_secret
        prod.stock = initial_stock
        db_session.commit()
