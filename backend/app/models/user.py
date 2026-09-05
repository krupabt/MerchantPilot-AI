from sqlalchemy import Column, String, DateTime
from datetime import datetime
import uuid
from backend.app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, default=lambda: f"usr_{uuid.uuid4().hex[:10]}")
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="merchant")  # "merchant" or "buyer"
    created_at = Column(DateTime, default=datetime.utcnow)
