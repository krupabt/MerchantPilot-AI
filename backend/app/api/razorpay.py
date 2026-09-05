from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.checkout import VerifyPaymentRequest, VerifyPaymentResponse
from backend.app.services.razorpay_service import RazorpayService

router = APIRouter(prefix="/razorpay", tags=["Razorpay Payments"])

@router.post("/verify-payment", response_model=VerifyPaymentResponse, summary="Verify Razorpay Payment Signature")
def verify_payment(request: VerifyPaymentRequest, db: Session = Depends(get_db)):
    try:
        res = RazorpayService.verify_payment_signature(
            db=db,
            order_id=request.order_id,
            razorpay_order_id=request.razorpay_order_id,
            razorpay_payment_id=request.razorpay_payment_id,
            razorpay_signature=request.razorpay_signature
        )
        return VerifyPaymentResponse(**res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook", summary="Razorpay Asynchronous Webhooks")
async def razorpay_webhook(request: Request, x_razorpay_signature: str = Header(None), db: Session = Depends(get_db)):
    payload_bytes = await request.body()
    result = RazorpayService.handle_webhook(db, payload_bytes, x_razorpay_signature or "")
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result
