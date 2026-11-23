from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from backend.app.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(String(50), primary_key=True, default=lambda: f"cat_{uuid.uuid4().hex[:8]}")
    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="category_rel")
