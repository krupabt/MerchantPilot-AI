from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.api.deps import get_current_merchant
from backend.app.schemas.revenue import RevenueInsightsResponse
from backend.app.services.revenue_service import RevenueService

router = APIRouter(prefix="/revenue", tags=["Revenue Intelligence"])

@router.get("/insights", response_model=RevenueInsightsResponse, summary="Revenue Intelligence & Association Insights")
def get_revenue_insights(current_merchant: User = Depends(get_current_merchant), db: Session = Depends(get_db)):
    return RevenueService.get_revenue_insights(db, merchant_id=current_merchant.merchant_id)

@router.get("/recommendations/{product_id}", summary="Get Cross-sell and Upsell Recommendations for Product")
def get_product_recommendations(product_id: str, db: Session = Depends(get_db)):
    cross = RevenueService.get_cross_sell_recommendations(db, product_id)
    ups = RevenueService.get_upsell_recommendations(db, product_id)
    return {
        "product_id": product_id,
        "cross_sells": cross,
        "upsells": ups
    }
