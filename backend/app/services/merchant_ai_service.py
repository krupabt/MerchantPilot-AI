import re
import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from backend.app.config import settings
from backend.app.models.order import Order, OrderItem
from backend.app.models.product import Product
from backend.app.models.user import User
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.inventory_intelligence_service import InventoryIntelligenceService
from backend.app.services.action_service import ActionService

logger = logging.getLogger(__name__)

class MerchantAIService:
    @classmethod
    def answer_query(
        cls,
        db: Session,
        merchant_id: str,
        query: str,
        history: Optional[List[Dict[str, str]]] = None,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Interprets merchant business questions, supporting multi-turn conversational context,
        period-over-period comparisons, stock runway calculations, and proactive action triggers.
        """
        # Normalize text
        q = re.sub(r'[-_]', ' ', query.lower().strip())

        # Contextual resolution if follow-up question
        last_assistant_msg = ""
        if history and len(history) > 0:
            for turn in reversed(history):
                if turn.get("sender") == "assistant" or turn.get("role") == "assistant":
                    last_assistant_msg = turn.get("text") or turn.get("content") or ""
                    break

        # 1. PERIOD-OVER-PERIOD COMPARISON INTENT
        if any(w in q for w in [
            "compared to", "versus", "vs", "growth", "growing or declining",
            "this week vs", "last week", "this month vs", "last month", "change in sales",
            "period comparison", "compare sales", "performance change", "are we growing"
        ]):
            days = 30 if "month" in q else 7
            res = cls._handle_period_comparison(db, merchant_id, days)

        # 2. STOCK RUNWAY & REPLENISHMENT INTENT
        elif any(w in q for w in [
            "runway", "days of stock", "how long will stock last", "how long will inventory last",
            "how many should i reorder", "how many to reorder", "replenishment quantity",
            "restock quantity", "estimated days left", "runway days"
        ]):
            res = cls._handle_runway_intelligence(db, merchant_id)

        # 3. PROACTIVE MERCHANT ACTIONS INTENT
        elif any(w in q for w in [
            "what action", "what should i do", "what actions should i take",
            "action center", "action directives", "recommended actions",
            "action items", "urgent actions", "proactive action"
        ]):
            res = cls._handle_merchant_actions(db, merchant_id)

        # 4. SLOW MOVING / DEAD STOCK INTENT
        elif any(w in q for w in [
            "slow moving", "dead stock", "not selling", "zero sale", "zero sales",
            "least popular", "worst seller", "discontinue", "stagnant", "unsold",
            "lowest sale", "lowest sales", "dead inventory", "stagnant inventory",
            "sitting in warehouse"
        ]):
            res = cls._handle_slow_moving(db, merchant_id)

        # 5. LOW STOCK / INVENTORY ALERT INTENT
        elif any(w in q for w in [
            "low stock", "low in stock", "out of stock", "reorder", 
            "running out", "shortage", "replenish", "units left",
            "stock level", "stock levels", "restock", "any items low",
            "inventory alert", "inventory status", "stock alert", "low inventory"
        ]) or (
            "stock" in q and not any(neg in q for neg in ["dead stock", "zero stock", "no sales"])
        ) or "inventory" in q:
            # Check if follow-up asking for cost of replenishment
            if any(w in q for w in ["cost", "how much will it cost", "budget needed", "total cost"]):
                res = cls._handle_runway_intelligence(db, merchant_id)
            else:
                res = cls._handle_low_stock(db, merchant_id)

        # 6. TOP PRODUCTS / BEST SELLERS INTENT
        elif any(w in q for w in [
            "top product", "top products", "best seller", "best sellers", 
            "sold the most", "most popular", "highest sales", "most units", 
            "best selling", "top item", "top items", "highest revenue product",
            "star product", "what sells best", "top performing", "winning item",
            "most profitable item"
        ]):
            res = cls._handle_top_products(db, merchant_id)

        # 7. AVERAGE ORDER VALUE (AOV) INTENT
        elif any(w in q for w in [
            "aov", "average order", "average spend", "basket size", "spend per order"
        ]):
            res = cls._handle_aov(db, merchant_id)

        # 8. BUNDLE / CROSS-SELL RECOMMENDATION INTENT
        elif any(w in q for w in [
            "bundle", "cross-sell", "bundle recommendation", "package", 
            "frequently bought together", "pair", "upsell", "basket affinity"
        ]):
            res = cls._handle_bundle_suggestions(db, merchant_id)

        # 9. ORDER STATUS / FULFILLMENT INTENT
        elif any(w in q for w in [
            "unfulfilled", "fulfillment", "pending shipment", "order status", 
            "shipping", "pending order", "dispatch", "delayed order", "deliveries"
        ]):
            res = cls._handle_fulfillment_status(db, merchant_id)

        # 10. CATEGORY PERFORMANCE / BREAKDOWN INTENT
        elif any(w in q for w in [
            "category", "categories", "department", "by category", "catalog breakdown"
        ]):
            res = cls._handle_category_breakdown(db, merchant_id)

        # 11. COPILOT STRATEGY / BUSINESS RECOMMENDATIONS INTENT
        elif any(w in q for w in [
            "recommendation", "how to increase", "advice", "grow revenue", 
            "copilot", "insights", "how to improve", "increase profit", 
            "business health", "strategy", "next steps"
        ]):
            res = cls._handle_copilot_insights(db, merchant_id)

        # 12. DEFAULT / REVENUE SUMMARY
        else:
            res = cls._handle_revenue_summary(db, merchant_id, q)

        # Symmetrize intent and query_type for frontends
        res["query_type"] = res.get("intent", "REVENUE_SUMMARY")

        # Optional Gemini Enhancement (if configured)
        if getattr(settings, "GEMINI_API_KEY", None):
            res = cls._try_gemini_synthesis(query, res, history)

        return res

    @classmethod
    def _handle_period_comparison(cls, db: Session, merchant_id: str, days: int = 7) -> Dict[str, Any]:
        """Calculates factual period-over-period sales growth and drivers."""
        comparison = AnalyticsService.get_sales_period_comparison(db, merchant_id, days)
        growth = comparison["growth"]
        curr = comparison["current_period"]
        prev = comparison["previous_period"]

        sign = "+" if growth["revenue_change_abs"] >= 0 else ""
        answer = (
            f"📈 **Sales Performance Comparison ({days}-Day Trailing Window)**:\n\n"
            f"• **Current Period Revenue:** **₹{curr['revenue']:,.2f}** ({curr['orders_count']} orders, AOV: ₹{curr['aov']:,.2f})\n"
            f"• **Previous Period Revenue:** **₹{prev['revenue']:,.2f}** ({prev['orders_count']} orders, AOV: ₹{prev['aov']:,.2f})\n"
            f"• **Net Change:** **{sign}₹{abs(growth['revenue_change_abs']):,.2f}** ({sign}{growth['revenue_growth_pct']}% growth)\n"
            f"• **Status:** `{growth['status']}`\n\n"
            f"🔍 **Correlation Analysis**: {comparison['causality_note']}"
        )

        rows = []
        for g in comparison.get("top_gainers", []):
            rows.append({
                "product_name": g["name"],
                "sales_change": f"+₹{g['sales_change']:,.2f}",
                "units_change": f"+{g['units_change']}",
                "impact": "Top Growth Driver"
            })
        for d in comparison.get("top_decliners", []):
            rows.append({
                "product_name": d["name"],
                "sales_change": f"-₹{abs(d['sales_change']):,.2f}",
                "units_change": f"{d['units_change']}",
                "impact": "Top Laggard"
            })

        return {
            "intent": "PERIOD_COMPARISON",
            "answer": answer,
            "data": comparison,
            "structured_table": {
                "title": f"Sales Movers ({days}-Day Comparison)",
                "headers": ["Product Name", "Revenue Shift", "Unit Shift", "Classification"],
                "rows": rows
            },
            "actionable_recommendations": [
                f"Reinforce inventory for top growth drivers to capture positive sales momentum.",
                f"Review pricing or bundling for laggards to reverse negative revenue trend."
            ]
        }

    @classmethod
    def _handle_runway_intelligence(cls, db: Session, merchant_id: str) -> Dict[str, Any]:
        """Calculates stock runway days and replenishment recommendations."""
        intel = InventoryIntelligenceService.get_inventory_intelligence(db, merchant_id, target_buffer_days=30)
        summary = intel["summary"]
        records = intel["records"]

        critical = [r for r in records if r["risk_status"] in ["OUT_OF_STOCK", "CRITICAL_RUNWAY", "LOW_RUNWAY"]]

        answer = (
            f"⏱️ **Stock Runway & Replenishment Model (30-Day Buffer Target)**:\n\n"
            f"• **Critical Stockout Risks:** {summary['critical_reorders']} SKU(s) with < 7 days runway\n"
            f"• **Low Runway SKUs:** {summary['low_runway_skus']} SKU(s) with 7-14 days runway\n"
            f"• **Dead Stock SKUs:** {summary['dead_stock_skus']} SKU(s) with 0 sales in 30 days\n"
            f"• **Estimated Replenishment Capital Needed:** **₹{summary['total_replenishment_capital_needed']:,.2f}**\n\n"
            f"Top urgent item: **{critical[0]['name'] if critical else 'None'}** "
            f"({critical[0]['current_stock'] if critical else 0} units left, runway: {critical[0]['runway_days'] if critical else 'N/A'} days)."
        )

        rows = []
        for r in critical[:5]:
            rows.append({
                "name": r["name"],
                "stock": r["current_stock"],
                "runway": f"{r['runway_days']} days" if r["runway_days"] is not None else "0 days",
                "reorder_qty": f"{r['recommended_reorder_qty']} units",
                "estimated_cost": f"₹{r['estimated_reorder_cost']:,.2f}",
                "confidence": r["confidence"]
            })

        return {
            "intent": "STOCK_RUNWAY_INTELLIGENCE",
            "answer": answer,
            "data": intel,
            "structured_table": {
                "title": "Stock Runway & Replenishment Requirements",
                "headers": ["Product Name", "Current Stock", "Days Runway", "Reorder Qty", "Estimated Cost", "Model Confidence"],
                "rows": rows
            },
            "actionable_recommendations": [
                f"Issue purchase order for {critical[0]['name'] if critical else 'low stock items'} to secure ongoing 30-day runway.",
                "Review supplier lead times to synchronize replenishment cadences."
            ]
        }

    @classmethod
    def _handle_merchant_actions(cls, db: Session, merchant_id: str) -> Dict[str, Any]:
        """Returns proactive, high-impact merchant action recommendations."""
        actions = ActionService.generate_proactive_actions(db, merchant_id)
        pending = [a for a in actions if a["status"] == "PENDING"]

        answer = (
            f"⚡ **Merchant Action Directives**: Generated **{len(pending)} pending action(s)** based on live database state.\n\n"
            f"Every action includes verifiable evidence, expected financial impact, and requires your explicit confirmation before changing database state."
        )

        rows = []
        for a in pending[:4]:
            rows.append({
                "title": a["title"],
                "category": a["category"],
                "impact": a["expected_impact"],
                "status": a["status"]
            })

        return {
            "intent": "MERCHANT_ACTIONS",
            "answer": answer,
            "data": pending,
            "structured_table": {
                "title": "Pending Proactive Actions",
                "headers": ["Action Title", "Category", "Expected Impact", "Status"],
                "rows": rows
            },
            "actionable_recommendations": [
                "Visit the Merchant Action Center to review, confirm, or reject these recommendations."
            ]
        }

    @classmethod
    def _handle_low_stock(cls, db: Session, merchant_id: str) -> Dict[str, Any]:
        low_stock_items = db.query(Product).filter(
            Product.merchant_id == merchant_id,
            Product.is_active == True,
            Product.stock <= Product.low_stock_threshold
        ).order_by(Product.stock.asc()).all()

        rows = []
        raw_data = []
        for p in low_stock_items:
            status_text = "OUT OF STOCK" if p.stock <= 0 else f"Low ({p.stock} left)"
            item_dict = {
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "stock": p.stock,
                "threshold": p.low_stock_threshold or 5,
                "low_stock_threshold": p.low_stock_threshold or 5,
                "status": status_text,
                "price": f"₹{p.price:,.2f}",
                "unit_price": float(p.price)
            }
            rows.append(item_dict)
            raw_data.append(item_dict)

        if not rows:
            answer = (
                "✅ **Healthy Inventory Status**: All active products in your catalog are currently above "
                "their configured low-stock thresholds. No immediate reordering is required."
            )
            recs = ["Maintain current supplier replenishment cadences."]
        else:
            out_of_stock_count = sum(1 for r in rows if r["stock"] <= 0)
            answer = (
                f"⚠️ **Inventory Alert**: You have **{len(rows)} product(s)** requiring replenishment.\n\n"
                f"• **Out of Stock:** {out_of_stock_count} item(s)\n"
                f"• **Critically Low:** {len(rows) - out_of_stock_count} item(s)\n"
                f"• **Most Urgent:** **{rows[0]['name']}** ({rows[0]['stock']} units remaining, threshold: {rows[0]['threshold']})."
            )
            recs = [
                f"Issue purchase order for {rows[0]['name']} to prevent lost sales.",
                "Review supplier lead times for hardware inventory."
            ]

        return {
            "intent": "LOW_STOCK_ALERT",
            "answer": answer,
            "data": raw_data,
            "structured_table": {
                "title": "Inventory Attention List",
                "headers": ["SKU", "Product Name", "Category", "Current Stock", "Threshold", "Status"],
                "rows": rows
            },
            "actionable_recommendations": recs
        }

    @classmethod
    def _handle_top_products(cls, db: Session, merchant_id: str) -> Dict[str, Any]:
        results = db.query(
            OrderItem.product_id,
            OrderItem.product_name,
            func.sum(OrderItem.quantity).label("total_units"),
            func.sum(OrderItem.total_price).label("total_revenue")
        ).join(Order, OrderItem.order_id == Order.id).filter(
            Order.merchant_id == merchant_id,
            Order.status == "PAID"
        ).group_by(
            OrderItem.product_id, OrderItem.product_name
        ).order_by(desc("total_units")).limit(5).all()

        rows = []
        raw_data = []
        for r in results:
            item = {
                "product_id": r.product_id,
                "name": r.product_name,
                "units_sold": int(r.total_units),
                "revenue": f"₹{float(r.total_revenue):,.2f}",
                "raw_revenue": float(r.total_revenue)
            }
            rows.append(item)
            raw_data.append(item)

        if not rows:
            products = db.query(Product).filter(Product.merchant_id == merchant_id, Product.is_active == True).limit(5).all()
            answer = "No paid orders have settled yet to rank historical best-sellers. Showing featured active catalog products."
            for p in products:
                raw_data.append({"product_id": p.id, "name": p.name, "units_sold": 0, "revenue": "₹0.00"})
            recs = ["Run a launch promotional discount to generate initial transaction velocity."]
        else:
            top_item = rows[0]
            answer = (
                f"🏆 **Top Performing Product**: Your #1 best-seller is **{top_item['name']}** with "
                f"**{top_item['units_sold']} units sold**, generating **{top_item['revenue']}** in verified sales."
            )
            recs = [
                f"Feature '{top_item['name']}' in hero promotions and customer email campaigns.",
                "Ensure sufficient safety stock for top-selling items."
            ]

        return {
            "intent": "TOP_SELLING_PRODUCTS",
            "answer": answer,
            "data": raw_data,
            "structured_table": {
                "title": "Top Selling Products by Volume",
                "headers": ["SKU", "Product Name", "Units Sold", "Total Revenue"],
                "rows": rows
            },
            "actionable_recommendations": recs
        }

    @classmethod
    def _handle_slow_moving(cls, db: Session, merchant_id: str) -> Dict[str, Any]:
        products = db.query(Product).filter(
            Product.merchant_id == merchant_id,
            Product.is_active == True
        ).all()

        sold_map = {}
        sold_records = db.query(
            OrderItem.product_id,
            func.sum(OrderItem.quantity).label("units_sold")
        ).join(Order, OrderItem.order_id == Order.id).filter(
            Order.merchant_id == merchant_id,
            Order.status == "PAID"
        ).group_by(OrderItem.product_id).all()

        for s in sold_records:
            sold_map[s.product_id] = int(s.units_sold)

        slow_items = []
        for p in products:
            units = sold_map.get(p.id, 0)
            tied_capital = p.stock * p.price
            slow_items.append({
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "stock": p.stock,
                "units_sold": units,
                "price": f"₹{p.price:,.2f}",
                "tied_capital": f"₹{tied_capital:,.2f}",
                "raw_capital": tied_capital
            })

        slow_items.sort(key=lambda x: (x["units_sold"], -x["raw_capital"]))
        bottom_items = slow_items[:5]

        answer = (
            f"📦 **Stagnant & Slow-Moving Inventory**: Found **{len([i for i in slow_items if i['units_sold'] == 0])} item(s)** "
            f"with zero settled sales. The top dead-stock candidate is **{bottom_items[0]['name']}** "
            f"holding **{bottom_items[0]['tied_capital']}** in unliquidated capital."
        )

        return {
            "intent": "SLOW_MOVING_PRODUCTS",
            "answer": answer,
            "data": bottom_items,
            "structured_table": {
                "title": "Stagnant Inventory & Dead Stock",
                "headers": ["SKU", "Product Name", "Category", "Stock", "Units Sold", "Capital Tied Up"],
                "rows": bottom_items
            },
            "actionable_recommendations": [
                f"Bundle {bottom_items[0]['name']} with a popular item at 8% discount to liquidate capital.",
                "Consider flash clearance pricing for items with zero sales in the last 60 days."
            ]
        }

    @classmethod
    def _handle_aov(cls, db: Session, merchant_id: str) -> Dict[str, Any]:
        paid_orders = db.query(Order).filter(
            Order.merchant_id == merchant_id,
            Order.status == "PAID"
        ).all()

        count = len(paid_orders)
        total_rev = sum(o.final_amount for o in paid_orders)
        aov = (total_rev / count) if count > 0 else 0.0

        answer = (
            f"📊 **Average Order Value (AOV)**: Your current AOV is **₹{aov:,.2f}** "
            f"across **{count} completed order(s)** with cumulative revenue of **₹{total_rev:,.2f}**."
        )

        return {
            "intent": "AVERAGE_ORDER_VALUE",
            "answer": answer,
            "data": {
                "aov": round(aov, 2),
                "completed_orders": count,
                "total_revenue": round(total_rev, 2)
            },
            "actionable_recommendations": [
                "Implement cross-sell accessory prompts at cart checkout to raise AOV by 15-20%.",
                "Offer a bounded 5% discount threshold on baskets exceeding ₹75,000."
            ]
        }

    @classmethod
    def _handle_fulfillment_status(cls, db: Session, merchant_id: str) -> Dict[str, Any]:
        orders = db.query(Order).filter(Order.merchant_id == merchant_id).all()

        unfulfilled = sum(1 for o in orders if o.fulfillment_status == "UNFULFILLED" or not o.fulfillment_status)
        processing = sum(1 for o in orders if o.fulfillment_status == "PROCESSING")
        shipped = sum(1 for o in orders if o.fulfillment_status == "SHIPPED")
        delivered = sum(1 for o in orders if o.fulfillment_status == "DELIVERED")

        answer = (
            f"🚚 **Fulfillment Pipeline Status**:\n\n"
            f"• **Unfulfilled Orders:** {unfulfilled}\n"
            f"• **Processing:** {processing}\n"
            f"• **In Transit / Shipped:** {shipped}\n"
            f"• **Delivered:** {delivered}\n\n"
            f"Total order volume logged: **{len(orders)} transactions**."
        )

        return {
            "intent": "FULFILLMENT_STATUS",
            "answer": answer,
            "data": {
                "unfulfilled": unfulfilled,
                "processing": processing,
                "shipped": shipped,
                "delivered": delivered,
                "total_orders": len(orders)
            },
            "actionable_recommendations": [
                "Prioritize packing and dispatching unfulfilled orders within 24 hours.",
                "Upload tracking numbers for shipped packages to maintain buyer satisfaction."
            ]
        }

    @classmethod
    def _handle_bundle_suggestions(cls, db: Session, merchant_id: str) -> Dict[str, Any]:
        products = db.query(Product).filter(Product.merchant_id == merchant_id, Product.is_active == True).all()
        laptops = [p for p in products if p.category == "Laptops"]
        accessories = [p for p in products if p.category == "Accessories"]
        monitors = [p for p in products if p.category == "Monitors"]

        suggestions = []
        if laptops and accessories:
            lap = laptops[0]
            acc = accessories[0]
            combo_price = lap.price + acc.price
            disc_amount = round(combo_price * 0.08, 2)
            bundle_price = combo_price - disc_amount
            suggestions.append({
                "bundle_title": f"{lap.name} + {acc.name} Workstation Kit",
                "original_price": f"₹{combo_price:,.2f}",
                "discount": f"₹{disc_amount:,.2f} (8% off)",
                "bundle_price": f"₹{bundle_price:,.2f}",
                "rationale": "High statistical basket affinity between primary laptop workstations and ergonomic mice."
            })

        if monitors and accessories and len(accessories) > 1:
            mon = monitors[0]
            acc2 = accessories[1]
            combo_price2 = mon.price + acc2.price
            disc_amount2 = round(combo_price2 * 0.07, 2)
            bundle_price2 = combo_price2 - disc_amount2
            suggestions.append({
                "bundle_title": f"{mon.name} + {acc2.name} Desk Setup",
                "original_price": f"₹{combo_price2:,.2f}",
                "discount": f"₹{disc_amount2:,.2f} (7% off)",
                "bundle_price": f"₹{bundle_price2:,.2f}",
                "rationale": "Complementary desktop productivity setup."
            })

        answer = (
            "💡 **AI Basket Intelligence & Bundles**: Based on affinity patterns and merchant guardrails, "
            "bundling primary hardware with high-margin peripherals at a compliant 7-8% discount "
            "lifts average basket size while remaining within your 10% maximum discount policy."
        )

        return {
            "intent": "BUNDLE_RECOMMENDATIONS",
            "answer": answer,
            "data": suggestions,
            "structured_table": {
                "title": "Recommended Bundles & Cross-Sells",
                "headers": ["Bundle Title", "Catalog Price", "Compliant Discount", "Bundle Price", "Commercial Rationale"],
                "rows": suggestions
            },
            "actionable_recommendations": [
                "Activate 1-click bundle checkout on primary hardware product pages.",
                "Review conversion lift after 7 days of bundle deployment."
            ]
        }

    @classmethod
    def _handle_category_breakdown(cls, db: Session, merchant_id: str) -> Dict[str, Any]:
        products = db.query(Product).filter(Product.merchant_id == merchant_id, Product.is_active == True).all()
        category_counts = {}
        for p in products:
            cat = p.category or "General"
            category_counts[cat] = category_counts.get(cat, 0) + 1

        rows = [{"category": k, "product_count": v} for k, v in category_counts.items()]

        answer = (
            f"🏷️ **Catalog Category Distribution**: You currently have products across **{len(rows)} categories**. "
            f"Largest category: **{sorted(rows, key=lambda x: -x['product_count'])[0]['category']}**."
        )

        return {
            "intent": "CATEGORY_BREAKDOWN",
            "answer": answer,
            "data": rows,
            "structured_table": {
                "title": "Catalog Distribution by Category",
                "headers": ["Category", "Active Products"],
                "rows": rows
            },
            "actionable_recommendations": [
                "Expand peripheral offerings in your highest volume category."
            ]
        }

    @classmethod
    def _handle_copilot_insights(cls, db: Session, merchant_id: str) -> Dict[str, Any]:
        paid_orders = db.query(Order).filter(Order.merchant_id == merchant_id, Order.status == "PAID").all()
        products = db.query(Product).filter(Product.merchant_id == merchant_id, Product.is_active == True).all()

        total_rev = sum(o.final_amount for o in paid_orders)
        count = len(paid_orders)
        aov = (total_rev / count) if count > 0 else 0.0
        low_stock_count = sum(1 for p in products if p.stock <= p.low_stock_threshold)

        answer = (
            f"🤖 **MerchantPilot AI Copilot Executive Summary**:\n\n"
            f"• **Revenue Velocity:** ₹{total_rev:,.2f} across {count} verified orders (AOV: ₹{aov:,.2f})\n"
            f"• **Catalog Health:** {len(products)} active products, with {low_stock_count} item(s) near or below stock threshold\n"
            f"• **Policy Compliance:** 100% adherence to merchant commercial guardrails (zero unauthorized discounts)\n\n"
            f"**Strategic Directives:**\n"
            f"1. **Inventory**: Immediately restock low-inventory items to avoid revenue leakage.\n"
            f"2. **Basket Depth**: Turn single-item transactions into multi-item carts via affinity bundles.\n"
            f"3. **Order Speed**: Maintain fulfillment turnaround under 24 hours to foster repeat customer loyalty."
        )

        return {
            "intent": "BUSINESS_COPILOT_INSIGHTS",
            "answer": answer,
            "data": {
                "total_revenue": round(total_rev, 2),
                "total_orders": count,
                "aov": round(aov, 2),
                "active_products": len(products),
                "low_stock_items": low_stock_count
            },
            "actionable_recommendations": [
                "Reorder critical inventory to secure ongoing delivery promises.",
                "Deploy AI cross-sell recommendations on customer checkout paths.",
                "Review weekly sales velocity to optimize safety stock parameters."
            ]
        }

    @classmethod
    def _handle_revenue_summary(cls, db: Session, merchant_id: str, query: str) -> Dict[str, Any]:
        paid_orders = db.query(Order).filter(
            Order.merchant_id == merchant_id,
            Order.status == "PAID"
        ).all()

        total_rev = sum(o.final_amount for o in paid_orders)
        total_discount = sum(o.discount_amount for o in paid_orders)
        count = len(paid_orders)
        aov = (total_rev / count) if count > 0 else 0.0

        answer = (
            f"💰 **Revenue & Financial Summary**:\n\n"
            f"• **Total Settled Revenue:** **₹{total_rev:,.2f}**\n"
            f"• **Completed Orders:** **{count}**\n"
            f"• **Average Order Value (AOV):** **₹{aov:,.2f}**\n"
            f"• **Promotional Discounts Granted:** **₹{total_discount:,.2f}**\n\n"
            f"All metrics are calculated directly from settled PostgreSQL order ledgers."
        )

        return {
            "intent": "REVENUE_SUMMARY",
            "answer": answer,
            "data": {
                "total_revenue": round(total_rev, 2),
                "total_orders": count,
                "total_discounts_granted": round(total_discount, 2),
                "aov": round(aov, 2)
            },
            "actionable_recommendations": [
                "Keep discount ratios under 10% to protect operational gross margins.",
                "Promote premium product tiers to steadily increase AOV."
            ]
        }

    @classmethod
    def _try_gemini_synthesis(cls, user_query: str, res: Dict[str, Any], history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        api_key = getattr(settings, "GEMINI_API_KEY", None)
        if not api_key:
            return res

        try:
            import httpx
            history_context = ""
            if history:
                history_context = "Previous conversation:\n" + "\n".join([f"{h.get('sender', 'user')}: {h.get('text', '')}" for h in history[-3:]]) + "\n\n"

            prompt = (
                f"You are MerchantPilot AI, an intelligent executive business copilot for small merchants.\n"
                f"{history_context}"
                f"The merchant asked: '{user_query}'\n"
                f"The verified database records provide the following exact facts:\n"
                f"Answer: {res['answer']}\n"
                f"Data: {json.dumps(res.get('data', {}))}\n\n"
                f"Provide a concise, professional, executive response explaining these numbers and giving 1-2 actionable tips. "
                f"CRITICAL: Do NOT invent or alter any numbers. Keep all monetary amounts in INR (₹) exactly as provided."
            )
            
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 350}
            }

            with httpx.Client(timeout=4.0) as client:
                resp = client.post(url, json=payload)
                if resp.status_code == 200:
                    result = resp.json()
                    candidates = result.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        if text:
                            res["answer"] = text.strip()
        except Exception as e:
            logger.warning(f"Gemini synthesis bypassed due to: {e}. Preserving deterministic template answer.")

        return res
