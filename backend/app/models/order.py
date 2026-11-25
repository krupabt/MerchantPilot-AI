from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(String(50), primary_key=True)
    merchant_id = Column(String(50), ForeignKey("merchants.id"), default="m_1001", index=True, nullable=False)
    customer_id = Column(String(50), ForeignKey("users.id"), nullable=True, index=True)
    customer_name = Column(String(100), nullable=True)
    customer_email = Column(String(100), nullable=True)
    customer_phone = Column(String(20), nullable=True)
    session_id = Column(String(100), nullable=True, index=True)
    subtotal_amount = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    final_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(30), default="PENDING", index=True)  # PENDING, PAID, CANCELLED, FAILED
    fulfillment_status = Column(String(30), default="UNFULFILLED", index=True)  # UNFULFILLED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
    sales_channel = Column(String(30), default="ONLINE", nullable=False)  # ONLINE, POS, IN_STORE
    payment_method = Column(String(30), default="RAZORPAY", nullable=False)  # CASH, UPI, CARD, RAZORPAY
    payment_reference = Column(String(100), nullable=True)
    shipping_address = Column(String(500), nullable=True)
    notes = Column(String(500), nullable=True)
    is_ai_assisted = Column(Boolean, default=False)
    is_bundle = Column(Boolean, default=False)
    bundle_name = Column(String(150), nullable=True)
    policy_approval_token = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False)
    merchant = relationship("Merchant", back_populates="orders")
    customer_user = relationship("User", back_populates="orders", foreign_keys=[customer_id])

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(50), primary_key=True)
    order_id = Column(String(50), ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=False, index=True)
    product_name = Column(String(150), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Float, nullable=False)
    unit_cost = Column(Float, default=0.0, nullable=False)  # Purchase cost recorded at sale
    total_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")
