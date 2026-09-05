import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.audit import AuditLog

class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        actor: str,
        action: str,
        session_id: Optional[str] = None,
        intent: Optional[str] = None,
        reason: Optional[str] = None,
        input_data: Optional[Dict[str, Any]] = None,
        decision: Optional[str] = None,
        amount: Optional[float] = None,
        policy_checked: Optional[str] = None,
        policy_result: Optional[str] = None,
        approval_result: Optional[str] = None,
        razorpay_order_id: Optional[str] = None,
        payment_id: Optional[str] = None,
        final_result: Optional[str] = None,
        failure_reason: Optional[str] = None
    ) -> AuditLog:
        """
        Record a comprehensive, immutable audit log entry for every AI, policy, or financial event.
        """
        log_id = f"aud_{uuid.uuid4().hex[:12]}"
        log_entry = AuditLog(
            id=log_id,
            session_id=session_id,
            actor=actor,
            intent=intent,
            action=action,
            reason=reason,
            input_data=input_data,
            decision=decision,
            amount=amount,
            policy_checked=policy_checked,
            policy_result=policy_result,
            approval_result=approval_result,
            razorpay_order_id=razorpay_order_id,
            payment_id=payment_id,
            final_result=final_result,
            failure_reason=failure_reason,
            created_at=datetime.utcnow()
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry

    @staticmethod
    def get_logs(
        db: Session,
        session_id: Optional[str] = None,
        actor: Optional[str] = None,
        policy_result: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ):
        query = db.query(AuditLog)
        if session_id:
            query = query.filter(AuditLog.session_id == session_id)
        if actor:
            query = query.filter(AuditLog.actor == actor)
        if policy_result:
            query = query.filter(AuditLog.policy_result == policy_result)
        
        total_count = query.count()
        logs = query.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit).all()
        return total_count, logs
