from sqlalchemy import Column, String, DateTime
from datetime import datetime
from backend.app.database import Base

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String(50), primary_key=True, default="m_1001")
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    currency = Column(String(10), default="INR")
    created_at = Column(DateTime, default=datetime.utcnow)
