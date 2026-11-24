from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String(50), primary_key=True)
    merchant_id = Column(String(50), ForeignKey("merchants.id"), default="m_1001", index=True, nullable=False)
    category_id = Column(String(50), ForeignKey("categories.id"), nullable=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    sku = Column(String(100), nullable=True, index=True)
    category = Column(String(100), nullable=False, index=True)  # Kept for direct string queries & test compatibility
    description = Column(String(1000), nullable=False)
    cost_price = Column(Float, default=0.0, nullable=False)  # Purchase cost
    price = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    stock = Column(Integer, default=10, nullable=False)
    low_stock_threshold = Column(Integer, default=5, nullable=False)
    rating = Column(Float, default=4.5)
    image_url = Column(String(500), nullable=True)
    specs = Column(JSON, default=dict)
    compatible_product_ids = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    merchant = relationship("Merchant", back_populates="products")
    category_rel = relationship("Category", back_populates="products")
