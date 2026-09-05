from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.database import get_db
from backend.app.schemas.audit import AuditLogListResponse, AuditLogItem
from backend.app.services.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("/logs", response_model=AuditLogListResponse, summary="Query Tamper-Evident Audit Trail")
def get_audit_logs(
    session_id: Optional[str] = None,
    actor: Optional[str] = None,
    policy_result: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    total, logs = AuditService.get_logs(
        db=db,
        session_id=session_id,
        actor=actor,
        policy_result=policy_result,
        limit=limit,
        offset=offset
    )
    items = [
        AuditLogItem(
            id=log.id,
            session_id=log.session_id,
            actor=log.actor,
            intent=log.intent,
            action=log.action,
            reason=log.reason,
            input_data=log.input_data,
            decision=log.decision,
            amount=log.amount,
            policy_checked=log.policy_checked,
            policy_result=log.policy_result,
            approval_result=log.approval_result,
            razorpay_order_id=log.razorpay_order_id,
            payment_id=log.payment_id,
            final_result=log.final_result,
            failure_reason=log.failure_reason,
            created_at=log.created_at
        ) for log in logs
    ]
    return AuditLogListResponse(total_count=total, logs=items)
