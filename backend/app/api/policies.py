from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.policy import Policy
from backend.app.schemas.policy import PolicyConfig, PolicyValidationRequest, PolicyValidationResponse
from backend.app.services.policy_service import PolicyService

router = APIRouter(prefix="/policies", tags=["Merchant Policies & Guardrails"])

@router.get("", response_model=PolicyConfig)
def get_policy(db: Session = Depends(get_db)):
    pol = PolicyService.get_active_policy(db)
    return PolicyConfig(
        id=pol.id,
        merchant_id=pol.merchant_id,
        name=pol.name,
        max_discount_percentage=pol.max_discount_percentage,
        max_discount_amount=pol.max_discount_amount,
        max_transaction_amount=pol.max_transaction_amount,
        allowed_actions=pol.allowed_actions or [],
        restricted_actions=pol.restricted_actions or [],
        require_human_approval=pol.require_human_approval,
        is_active=pol.is_active
    )

@router.put("", response_model=PolicyConfig)
def update_policy(config: PolicyConfig, db: Session = Depends(get_db)):
    pol = PolicyService.get_active_policy(db)
    pol.name = config.name
    pol.max_discount_percentage = config.max_discount_percentage
    pol.max_discount_amount = config.max_discount_amount
    pol.max_transaction_amount = config.max_transaction_amount
    pol.allowed_actions = config.allowed_actions
    pol.restricted_actions = config.restricted_actions
    pol.require_human_approval = config.require_human_approval
    pol.is_active = config.is_active
    db.commit()
    db.refresh(pol)
    return config

@router.post("/validate", response_model=PolicyValidationResponse, summary="Validate Transaction/Offer Against Guardrails")
def validate_policy_action(request: PolicyValidationRequest, db: Session = Depends(get_db)):
    res = PolicyService.validate_policy(
        db=db,
        original_amount=request.original_amount,
        proposed_discount=request.proposed_discount,
        action=request.action,
        product_ids=request.product_ids
    )
    return PolicyValidationResponse(**res)
