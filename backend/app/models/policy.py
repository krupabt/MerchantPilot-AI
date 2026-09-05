from sqlalchemy import Column, String, Float, Boolean, DateTime, JSON, ForeignKey
from datetime import datetime
from backend.app.database import Base

class Policy(Base):
    __tablename__ = "policies"

    id = Column(String(50), primary_key=True, default="pol_default")
    merchant_id = Column(String(50), ForeignKey("merchants.id"), default="m_1001")
    name = Column(String(150), nullable=False, default="Standard Commercial Guardrail Policy")
    max_discount_percentage = Column(Float, default=10.0)
    max_discount_amount = Column(Float, default=6000.0)
    max_transaction_amount = Column(Float, default=100000.0)
    allowed_actions = Column(JSON, default=lambda: [
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
    restricted_actions = Column(JSON, default=lambda: [
        "refund",
        "arbitrary_price_override",
        "money_transfer",
        "bypass_approval_gate",
        "modify_merchant_ledger"
    ])
    require_human_approval = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
