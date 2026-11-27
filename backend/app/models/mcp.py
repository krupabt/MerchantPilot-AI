from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from backend.app.database import Base

class McpToken(Base):
    __tablename__ = "mcp_tokens"

    id = Column(String(50), primary_key=True, default=lambda: f"mcp_tok_{uuid.uuid4().hex[:12]}")
    merchant_id = Column(String(50), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), default="Claude Custom Connector")
    token = Column(String(255), unique=True, nullable=False, index=True)
    token_preview = Column(String(30), nullable=False) # e.g. mp_mcp_...abcd
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    last_used_at = Column(DateTime, nullable=True)

    # Relationships
    merchant = relationship("Merchant", backref="mcp_tokens")

class McpActivity(Base):
    __tablename__ = "mcp_activities"

    id = Column(String(50), primary_key=True, default=lambda: f"mcp_act_{uuid.uuid4().hex[:12]}")
    merchant_id = Column(String(50), ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False, index=True)
    token_id = Column(String(50), nullable=True)
    tool_name = Column(String(100), nullable=False)
    arguments = Column(Text, default="{}")
    status = Column(String(20), default="SUCCESS") # SUCCESS or ERROR
    result_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    merchant = relationship("Merchant", backref="mcp_activities")
