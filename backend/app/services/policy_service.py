import hmac
import hashlib
import time
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from backend.app.models.policy import Policy
from backend.app.config import settings
from backend.app.services.audit_service import AuditService

class PolicyService:
    TOKEN_SECRET = "MerchantPilot_Policy_Guardrail_Secret_Key_9912"

    @staticmethod
    def get_active_policy(db: Session, merchant_id: str = "m_1001") -> Policy:
        policy = db.query(Policy).filter(Policy.merchant_id == merchant_id, Policy.is_active == True).first()
        if not policy:
            policy = Policy(
                id="pol_default",
                merchant_id=merchant_id,
                name="Standard Commercial Guardrail Policy",
                max_discount_percentage=settings.DEFAULT_MAX_DISCOUNT_PERCENTAGE,
                max_discount_amount=settings.DEFAULT_MAX_DISCOUNT_AMOUNT,
                max_transaction_amount=settings.DEFAULT_MAX_TRANSACTION_AMOUNT,
                require_human_approval=True,
                is_active=True
            )
            db.add(policy)
            db.commit()
            db.refresh(policy)
        return policy

    @classmethod
    def generate_approval_token(cls, original_amount: float, discount_amount: float, final_amount: float) -> str:
        timestamp = int(time.time())
        message = f"{original_amount:.2f}|{discount_amount:.2f}|{final_amount:.2f}|{timestamp}"
        signature = hmac.new(
            cls.TOKEN_SECRET.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        return f"appr_{timestamp}_{signature[:16]}"

    @classmethod
    def validate_policy(
        cls,
        db: Session,
        original_amount: float,
        proposed_discount: float,
        action: str = "create_offer",
        session_id: Optional[str] = None,
        product_ids: Optional[List[str]] = None,
        merchant_id: str = "m_1001"
    ) -> Dict[str, Any]:
        """
        Deterministic, server-side evaluation of commercial constraints.
        Prevents unauthorized discounts, excessive transactions, and restricted actions.
        """
        policy = cls.get_active_policy(db, merchant_id)
        
        # 1. Action Whitelist & Blacklist Checks
        if action in (policy.restricted_actions or []):
            reason = f"Action '{action}' is strictly forbidden by merchant policy guardrails."
            AuditService.log_event(
                db=db,
                actor="POLICY_ENGINE",
                session_id=session_id,
                action="VALIDATE_ACTION_RESTRICTION",
                reason=reason,
                decision="BLOCKED",
                amount=original_amount,
                policy_checked="ACTION_RESTRICTION",
                policy_result="VIOLATION",
                failure_reason=reason
            )
            return {
                "passed": False,
                "status": "BLOCKED",
                "violation_code": "RESTRICTED_ACTION",
                "reason": reason,
                "max_allowed_discount": policy.max_discount_amount,
                "requested_discount": proposed_discount,
                "max_discount_percentage": policy.max_discount_percentage,
                "requested_discount_percentage": (proposed_discount / original_amount * 100) if original_amount > 0 else 0,
                "requires_approval": True,
                "approval_token": None
            }

        # 2. Amount boundary checks
        if original_amount <= 0:
            return {
                "passed": False,
                "status": "BLOCKED",
                "violation_code": "INVALID_AMOUNT",
                "reason": "Original amount must be greater than zero.",
                "max_allowed_discount": 0.0,
                "requested_discount": proposed_discount,
                "max_discount_percentage": policy.max_discount_percentage,
                "requested_discount_percentage": 0.0,
                "requires_approval": True,
                "approval_token": None
            }

        final_amount = max(0.0, original_amount - proposed_discount)
        
        # 3. Maximum transaction threshold check
        if final_amount > policy.max_transaction_amount:
            reason = f"Final transaction amount (₹{final_amount:,.2f}) exceeds merchant transaction ceiling of ₹{policy.max_transaction_amount:,.2f}."
            AuditService.log_event(
                db=db,
                actor="POLICY_ENGINE",
                session_id=session_id,
                action="VALIDATE_MAX_TRANSACTION",
                reason=reason,
                decision="BLOCKED",
                amount=final_amount,
                policy_checked="MAX_TRANSACTION_LIMIT",
                policy_result="VIOLATION",
                failure_reason=reason
            )
            return {
                "passed": False,
                "status": "BLOCKED",
                "violation_code": "EXCEEDS_MAX_TRANSACTION",
                "reason": reason,
                "max_allowed_discount": policy.max_discount_amount,
                "requested_discount": proposed_discount,
                "max_discount_percentage": policy.max_discount_percentage,
                "requested_discount_percentage": (proposed_discount / original_amount * 100),
                "requires_approval": True,
                "approval_token": None
            }

        # 4. Maximum discount percentage check
        discount_percentage = (proposed_discount / original_amount) * 100.0 if original_amount > 0 else 0.0
        max_allowed_by_pct = (original_amount * policy.max_discount_percentage) / 100.0
        effective_max_discount = min(policy.max_discount_amount, max_allowed_by_pct)

        if proposed_discount > effective_max_discount or discount_percentage > policy.max_discount_percentage:
            reason = (
                f"Requested discount of ₹{proposed_discount:,.2f} ({discount_percentage:.1f}%) "
                f"exceeds merchant policy limit of {policy.max_discount_percentage:.1f}% "
                f"(Max allowed: ₹{effective_max_discount:,.2f})."
            )
            AuditService.log_event(
                db=db,
                actor="POLICY_ENGINE",
                session_id=session_id,
                action="VALIDATE_DISCOUNT_GUARDRAIL",
                reason=reason,
                input_data={"original_amount": original_amount, "proposed_discount": proposed_discount},
                decision="BLOCKED",
                amount=proposed_discount,
                policy_checked="MAX_DISCOUNT_LIMIT",
                policy_result="VIOLATION",
                failure_reason=reason
            )
            return {
                "passed": False,
                "status": "VIOLATION",
                "violation_code": "EXCEEDS_MAX_DISCOUNT",
                "reason": reason,
                "max_allowed_discount": effective_max_discount,
                "requested_discount": proposed_discount,
                "max_discount_percentage": policy.max_discount_percentage,
                "requested_discount_percentage": round(discount_percentage, 2),
                "requires_approval": True,
                "approval_token": None
            }

        # 5. Success - Issue Approval Token
        token = cls.generate_approval_token(original_amount, proposed_discount, final_amount)
        reason = f"Proposed discount of ₹{proposed_discount:,.2f} ({discount_percentage:.2f}%) is within compliant boundaries."
        
        AuditService.log_event(
            db=db,
            actor="POLICY_ENGINE",
            session_id=session_id,
            action="VALIDATE_OFFER_COMPLIANCE",
            reason=reason,
            input_data={"original_amount": original_amount, "proposed_discount": proposed_discount, "final_amount": final_amount},
            decision="PERMITTED",
            amount=final_amount,
            policy_checked="COMMERCIAL_GUARDRAILS",
            policy_result="PASSED"
        )

        return {
            "passed": True,
            "status": "PASSED",
            "reason": reason,
            "violation_code": None,
            "max_allowed_discount": effective_max_discount,
            "requested_discount": proposed_discount,
            "max_discount_percentage": policy.max_discount_percentage,
            "requested_discount_percentage": round(discount_percentage, 2),
            "requires_approval": policy.require_human_approval,
            "approval_token": token
        }
