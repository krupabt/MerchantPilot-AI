from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from datetime import datetime
from backend.app.database import Base

class StockAdjustment(Base):
    __tablename__ = "stock_adjustments"

    id = Column(String(50), primary_key=True)
    merchant_id = Column(String(50), ForeignKey("merchants.id"), nullable=False, index=True)
    product_id = Column(String(50), ForeignKey("products.id"), nullable=False, index=True)
    product_name = Column(String(150), nullable=False)
    adjustment_type = Column(String(30), nullable=False)  # "MANUAL", "RESTOCK", "SALE", "RETURN", "DAMAGE"
    quantity_delta = Column(Integer, nullable=False)
    previous_stock = Column(Integer, nullable=False)
    new_stock = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
