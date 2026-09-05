from sqlalchemy import Column, String, Float, DateTime, Text, JSON
from datetime import datetime
from backend.app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(50), primary_key=True)
    session_id = Column(String(50), nullable=True, index=True)
    actor = Column(String(50), nullable=False, index=True)  # AI_BUYER, AI_MERCHANT_AGENT, POLICY_ENGINE, APPROVAL_GATE, RAZORPAY_SYSTEM
    intent = Column(String(200), nullable=True)
    action = Column(String(100), nullable=False, index=True)
    reason = Column(Text, nullable=True)
    input_data = Column(JSON, nullable=True)
    decision = Column(String(50), nullable=True)  # PERMITTED, BLOCKED, APPROVED, REJECTED, VERIFIED
    amount = Column(Float, nullable=True)
    policy_checked = Column(String(100), nullable=True)
    policy_result = Column(String(50), nullable=True, index=True)  # PASSED, VIOLATION, SKIPPED
    approval_result = Column(String(50), nullable=True)  # APPROVED, REJECTED, PENDING
    razorpay_order_id = Column(String(100), nullable=True, index=True)
    payment_id = Column(String(100), nullable=True)
    final_result = Column(String(50), nullable=True)
    failure_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
