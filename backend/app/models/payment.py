from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(50), primary_key=True)
    order_id = Column(String(50), ForeignKey("orders.id"), nullable=False)
    razorpay_order_id = Column(String(100), nullable=False, index=True)
    razorpay_payment_id = Column(String(100), nullable=True, index=True)
    razorpay_signature = Column(String(200), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="CREATED")  # CREATED, AUTHORIZED, CAPTURED, FAILED
    verification_status = Column(String(30), default="UNVERIFIED")  # UNVERIFIED, VERIFIED_HMAC, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    order = relationship("Order", back_populates="payment")
