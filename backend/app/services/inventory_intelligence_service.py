import math
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.models.order import Order, OrderItem
from backend.app.models.product import Product

class InventoryIntelligenceService:
    @staticmethod
    def get_inventory_intelligence(
        db: Session,
        merchant_id: str = "m_1001",
        target_buffer_days: int = 30
    ) -> Dict[str, Any]:
        """
        Computes factual inventory velocity, runway days, and replenishment recommendations.
        - Calculates 30-day velocity (units/day).
        - Computes days of stock runway.
        - Explicitly states assumptions and confidence levels (avoids forecasting when data is insufficient).
        """
        now = datetime.utcnow()
        thirty_days_ago = now - timedelta(days=30)

        # 1. Fetch all active products
        products = db.query(Product).filter(
            Product.merchant_id == merchant_id,
            Product.is_active == True
        ).all()

        # 2. Fetch units sold per product in the last 30 days
        sales_30d = db.query(
            OrderItem.product_id,
            func.sum(OrderItem.quantity).label("units_sold")
        ).join(Order, OrderItem.order_id == Order.id).filter(
            Order.merchant_id == merchant_id,
            Order.status.in_(["PAID", "AUTHORIZED"]),
            Order.created_at >= thirty_days_ago
        ).group_by(OrderItem.product_id).all()

        units_sold_map = {s.product_id: int(s.units_sold or 0) for s in sales_30d}

        inventory_records = []
        critical_count = 0
        low_count = 0
        dead_stock_count = 0
        total_replenishment_capital = 0.0

        for p in products:
            units_30d = units_sold_map.get(p.id, 0)
            daily_rate = round(units_30d / 30.0, 3)

            # Runway calculation
            if daily_rate > 0:
                runway_days = round(p.stock / daily_rate, 1)
            else:
                runway_days = None  # No sales in 30 days

            # Risk classification
            if p.stock <= 0:
                risk_status = "OUT_OF_STOCK"
                critical_count += 1
            elif runway_days is not None and runway_days < 7:
                risk_status = "CRITICAL_RUNWAY"
                critical_count += 1
            elif runway_days is not None and runway_days <= 14:
                risk_status = "LOW_RUNWAY"
                low_count += 1
            elif units_30d == 0 and p.stock > 0:
                risk_status = "DEAD_STOCK"
                dead_stock_count += 1
            elif runway_days is not None and runway_days > 60:
                risk_status = "OVERSTOCKED"
            else:
                risk_status = "OPTIMAL"

            # Replenishment calculation with explicit assumptions
            if units_30d >= 2:
                needed_units = math.ceil((target_buffer_days * daily_rate) - p.stock)
                recommended_reorder = max(0, needed_units)
                confidence = "HIGH" if units_30d >= 5 else "MEDIUM"
                assumption_text = f"Assumes steady 30-day velocity of {daily_rate} units/day to maintain a {target_buffer_days}-day stock runway."
            else:
                # Avoid statistical forecasting on insufficient transaction counts
                recommended_reorder = max(0, (p.low_stock_threshold or 5) - p.stock)
                confidence = "INSUFFICIENT_DATA"
                assumption_text = "Transaction sample insufficient (<2 units sold in 30 days). Recommending minimum threshold buffer."

            reorder_cost = round(recommended_reorder * p.price, 2)
            if recommended_reorder > 0:
                total_replenishment_capital += reorder_cost

            inventory_records.append({
                "product_id": p.id,
                "name": p.name,
                "category": p.category or "General",
                "price": float(p.price),
                "current_stock": int(p.stock),
                "threshold": int(p.low_stock_threshold or 5),
                "units_sold_30d": units_30d,
                "daily_sales_rate": daily_rate,
                "daily_velocity": daily_rate,
                "runway_days": runway_days,
                "risk_status": risk_status,
                "recommended_reorder_qty": recommended_reorder,
                "estimated_reorder_cost": reorder_cost,
                "confidence": confidence,
                "confidence_rationale": assumption_text,
                "assumption": assumption_text
            })

        # Sort: Out of stock first, then critical runway, then dead stock
        risk_priority = {"OUT_OF_STOCK": 0, "CRITICAL_RUNWAY": 1, "LOW_RUNWAY": 2, "DEAD_STOCK": 3, "OVERSTOCKED": 4, "OPTIMAL": 5}
        inventory_records.sort(key=lambda x: (risk_priority.get(x["risk_status"], 99), x["current_stock"]))

        return {
            "target_buffer_days": target_buffer_days,
            "velocity_window_days": 30,
            "summary": {
                "total_skus": len(products),
                "critical_reorders": critical_count,
                "low_runway_skus": low_count,
                "dead_stock_skus": dead_stock_count,
                "total_replenishment_capital_needed": round(total_replenishment_capital, 2),
                "target_buffer_days": target_buffer_days
            },
            "records": inventory_records
        }
