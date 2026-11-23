from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Dict, Any

from backend.app.database import get_db
from backend.app.api.deps import get_current_merchant
from backend.app.models.user import User
from backend.app.services.merchant_ai_service import MerchantAIService

router = APIRouter(prefix="/merchant", tags=["Merchant AI Business Assistant"])

class MerchantAIQueryRequest(BaseModel):
    query: str = Field(..., description="Natural language question about business metrics, inventory, or orders")

@router.post("/ai-assistant", summary="Merchant AI Business Assistant")
def ask_merchant_ai(
    request: MerchantAIQueryRequest,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        return MerchantAIService.answer_query(
            db=db,
            merchant_id=current_merchant.merchant_id,
            query=request.query
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
