from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.database import get_db
from backend.app.api.deps import get_optional_user
from backend.app.models.user import User
from backend.app.schemas.checkout import CreateOrderRequest, CreateOrderResponse
from backend.app.services.razorpay_service import RazorpayService

router = APIRouter(prefix="/checkout", tags=["Checkout & Settlement"])

@router.post("/create-order", response_model=CreateOrderResponse, summary="Create Server-Validated Checkout Order")
def create_checkout_order(
    request: CreateOrderRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    try:
        res = RazorpayService.create_order(
            db=db,
            amount_inr=0.0,  # Computed server-side from verified catalog prices
            discount_amount=request.discount_amount,
            items_data=request.items,
            customer_name=request.customer_name or (current_user.name if current_user else "Demo Buyer"),
            customer_email=request.customer_email or (current_user.email if current_user else "buyer@merchantpilot.ai"),
            customer_phone=request.customer_phone or (current_user.phone if current_user else "9999999999"),
            customer_id=current_user.id if current_user else None,
            session_id=request.session_id,
            bundle_name=request.bundle_name,
            is_bundle=request.is_bundle,
            approval_token=request.approval_token
        )
        return CreateOrderResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
