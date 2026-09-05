from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.checkout import CreateOrderRequest, CreateOrderResponse
from backend.app.services.razorpay_service import RazorpayService

router = APIRouter(prefix="/checkout", tags=["Checkout & Settlement"])

@router.post("/create-order", response_model=CreateOrderResponse, summary="Create Server-Validated Checkout Order")
def create_checkout_order(request: CreateOrderRequest, db: Session = Depends(get_db)):
    try:
        res = RazorpayService.create_order(
            db=db,
            amount_inr=0.0,  # Computed server-side from verified catalog prices
            discount_amount=request.discount_amount,
            items_data=request.items,
            customer_name=request.customer_name,
            customer_email=request.customer_email,
            customer_phone=request.customer_phone or "9999999999",
            session_id=request.session_id,
            bundle_name=request.bundle_name,
            is_bundle=request.is_bundle,
            approval_token=request.approval_token
        )
        return CreateOrderResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
