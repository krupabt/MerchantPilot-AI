import hmac
import hashlib
import uuid
import json
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
import razorpay
from backend.app.config import settings
from backend.app.models.order import Order, OrderItem
from backend.app.models.payment import Payment
from backend.app.models.product import Product
from backend.app.services.audit_service import AuditService


def _is_keys_configured() -> bool:
    """Check if valid Razorpay test keys are configured (must be test mode)."""
    key_id = settings.RAZORPAY_KEY_ID or ""
    secret = settings.RAZORPAY_KEY_SECRET or ""
    placeholders = {
        "", "REPLACE_WITH_YOUR_KEY_ID", "REPLACE_WITH_YOUR_KEY_SECRET",
        "rzp_test_REPLACE_WITH_YOUR_KEY_ID", "rzp_test_SampleKeyId123456",
        "SampleSecretKeyForDemo123"
    }
    return (
        key_id not in placeholders
        and secret not in placeholders
        and key_id.startswith("rzp_test_")  # Strict Test Mode Enforcement
        and len(key_id) > 20
        and len(secret) > 10
    )


class RazorpayService:

    @staticmethod
    def get_client() -> Optional[razorpay.Client]:
        if not _is_keys_configured():
            return None
        try:
            return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        except Exception:
            return None

    @classmethod
    def create_order(
        cls,
        db: Session,
        amount_inr: float,
        discount_amount: float,
        items_data: list,
        customer_name: str,
        customer_email: str,
        customer_phone: str = "9999999999",
        customer_id: Optional[str] = None,
        session_id: Optional[str] = None,
        bundle_name: Optional[str] = None,
        is_bundle: bool = False,
        approval_token: Optional[str] = None,
        shipping_address: Optional[str] = None,
        merchant_id: str = "m_1001"
    ) -> Dict[str, Any]:
        """
        Creates an Order in the database and registers an order in Razorpay Test Mode.
        All pricing is calculated server-side from current catalog prices.
        """
        # Validate items and calculate exact server-side subtotal
        subtotal = 0.0
        verified_items = []
        for item in items_data:
            pid = item.get("product_id") if isinstance(item, dict) else item.product_id
            qty = item.get("quantity", 1) if isinstance(item, dict) else item.quantity
            prod = db.query(Product).filter(Product.id == pid).first()
            if not prod:
                raise ValueError(f"Product ID '{pid}' not found in catalog.")
            if prod.stock < qty:
                raise ValueError(f"Insufficient stock for '{prod.name}' (Available: {prod.stock}).")
            item_total = prod.price * qty
            subtotal += item_total
            verified_items.append((prod, qty, item_total))

        # Dynamically bind order to product's merchant partition if available
        if verified_items and verified_items[0][0].merchant_id:
            merchant_id = verified_items[0][0].merchant_id

        # Server-side amount — never trust client-submitted amount
        final_amount = max(1.0, subtotal - discount_amount)
        amount_paise = int(round(final_amount * 100))

        db_order_id = f"ord_db_{uuid.uuid4().hex[:10]}"
        rzp_order_id = None
        keys_ready = _is_keys_configured()

        if keys_ready:
            client = cls.get_client()
            if client:
                try:
                    rzp_response = client.order.create({
                        "amount": amount_paise,
                        "currency": "INR",
                        "receipt": db_order_id,
                        "notes": {
                            "session_id": session_id or "direct_checkout",
                            "bundle_name": bundle_name or "Standard Cart",
                            "customer_name": customer_name,
                            "customer_email": customer_email
                        }
                    })
                    rzp_order_id = rzp_response.get("id")
                except Exception as e:
                    AuditService.log_event(
                        db=db, actor="RAZORPAY_SYSTEM", session_id=session_id,
                        action="RAZORPAY_API_CALL_ERROR", reason=str(e),
                        decision="ERROR", amount=final_amount, failure_reason=str(e)
                    )
                    raise ValueError(
                        f"Razorpay API error: {str(e)}. "
                        "Check your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env"
                    )

        # If keys not configured, create a demo/simulated order for testing
        if not rzp_order_id:
            rzp_order_id = f"order_demo_{uuid.uuid4().hex[:14]}"

        from backend.app.models.merchant import Merchant
        merch_rec = db.query(Merchant).filter(Merchant.id == merchant_id).first()
        store_display_name = merch_rec.name if merch_rec else "MerchantPilot AI Store"

        formatted_address = shipping_address
        if isinstance(shipping_address, dict):
            import json
            formatted_address = json.dumps(shipping_address)
        elif not isinstance(shipping_address, str) and shipping_address is not None:
            formatted_address = str(shipping_address)

        # Create DB Order Record with customer linkage
        order = Order(
            id=db_order_id,
            merchant_id=merchant_id,
            customer_id=customer_id,
            customer_name=customer_name,
            customer_email=customer_email,
            customer_phone=customer_phone,
            shipping_address=formatted_address,
            session_id=session_id,
            subtotal_amount=round(subtotal, 2),
            discount_amount=round(discount_amount, 2),
            final_amount=round(final_amount, 2),
            currency="INR",
            status="PENDING",
            fulfillment_status="UNFULFILLED",
            is_ai_assisted=bool(session_id or is_bundle),
            is_bundle=is_bundle,
            bundle_name=bundle_name,
            policy_approval_token=approval_token
        )
        db.add(order)

        for prod, qty, total_price in verified_items:
            order_item = OrderItem(
                id=f"item_{uuid.uuid4().hex[:10]}",
                order_id=db_order_id,
                product_id=prod.id,
                product_name=prod.name,
                quantity=qty,
                unit_price=prod.price,
                unit_cost=getattr(prod, "cost_price", 0.0) or 0.0,
                total_price=total_price
            )
            db.add(order_item)

        payment = Payment(
            id=f"pay_rec_{uuid.uuid4().hex[:10]}",
            order_id=db_order_id,
            razorpay_order_id=rzp_order_id,
            amount=final_amount,
            currency="INR",
            status="CREATED",
            verification_status="UNVERIFIED"
        )
        db.add(payment)
        db.commit()
        db.refresh(order)

        AuditService.log_event(
            db=db, actor="RAZORPAY_SYSTEM", session_id=session_id,
            action="CREATE_RAZORPAY_ORDER",
            reason=f"Created order {db_order_id} for ₹{final_amount:,.2f} | merchant={store_display_name}",
            input_data={"amount_inr": final_amount, "discount": discount_amount, "items": len(verified_items), "merchant_id": merchant_id},
            decision="ORDER_CREATED", amount=final_amount,
            razorpay_order_id=rzp_order_id, final_result="PENDING_PAYMENT"
        )

        return {
            "order_id": db_order_id,
            "razorpay_order_id": rzp_order_id,
            "amount_paise": amount_paise,
            "amount_inr": round(final_amount, 2),
            "discount_amount": round(discount_amount, 2),
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID if keys_ready else "",
            "keys_configured": keys_ready,
            "merchant_name": store_display_name,
            "customer_name": customer_name,
            "customer_email": customer_email,
            "customer_phone": customer_phone,
            "description": bundle_name or f"Order {db_order_id}"
        }

    @classmethod
    def _deduct_stock_safely(cls, db: Session, order: Order) -> None:
        """Idempotently decrements stock for an order's items if not already decremented."""
        for item in order.items:
            prod = db.query(Product).filter(Product.id == item.product_id).first()
            if prod:
                prod.stock = max(0, prod.stock - item.quantity)

    @classmethod
    def verify_payment_signature(
        cls,
        db: Session,
        order_id: str,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> Dict[str, Any]:
        """
        Verifies Razorpay payment signature via HMAC-SHA256 with idempotency.
        """
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError(f"Order '{order_id}' not found.")

        # Idempotency check: if order is already PAID, return success without re-deducting stock
        if order.status == "PAID":
            return {
                "verified": True,
                "status": "PAID",
                "message": "Payment already verified previously.",
                "order_id": order.id,
                "razorpay_payment_id": razorpay_payment_id,
                "amount_inr": order.final_amount,
                "audit_event_id": None
            }

        keys_ready = _is_keys_configured()
        is_valid = False

        if keys_ready:
            generated_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
                f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8"),
                hashlib.sha256
            ).hexdigest()
            is_valid = hmac.compare_digest(generated_signature, razorpay_signature)
        else:
            is_valid = (
                razorpay_signature.startswith("test_sig_")
                or razorpay_order_id.startswith("order_demo_")
                or settings.ENVIRONMENT == "development"
            )

        payment = db.query(Payment).filter(Payment.order_id == order_id).first()

        if is_valid:
            order.status = "PAID"
            if payment:
                payment.razorpay_payment_id = razorpay_payment_id
                payment.razorpay_signature = razorpay_signature
                payment.status = "CAPTURED"
                payment.verification_status = "VERIFIED_HMAC" if keys_ready else "VERIFIED_DEMO"

            # Deduct inventory safely (idempotent)
            cls._deduct_stock_safely(db, order)

            db.commit()

            audit_log = AuditService.log_event(
                db=db, actor="RAZORPAY_SYSTEM", session_id=order.session_id,
                action="VERIFY_PAYMENT_SIGNATURE",
                reason=f"Payment {razorpay_payment_id} verified ({'real HMAC' if keys_ready else 'demo mode'})",
                decision="VERIFIED", amount=order.final_amount,
                razorpay_order_id=razorpay_order_id,
                payment_id=razorpay_payment_id, final_result="PAID"
            )

            return {
                "verified": True,
                "status": "PAID",
                "message": "Payment verified and order confirmed.",
                "order_id": order.id,
                "razorpay_payment_id": razorpay_payment_id,
                "amount_inr": order.final_amount,
                "audit_event_id": audit_log.id
            }
        else:
            order.status = "FAILED"
            if payment:
                payment.status = "FAILED"
                payment.verification_status = "VERIFICATION_FAILED"
            db.commit()

            AuditService.log_event(
                db=db, actor="RAZORPAY_SYSTEM", session_id=order.session_id,
                action="VERIFY_PAYMENT_SIGNATURE",
                reason="HMAC-SHA256 signature mismatch.",
                decision="REJECTED", amount=order.final_amount,
                razorpay_order_id=razorpay_order_id,
                payment_id=razorpay_payment_id,
                final_result="PAYMENT_FAILED",
                failure_reason="Invalid cryptographic signature."
            )

            return {
                "verified": False,
                "status": "FAILED",
                "message": "Payment signature verification failed.",
                "order_id": order.id,
                "razorpay_payment_id": razorpay_payment_id,
                "amount_inr": order.final_amount,
                "audit_event_id": None
            }

    @classmethod
    def handle_webhook(cls, db: Session, payload_bytes: bytes, signature_header: str) -> Dict[str, Any]:
        """
        Processes Razorpay webhooks with cryptographic HMAC-SHA256 validation,
        idempotent inventory updates, and order state transitions.
        """
        webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET or ""
        
        # In production or when webhook secret is provided, verify signature
        if webhook_secret:
            computed_sig = hmac.new(
                webhook_secret.encode("utf-8"),
                payload_bytes,
                hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(computed_sig, signature_header):
                return {"status": "error", "message": "Invalid webhook signature"}

        try:
            event_data = json.loads(payload_bytes.decode("utf-8"))
        except Exception:
            return {"status": "error", "message": "Malformed JSON payload"}

        event_type = event_data.get("event")
        payload = event_data.get("payload", {})

        # Handle payment.captured event
        if event_type in ("payment.captured", "order.paid"):
            payment_entity = payload.get("payment", {}).get("entity", {})
            rzp_order_id = payment_entity.get("order_id")
            rzp_payment_id = payment_entity.get("id")

            if not rzp_order_id and event_type == "order.paid":
                order_entity = payload.get("order", {}).get("entity", {})
                rzp_order_id = order_entity.get("id")

            if rzp_order_id:
                payment_rec = db.query(Payment).filter(Payment.razorpay_order_id == rzp_order_id).first()
                if payment_rec:
                    order = db.query(Order).filter(Order.id == payment_rec.order_id).first()
                    if order:
                        # Idempotent: only transition and deduct stock if not already PAID
                        if order.status != "PAID":
                            order.status = "PAID"
                            payment_rec.status = "CAPTURED"
                            payment_rec.verification_status = "VERIFIED_WEBHOOK"
                            if rzp_payment_id:
                                payment_rec.razorpay_payment_id = rzp_payment_id
                            
                            cls._deduct_stock_safely(db, order)
                            db.commit()

                            AuditService.log_event(
                                db=db, actor="RAZORPAY_WEBHOOK", session_id=order.session_id,
                                action="WEBHOOK_PAYMENT_CAPTURED",
                                reason=f"Order {order.id} marked PAID via webhook {event_type}",
                                decision="SETTLED", amount=order.final_amount,
                                razorpay_order_id=rzp_order_id, payment_id=rzp_payment_id,
                                final_result="PAID"
                            )
                        return {
                            "status": "success",
                            "message": f"Processed {event_type} for order {order.id}",
                            "order_id": order.id,
                            "already_paid": order.status == "PAID"
                        }

        # Handle payment.failed event
        elif event_type == "payment.failed":
            payment_entity = payload.get("payment", {}).get("entity", {})
            rzp_order_id = payment_entity.get("order_id")
            if rzp_order_id:
                payment_rec = db.query(Payment).filter(Payment.razorpay_order_id == rzp_order_id).first()
                if payment_rec:
                    payment_rec.status = "FAILED"
                    payment_rec.verification_status = "VERIFICATION_FAILED"
                    order = db.query(Order).filter(Order.id == payment_rec.order_id).first()
                    if order and order.status == "PENDING":
                        order.status = "FAILED"
                    db.commit()
            return {"status": "success", "message": "Processed payment.failed"}

        return {"status": "success", "message": f"Acknowledged webhook event: {event_type}"}
