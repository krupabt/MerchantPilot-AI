from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from backend.app.database import get_db
from backend.app.api.deps import get_current_merchant
from backend.app.models.user import User
from backend.app.services.sale_service import SaleService
from backend.app.schemas.sale import CreateSaleRequest

router = APIRouter(prefix="/merchant/sales", tags=["In-Store POS & Sales Management"])

@router.post("", status_code=status.HTTP_201_CREATED, summary="Record In-Store Direct / POS Sale")
def create_sale(
    request: CreateSaleRequest,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        return SaleService.record_sale(
            db=db,
            merchant_id=current_merchant.merchant_id,
            request=request
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record sale: {str(e)}")

@router.get("", summary="List Merchant Sales Records (POS & Online)")
def list_sales(
    channel: Optional[str] = Query(None, description="ALL, POS, ONLINE"),
    payment_method: Optional[str] = Query(None, description="ALL, CASH, UPI, CARD, RAZORPAY"),
    limit: int = 50,
    offset: int = 0,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    sales = SaleService.list_sales(
        db=db,
        merchant_id=current_merchant.merchant_id,
        channel=channel,
        payment_method=payment_method,
        limit=limit,
        offset=offset
    )
    return {"sales": sales, "count": len(sales)}

@router.get("/{order_id}/receipt", summary="Get Printable Itemized Sale Receipt")
def get_receipt(
    order_id: str,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        return SaleService.get_sale_receipt(
            db=db,
            merchant_id=current_merchant.merchant_id,
            order_id=order_id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
