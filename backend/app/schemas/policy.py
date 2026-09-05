from pydantic import BaseModel, Field
from typing import List, Optional

class PolicyConfig(BaseModel):
    id: str = "pol_default"
    merchant_id: str = "m_1001"
    name: str = "Standard Commercial Guardrail Policy"
    max_discount_percentage: float = 10.0
    max_discount_amount: float = 6000.0
    max_transaction_amount: float = 100000.0
    allowed_actions: List[str] = Field(default_factory=lambda: [
        "search_catalog",
        "get_product_details",
        "check_inventory",
        "get_sales_insights",
        "recommend_upsell",
        "recommend_cross_sell",
        "create_offer",
        "validate_policy",
        "create_cart",
        "create_razorpay_order",
        "check_payment_status",
        "record_audit_event"
    ])
    restricted_actions: List[str] = Field(default_factory=lambda: [
        "refund",
        "arbitrary_price_override",
        "money_transfer",
        "bypass_approval_gate",
        "modify_merchant_ledger"
    ])
    require_human_approval: bool = True
    is_active: bool = True

class PolicyValidationRequest(BaseModel):
    original_amount: float
    proposed_discount: float
    action: str = "create_offer"
    product_ids: Optional[List[str]] = None
    customer_id: Optional[str] = None

class PolicyValidationResponse(BaseModel):
    passed: bool
    status: str  # PASSED or VIOLATION
    reason: str
    violation_code: Optional[str] = None
    max_allowed_discount: float
    requested_discount: float
    max_discount_percentage: float
    requested_discount_percentage: float
    requires_approval: bool = True
    approval_token: Optional[str] = None
