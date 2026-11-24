from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from datetime import datetime
from backend.app.database import Base

class ImportRecord(Base):
    __tablename__ = "import_records"

    id = Column(String(50), primary_key=True)
    merchant_id = Column(String(50), ForeignKey("merchants.id"), nullable=False, index=True)
    import_type = Column(String(50), nullable=False)  # "PRODUCTS", "INVENTORY", "HISTORICAL_SALES"
    filename = Column(String(255), nullable=False)
    file_hash = Column(String(64), nullable=True, index=True)  # MD5/SHA256 for duplicate prevention
    records_count = Column(Integer, default=0, nullable=False)
    status = Column(String(30), default="SUCCESS", nullable=False)  # "SUCCESS", "FAILED", "PARTIAL"
    summary = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
