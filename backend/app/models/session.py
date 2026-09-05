from sqlalchemy import Column, String, DateTime, Text, JSON, Float, ForeignKey
from datetime import datetime
from backend.app.database import Base

class AgentSession(Base):
    __tablename__ = "agent_sessions"

    id = Column(String(50), primary_key=True)
    customer_id = Column(String(50), nullable=True)
    intent_summary = Column(Text, nullable=True)
    status = Column(String(30), default="ACTIVE")  # ACTIVE, CONVERTED, ABANDONED, BLOCKED
    metadata_info = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(String(50), primary_key=True)
    session_id = Column(String(50), ForeignKey("agent_sessions.id"), nullable=False)
    tool_name = Column(String(100), nullable=False)
    tool_input = Column(JSON, default=dict)
    tool_output = Column(JSON, default=dict)
    execution_time_ms = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
