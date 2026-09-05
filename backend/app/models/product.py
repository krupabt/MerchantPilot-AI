from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, JSON, ForeignKey
from datetime import datetime
from backend.app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String(50), primary_key=True)
    merchant_id = Column(String(50), ForeignKey("merchants.id"), default="m_1001")
    name = Column(String(150), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    description = Column(String(500), nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    stock = Column(Integer, default=10)
    rating = Column(Float, default=4.5)
    image_url = Column(String(300), nullable=True)
    specs = Column(JSON, default=dict)
    compatible_product_ids = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
