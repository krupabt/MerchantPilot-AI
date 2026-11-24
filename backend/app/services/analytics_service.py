from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_

from backend.app.models.order import Order, OrderItem
from backend.app.models.product import Product

class AnalyticsService:
    @staticmethod
    def get_sales_period_comparison(
        db: Session,
        merchant_id: str = "m_1001",
        window_days: int = 7
    ) -> Dict[str, Any]:
        """
        Calculates factual period-over-period sales performance from paid order records.
        Compares [Current Window] vs [Previous Window].
        Explicitly distinguishes correlation from causation.
        """
        now = datetime.utcnow()
        current_start = now - timedelta(days=window_days)
        previous_start = now - timedelta(days=window_days * 2)

        # 1. Current Window Orders
        curr_orders = db.query(Order).filter(
            Order.merchant_id == merchant_id,
            Order.status.in_(["PAID", "AUTHORIZED"]),
            Order.created_at >= current_start,
            Order.created_at <= now
        ).all()

        # 2. Previous Window Orders
        prev_orders = db.query(Order).filter(
            Order.merchant_id == merchant_id,
            Order.status.in_(["PAID", "AUTHORIZED"]),
            Order.created_at >= previous_start,
            Order.created_at < current_start
        ).all()

        curr_rev = sum(o.final_amount for o in curr_orders)
        prev_rev = sum(o.final_amount for o in prev_orders)
        curr_orders_count = len(curr_orders)
        prev_orders_count = len(prev_orders)

        curr_aov = (curr_rev / curr_orders_count) if curr_orders_count > 0 else 0.0
        prev_aov = (prev_rev / prev_orders_count) if prev_orders_count > 0 else 0.0

        # Percentage Changes
        rev_change_abs = round(curr_rev - prev_rev, 2)
        rev_growth_pct = round(((curr_rev - prev_rev) / prev_rev * 100), 2) if prev_rev > 0 else (100.0 if curr_rev > 0 else 0.0)
        order_growth_pct = round(((curr_orders_count - prev_orders_count) / prev_orders_count * 100), 2) if prev_orders_count > 0 else (100.0 if curr_orders_count > 0 else 0.0)
        aov_growth_pct = round(((curr_aov - prev_aov) / prev_aov * 100), 2) if prev_aov > 0 else (100.0 if curr_aov > 0 else 0.0)

        # 3. Product Movers (Units & Revenue by Product in Current vs Previous)
        curr_order_ids = [o.id for o in curr_orders]
        prev_order_ids = [o.id for o in prev_orders]

        curr_items = db.query(
            OrderItem.product_id,
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("units"),
            func.sum(OrderItem.total_price).label("sales")
        ).filter(OrderItem.order_id.in_(curr_order_ids)).group_by(OrderItem.product_id, OrderItem.product_name).all() if curr_order_ids else []

        prev_items = db.query(
            OrderItem.product_id,
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("units"),
            func.sum(OrderItem.total_price).label("sales")
        ).filter(OrderItem.order_id.in_(prev_order_ids)).group_by(OrderItem.product_id, OrderItem.product_name).all() if prev_order_ids else []

        prev_item_map = {item.product_id: {"name": item.product_name, "units": int(item.units or 0), "sales": float(item.sales or 0.0)} for item in prev_items}
        curr_item_map = {item.product_id: {"name": item.product_name, "units": int(item.units or 0), "sales": float(item.sales or 0.0)} for item in curr_items}

        all_pids = set(prev_item_map.keys()).union(set(curr_item_map.keys()))
        product_deltas = []

        for pid in all_pids:
            p_name = curr_item_map.get(pid, {}).get("name") or prev_item_map.get(pid, {}).get("name") or pid
            c_sales = curr_item_map.get(pid, {}).get("sales", 0.0)
            p_sales = prev_item_map.get(pid, {}).get("sales", 0.0)
            c_units = curr_item_map.get(pid, {}).get("units", 0)
            p_units = prev_item_map.get(pid, {}).get("units", 0)
            delta_sales = round(c_sales - p_sales, 2)
            delta_units = c_units - p_units

            product_deltas.append({
                "product_id": pid,
                "name": p_name,
                "current_sales": c_sales,
                "previous_sales": p_sales,
                "sales_change": delta_sales,
                "units_change": delta_units,
                "growth_pct": round((delta_sales / p_sales * 100), 1) if p_sales > 0 else (100.0 if c_sales > 0 else 0.0)
            })

        product_deltas.sort(key=lambda x: -x["sales_change"])
        top_gainers = [p for p in product_deltas if p["sales_change"] > 0][:3]
        top_decliners = sorted([p for p in product_deltas if p["sales_change"] < 0], key=lambda x: x["sales_change"])[:3]

        # 4. Correlation vs Causation Analysis
        growth_direction = "increased" if rev_change_abs >= 0 else "decreased"
        primary_driver = top_gainers[0]["name"] if (rev_change_abs >= 0 and top_gainers) else (top_decliners[0]["name"] if top_decliners else "balanced catalog")

        causality_note = (
            f"Correlation Insight: Settled revenue {growth_direction} by ₹{abs(rev_change_abs):,.2f} ({'+' if rev_growth_pct >= 0 else ''}{rev_growth_pct}%). "
            f"This movement strongly correlates with sales volume shifts in '{primary_driver}'. "
            f"Note: This is an empirical transaction correlation and should not be assumed as sole causation without external marketing or seasonal attribution."
        )

        return {
            "window_days": window_days,
            "current_period": {
                "start": current_start.strftime("%Y-%m-%d"),
                "end": now.strftime("%Y-%m-%d"),
                "revenue": round(curr_rev, 2),
                "orders_count": curr_orders_count,
                "aov": round(curr_aov, 2)
            },
            "previous_period": {
                "start": previous_start.strftime("%Y-%m-%d"),
                "end": current_start.strftime("%Y-%m-%d"),
                "revenue": round(prev_rev, 2),
                "orders_count": prev_orders_count,
                "aov": round(prev_aov, 2)
            },
            "growth": {
                "revenue_change_abs": rev_change_abs,
                "revenue_growth_pct": rev_growth_pct,
                "order_growth_pct": order_growth_pct,
                "aov_growth_pct": aov_growth_pct,
                "status": "GROWING" if rev_growth_pct > 0 else ("DECLINING" if rev_growth_pct < 0 else "STABLE")
            },
            "top_gainers": top_gainers,
            "top_decliners": top_decliners,
            "causality_note": causality_note
        }
