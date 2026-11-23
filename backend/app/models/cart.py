from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from backend.app.database import Base

class Cart(Base):
    __tablename__ = "carts"

    id = Column(String(50), primary_key=True, default=lambda: f"cart_{uuid.uuid4().hex[:10]}")
    customer_id = Column(String(50), ForeignKey("users.id"), nullable=True, index=True)
    session_id = Column(String(100), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")
    customer = relationship("User", back_populates="cart")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(String(50), primary_key=True, default=lambda: f"ci_{uuid.uuid4().hex[:10]}")
    cart_id = Column(String(50), ForeignKey("carts.id"), nullable=False, index=True)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product")
