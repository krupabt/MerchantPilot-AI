from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class OrderItemRequest(BaseModel):
    product_id: str
    product_name: Optional[str] = None
    quantity: int = 1
    unit_price: float

class CreateOrderRequest(BaseModel):
    session_id: Optional[str] = None
    customer_name: str = "Demo Buyer"
    customer_email: str = "buyer@merchantpilot.ai"
    customer_phone: Optional[str] = "9999999999"
    items: List[OrderItemRequest]
    discount_amount: float = 0.0
    bundle_name: Optional[str] = None
    is_bundle: bool = False
    approval_token: Optional[str] = None

class CreateOrderResponse(BaseModel):
    order_id: str
    razorpay_order_id: str
    amount_paise: int
    amount_inr: float
    discount_amount: float
    currency: str = "INR"
    key_id: str
    keys_configured: bool = False
    merchant_name: str
    customer_name: str
    customer_email: str
    customer_phone: str
    description: str

class VerifyPaymentRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

class VerifyPaymentResponse(BaseModel):
    verified: bool
    status: str  # PAID, FAILED, INVALID_SIGNATURE
    message: str
    order_id: str
    razorpay_payment_id: str
    amount_inr: float
    audit_event_id: Optional[str] = None
