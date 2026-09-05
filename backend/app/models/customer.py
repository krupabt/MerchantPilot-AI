from sqlalchemy import Column, String, DateTime
from datetime import datetime
from backend.app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
