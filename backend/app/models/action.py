from sqlalchemy import Column, String, Float, DateTime, Text, JSON, Boolean
from datetime import datetime
from backend.app.database import Base

class MerchantAction(Base):
    __tablename__ = "merchant_actions"

    id = Column(String(50), primary_key=True)
    merchant_id = Column(String(50), nullable=False, index=True)
    action_type = Column(String(50), nullable=False, index=True)  # REORDER_STOCK, CREATE_BUNDLE, UPDATE_THRESHOLD, FULFILL_ORDER
    category = Column(String(50), nullable=False, default="INVENTORY")  # INVENTORY, REVENUE, LOGISTICS, POLICY
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)  # Factual SQL ground truth justifying this action
    expected_impact = Column(String(200), nullable=True)  # e.g., "Prevents ₹1,20,000 lost sales"
    payload = Column(JSON, nullable=True)  # Specific data required to execute the action
    status = Column(String(50), nullable=False, default="PENDING", index=True)  # PENDING, APPROVED, REJECTED, EXECUTED
    is_executed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    executed_at = Column(DateTime, nullable=True)
