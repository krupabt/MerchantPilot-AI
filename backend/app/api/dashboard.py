from fastapi import APIRouter, Depends, Query, Header, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from backend.app.database import get_db
from backend.app.models.order import Order
from backend.app.models.product import Product
from backend.app.models.audit import AuditLog
from backend.app.models.user import User
from backend.app.services.revenue_service import RevenueService
from backend.app.services.merchant_service import MerchantService
from backend.app.api.deps import get_current_merchant

router = APIRouter(prefix="/dashboard", tags=["Merchant Dashboard"])

@router.get("/stats", summary="Overview Metrics for Merchant Fintech Dashboard")
def get_dashboard_stats(
    date_range: Optional[str] = Query(default="all"),
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    # Strictly require authenticated merchant role
    merchant_id = current_merchant.merchant_id
    
    # 1. Real database-derived statistics via MerchantService
    merchant_stats = MerchantService.get_merchant_stats(db, merchant_id=merchant_id, date_range=date_range or "all")
    
    # 2. Revenue insights from real transaction baskets
    rev_insights = RevenueService.get_revenue_insights(db, merchant_id=merchant_id)
    
    # 3. Policy violations & AI sessions from audit logs
    if merchant_id == "m_1001":
        blocked_count = db.query(AuditLog).filter(AuditLog.policy_result == "VIOLATION").count()
        total_ai_sessions = db.query(AuditLog.session_id).distinct().count()
    else:
        blocked_count = db.query(AuditLog).filter(AuditLog.merchant_id == merchant_id, AuditLog.policy_result == "VIOLATION").count()
        total_ai_sessions = db.query(AuditLog.session_id).filter(AuditLog.merchant_id == merchant_id).distinct().count()

    # 4. Active products count
    active_products_count = db.query(Product).filter(
        Product.merchant_id == merchant_id,
        Product.is_active == True
    ).count()

    return {
        "total_revenue": merchant_stats["total_revenue"],
        "total_cogs": merchant_stats.get("total_cogs", 0.0),
        "gross_profit": merchant_stats.get("gross_profit", 0.0),
        "gross_profit_margin_pct": merchant_stats.get("gross_profit_margin_pct", 0.0),
        "date_range": merchant_stats.get("date_range", "all"),
        "active_products": active_products_count,
        "revenue_insights": rev_insights,
        "blocked_actions_count": blocked_count,
        "total_ai_sessions": total_ai_sessions,
        "total_orders": merchant_stats["total_orders"],
        "pending_orders": merchant_stats["pending_orders"],
        "completed_orders": merchant_stats["completed_orders"],
        "average_order_value": merchant_stats["average_order_value"],
        "out_of_stock_count": merchant_stats["out_of_stock_count"],
        "low_stock_count": merchant_stats["low_stock_count"],
        "top_selling_products": merchant_stats["top_selling_products"],
        "low_stock_products": merchant_stats["low_stock_products"],
        "recent_orders": merchant_stats["recent_orders"],
        "revenue_trend": merchant_stats["revenue_trend"]
    }

@router.get("/transactions", summary="List All Merchant Transactions")
def get_transactions(
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    merchant_id = current_merchant.merchant_id
    orders = (
        db.query(Order)
        .filter(Order.merchant_id == merchant_id)
        .order_by(Order.created_at.desc())
        .limit(100)
        .all()
    )
    res = []
    for o in orders:
        res.append({
            "id": o.id,
            "session_id": o.session_id,
            "customer_name": o.customer_name or "Store Customer",
            "customer_email": o.customer_email or "",
            "customer_phone": o.customer_phone or "",
            "subtotal": o.subtotal_amount,
            "discount": o.discount_amount,
            "final_amount": o.final_amount,
            "currency": o.currency,
            "status": o.status,
            "fulfillment_status": o.fulfillment_status or "UNFULFILLED",
            "is_ai_assisted": o.is_ai_assisted,
            "is_bundle": o.is_bundle,
            "bundle_name": o.bundle_name,
            "items": [
                {
                    "product_id": it.product_id,
                    "name": it.product_name,
                    "quantity": it.quantity,
                    "unit_price": it.unit_price,
                    "total": it.total_price
                }
                for it in o.items
            ],
            "payment": {
                "razorpay_order_id": o.payment.razorpay_order_id,
                "razorpay_payment_id": o.payment.razorpay_payment_id,
                "verification_status": o.payment.verification_status,
                "status": o.payment.status
            } if o.payment else None,
            "created_at": o.created_at.isoformat() if o.created_at else ""
        })
    return res
