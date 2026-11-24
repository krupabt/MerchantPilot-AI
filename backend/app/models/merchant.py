from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String(50), primary_key=True, default="m_1001")
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    currency = Column(String(10), default="INR")
    business_category = Column(String(100), default="General Retail", nullable=False)
    phone = Column(String(30), nullable=True)
    address = Column(String(300), nullable=True)
    is_demo = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="merchant")
    orders = relationship("Order", back_populates="merchant")
    policies = relationship("Policy", back_populates="merchant")
    users = relationship("User", back_populates="merchant", foreign_keys="User.merchant_id")
