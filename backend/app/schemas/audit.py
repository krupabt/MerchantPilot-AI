from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

class AuditLogItem(BaseModel):
    id: str
    session_id: Optional[str] = None
    actor: str
    intent: Optional[str] = None
    action: str
    reason: Optional[str] = None
    input_data: Optional[Dict[str, Any]] = None
    decision: Optional[str] = None
    amount: Optional[float] = None
    policy_checked: Optional[str] = None
    policy_result: Optional[str] = None
    approval_result: Optional[str] = None
    razorpay_order_id: Optional[str] = None
    payment_id: Optional[str] = None
    final_result: Optional[str] = None
    failure_reason: Optional[str] = None
    created_at: datetime

class AuditLogListResponse(BaseModel):
    total_count: int
    logs: List[AuditLogItem]
