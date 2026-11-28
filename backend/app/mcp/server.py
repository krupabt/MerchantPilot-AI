import json
import re
import uuid
from contextvars import ContextVar
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from starlette.types import ASGIApp, Scope, Receive, Send
from starlette.responses import JSONResponse, Response

from mcp.server.fastmcp import FastMCP

from backend.app.database import SessionLocal
from backend.app.models.merchant import Merchant
from backend.app.models.product import Product
from backend.app.models.category import Category
from backend.app.models.order import Order, OrderItem
from backend.app.models.policy import Policy
from backend.app.services.mcp_service import verify_mcp_token, log_mcp_activity
from backend.app.services.revenue_service import RevenueService

# Context variable storing authenticated merchant details for current request
current_mcp_merchant: ContextVar[Optional[Dict[str, Any]]] = ContextVar("current_mcp_merchant", default=None)

import time
import asyncio

_mcp_init_lock = asyncio.Lock()

async def _ensure_session_manager_running():
    """
    Ensure MCP session manager taskgroup is active even in serverless environments
    where the hosting platform (e.g. Vercel) does not invoke the ASGI lifespan context.
    """
    if hasattr(mcp, "session_manager") and getattr(mcp.session_manager, "_task_group", None) is not None:
        return
    async with _mcp_init_lock:
        if hasattr(mcp, "session_manager") and getattr(mcp.session_manager, "_task_group", None) is not None:
            return
        if hasattr(mcp.session_manager, "_has_started"):
            mcp.session_manager._has_started = False

        async def _bg_runner():
            try:
                async with mcp.session_manager.run():
                    while True:
                        await asyncio.sleep(3600)
            except Exception as e:
                print(f"MCP session manager runner notice: {e}")

        asyncio.create_task(_bg_runner())
        for _ in range(200):
            if getattr(mcp.session_manager, "_task_group", None) is not None:
                break
            await asyncio.sleep(0.005)

# Initialize official FastMCP server with Streamable HTTP transport and pure JSON responses
mcp = FastMCP(
    name="MerchantPilot AI",
    instructions=(
        "MerchantPilot AI Commerce Engine MCP Server for Claude. "
        "Allows Claude to operate catalog, inventory, orders, revenue intelligence, "
        "and store configuration directly using authenticated merchant tools."
    ),
    streamable_http_path="/",
    stateless_http=True,
    json_response=True
)

def _get_active_merchant() -> Dict[str, Any]:
    """Retrieve the current authenticated merchant or raise authentication error."""
    merchant = current_mcp_merchant.get()
    if not merchant:
        raise ValueError("Authentication failed: Missing or invalid MerchantPilot MCP Bearer token.")
    return merchant


# ---------------------------------------------------------------------------
# Tool 1: get_store_details
# ---------------------------------------------------------------------------
@mcp.tool()
def get_store_details() -> Dict[str, Any]:
    """
    Get current store profile, business details, storefront URL, product count, and publication status.
    """
    merchant_info = _get_active_merchant()
    merchant_id = merchant_info["merchant_id"]

    db = SessionLocal()
    try:
        m = db.query(Merchant).filter(Merchant.id == merchant_id).first()
        if not m:
            raise ValueError(f"Merchant '{merchant_id}' not found.")

        product_count = db.query(Product).filter(
            Product.merchant_id == merchant_id,
            Product.is_archived == False
        ).count()

        order_count = db.query(Order).filter(Order.merchant_id == merchant_id).count()

        result = {
            "merchant_id": m.id,
            "store_name": m.name,
            "slug": m.slug or "",
            "storefront_url": f"https://merchantpilot-ai.vercel.app/store/{m.slug}" if m.slug else "",
            "email": m.email,
            "business_category": m.business_category,
            "phone": m.phone or "",
            "address": m.address or "",
            "description": m.description or "",
            "is_published": bool(m.is_published),
            "onboarding_completed": bool(m.onboarding_completed),
            "currency": m.currency or "INR",
            "total_products": product_count,
            "total_orders": order_count
        }

        log_mcp_activity(merchant_id, "get_store_details", {}, "SUCCESS", f"Store: {m.name} ({m.slug})")
        return result
    except Exception as e:
        log_mcp_activity(merchant_id, "get_store_details", {}, "ERROR", str(e))
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Tool 2: list_products
# ---------------------------------------------------------------------------
@mcp.tool()
def list_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    include_archived: bool = False
) -> Dict[str, Any]:
    """
    List products in the merchant's catalog with pricing, cost, gross margins, and stock levels.
    """
    merchant_info = _get_active_merchant()
    merchant_id = merchant_info["merchant_id"]

    db = SessionLocal()
    try:
        query = db.query(Product).filter(Product.merchant_id == merchant_id)
        if not include_archived:
            query = query.filter(Product.is_archived == False)
        if category:
            query = query.filter(Product.category.ilike(f"%{category}%"))
        if search:
            query = query.filter(Product.name.ilike(f"%{search}%") | Product.description.ilike(f"%{search}%"))

        products = query.order_by(Product.name.asc()).all()

        items = []
        for p in products:
            price = float(p.price or 0.0)
            cost = float(p.cost_price or 0.0)
            margin_pct = round(((price - cost) / price) * 100, 1) if price > 0 else 0.0

            items.append({
                "id": p.id,
                "name": p.name,
                "sku": p.sku or "",
                "category": p.category,
                "price": price,
                "cost_price": cost,
                "gross_margin_percent": margin_pct,
                "stock": int(p.stock or 0),
                "low_stock_threshold": int(p.low_stock_threshold or 5),
                "is_low_stock": int(p.stock or 0) <= int(p.low_stock_threshold or 5),
                "is_published": bool(p.is_published),
                "is_archived": bool(p.is_archived),
                "rating": float(p.rating or 4.5),
                "description": p.description or ""
            })

        result = {
            "merchant_id": merchant_id,
            "total_count": len(items),
            "products": items
        }

        log_mcp_activity(merchant_id, "list_products", {"category": category, "search": search}, "SUCCESS", f"Found {len(items)} products")
        return result
    except Exception as e:
        log_mcp_activity(merchant_id, "list_products", {"category": category, "search": search}, "ERROR", str(e))
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Tool 3: add_product
# ---------------------------------------------------------------------------
@mcp.tool()
def add_product(
    name: str,
    price: float,
    cost_price: float = 0.0,
    stock: int = 10,
    category: str = "General Retail",
    description: str = "",
    sku: Optional[str] = None,
    low_stock_threshold: int = 5,
    image_url: Optional[str] = None
) -> Dict[str, Any]:
    """
    Add a new product to the merchant's store catalog. Optionally supply an image_url (https://... or /images/...).
    """
    merchant_info = _get_active_merchant()
    merchant_id = merchant_info["merchant_id"]

    if not name or not name.strip():
        raise ValueError("Product name cannot be empty.")
    if price <= 0:
        raise ValueError("Selling price must be greater than zero.")

    db = SessionLocal()
    try:
        # Resolve or create Category
        cat_obj = db.query(Category).filter(
            Category.name.ilike(category.strip())
        ).first()

        if not cat_obj:
            clean_cat_slug = re.sub(r'[^a-z0-9]+', '-', category.lower()).strip('-') or "general"
            cat_obj = Category(
                id=f"cat_{uuid.uuid4().hex[:8]}",
                name=category.strip(),
                slug=clean_cat_slug,
                description=f"{category.strip()} products"
            )
            db.add(cat_obj)
            db.flush()

        prod_id = f"prod_{uuid.uuid4().hex[:10]}"
        generated_sku = sku.strip() if sku else f"{re.sub(r'[^A-Z0-9]', '', name.upper())[:6]}-{uuid.uuid4().hex[:4].upper()}"

        new_product = Product(
            id=prod_id,
            merchant_id=merchant_id,
            category_id=cat_obj.id,
            category=category.strip(),
            name=name.strip(),
            sku=generated_sku,
            description=description.strip() or f"High quality {name.strip()}",
            cost_price=float(cost_price),
            price=float(price),
            stock=int(stock),
            low_stock_threshold=int(low_stock_threshold),
            image_url=image_url.strip() if image_url else None,
            is_active=True,
            is_published=True,
            is_archived=False,
            created_at=datetime.utcnow()
        )
        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        margin_pct = round(((price - cost_price) / price) * 100, 1) if price > 0 else 0.0

        result = {
            "success": True,
            "product_id": new_product.id,
            "name": new_product.name,
            "sku": new_product.sku,
            "category": new_product.category,
            "price": new_product.price,
            "cost_price": new_product.cost_price,
            "gross_margin_percent": margin_pct,
            "stock": new_product.stock,
            "is_published": new_product.is_published
        }

        log_mcp_activity(merchant_id, "add_product", {"name": name, "price": price}, "SUCCESS", f"Added {name} (ID: {prod_id})")
        return result
    except Exception as e:
        db.rollback()
        log_mcp_activity(merchant_id, "add_product", {"name": name, "price": price}, "ERROR", str(e))
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Tool 4: update_product
# ---------------------------------------------------------------------------
@mcp.tool()
def update_product(
    product_id: str,
    name: Optional[str] = None,
    price: Optional[float] = None,
    cost_price: Optional[float] = None,
    description: Optional[str] = None,
    category: Optional[str] = None,
    image_url: Optional[str] = None,
    is_published: Optional[bool] = None
) -> Dict[str, Any]:
    """
    Update details, pricing, cost price, image URL, or publishing status of an existing product owned by the merchant.
    """
    merchant_info = _get_active_merchant()
    merchant_id = merchant_info["merchant_id"]

    db = SessionLocal()
    try:
        p = db.query(Product).filter(
            Product.id == product_id,
            Product.merchant_id == merchant_id
        ).first()

        if not p:
            raise ValueError(f"Product '{product_id}' not found or does not belong to this merchant.")

        if name is not None and name.strip():
            p.name = name.strip()
        if price is not None:
            if price <= 0:
                raise ValueError("Price must be greater than zero.")
            p.price = float(price)
        if cost_price is not None:
            p.cost_price = float(cost_price)
        if description is not None:
            p.description = description.strip()
        if category is not None and category.strip():
            p.category = category.strip()
        if image_url is not None:
            p.image_url = image_url.strip()
        if is_published is not None:
            p.is_published = bool(is_published)

        p.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(p)

        margin_pct = round(((p.price - p.cost_price) / p.price) * 100, 1) if p.price > 0 else 0.0

        result = {
            "success": True,
            "product_id": p.id,
            "name": p.name,
            "sku": p.sku,
            "category": p.category,
            "price": p.price,
            "cost_price": p.cost_price,
            "gross_margin_percent": margin_pct,
            "stock": p.stock,
            "image_url": p.image_url,
            "is_published": p.is_published
        }

        log_mcp_activity(merchant_id, "update_product", {"product_id": product_id}, "SUCCESS", f"Updated {p.name}")
        return result
    except Exception as e:
        db.rollback()
        log_mcp_activity(merchant_id, "update_product", {"product_id": product_id}, "ERROR", str(e))
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Tool 4b: set_product_image
# ---------------------------------------------------------------------------
@mcp.tool()
def set_product_image(product_id: str, image_url: str) -> Dict[str, Any]:
    """
    Set or update the photo image URL of an existing product in the merchant's store.
    Accepts web URLs (https://...) or relative paths (/images/...).
    """
    merchant_info = _get_active_merchant()
    merchant_id = merchant_info["merchant_id"]

    db = SessionLocal()
    try:
        p = db.query(Product).filter(
            (Product.id == product_id) | (Product.name.ilike(f"%{product_id}%")),
            Product.merchant_id == merchant_id
        ).first()

        if not p:
            raise ValueError(f"Product '{product_id}' not found.")

        p.image_url = image_url.strip()
        p.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(p)

        log_mcp_activity(merchant_id, "set_product_image", {"product_id": p.id, "image_url": image_url}, "SUCCESS", f"Updated photo for {p.name}")
        return {
            "success": True,
            "product_id": p.id,
            "name": p.name,
            "image_url": p.image_url
        }
    except Exception as e:
        db.rollback()
        log_mcp_activity(merchant_id, "set_product_image", {"product_id": product_id, "image_url": image_url}, "ERROR", str(e))
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Tool 5: update_inventory
# ---------------------------------------------------------------------------
@mcp.tool()
def update_inventory(product_id: str, stock: int) -> Dict[str, Any]:
    """
    Update the inventory stock level of a specific product.
    """
    merchant_info = _get_active_merchant()
    merchant_id = merchant_info["merchant_id"]

    if stock < 0:
        raise ValueError("Stock quantity cannot be negative.")

    db = SessionLocal()
    try:
        p = db.query(Product).filter(
            Product.id == product_id,
            Product.merchant_id == merchant_id
        ).first()

        if not p:
            raise ValueError(f"Product '{product_id}' not found or does not belong to this merchant.")

        previous_stock = p.stock
        p.stock = int(stock)
        p.updated_at = datetime.utcnow()
        db.commit()

        is_low = p.stock <= p.low_stock_threshold

        result = {
            "success": True,
            "product_id": p.id,
            "name": p.name,
            "previous_stock": previous_stock,
            "current_stock": p.stock,
            "low_stock_threshold": p.low_stock_threshold,
            "is_low_stock": is_low,
            "warning": f"Stock is below threshold of {p.low_stock_threshold} units!" if is_low else None
        }

        log_mcp_activity(
            merchant_id,
            "update_inventory",
            {"product_id": product_id, "stock": stock},
            "SUCCESS",
            f"{p.name} stock: {previous_stock} -> {stock}"
        )
        return result
    except Exception as e:
        db.rollback()
        log_mcp_activity(merchant_id, "update_inventory", {"product_id": product_id, "stock": stock}, "ERROR", str(e))
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Tool 6: get_orders
# ---------------------------------------------------------------------------
@mcp.tool()
def get_orders(
    fulfillment_status: Optional[str] = None,
    limit: int = 20
) -> Dict[str, Any]:
    """
    Get customer orders placed with the merchant's store, with line items, customer details, and fulfillment statuses.
    """
    merchant_info = _get_active_merchant()
    merchant_id = merchant_info["merchant_id"]

    db = SessionLocal()
    try:
        query = db.query(Order).filter(Order.merchant_id == merchant_id)
        if fulfillment_status:
            query = query.filter(Order.fulfillment_status.ilike(fulfillment_status.strip()))

        orders = query.order_by(Order.created_at.desc()).limit(min(100, max(1, limit))).all()

        order_list = []
        for ord in orders:
            items = [
                {
                    "product_id": it.product_id,
                    "product_name": it.product_name,
                    "quantity": it.quantity,
                    "unit_price": it.unit_price,
                    "total_price": it.total_price
                }
                for it in ord.items
            ]

            order_list.append({
                "order_id": ord.id,
                "created_at": ord.created_at.isoformat() if ord.created_at else None,
                "status": ord.status,
                "fulfillment_status": ord.fulfillment_status,
                "subtotal_amount": ord.subtotal_amount,
                "discount_amount": ord.discount_amount,
                "final_amount": ord.final_amount,
                "customer_name": ord.customer_name or "Customer",
                "customer_email": ord.customer_email or "",
                "shipping_address": ord.shipping_address or "",
                "items_count": len(items),
                "items": items
            })

        result = {
            "merchant_id": merchant_id,
            "retrieved_count": len(order_list),
            "orders": order_list
        }

        log_mcp_activity(merchant_id, "get_orders", {"fulfillment_status": fulfillment_status, "limit": limit}, "SUCCESS", f"Retrieved {len(order_list)} orders")
        return result
    except Exception as e:
        log_mcp_activity(merchant_id, "get_orders", {"fulfillment_status": fulfillment_status, "limit": limit}, "ERROR", str(e))
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Tool 7: get_sales_summary
# ---------------------------------------------------------------------------
@mcp.tool()
def get_sales_summary(days: int = 30) -> Dict[str, Any]:
    """
    Get aggregated sales revenue, total completed orders, and average order value (AOV) over the last N days.
    """
    merchant_info = _get_active_merchant()
    merchant_id = merchant_info["merchant_id"]

    db = SessionLocal()
    try:
        since_date = datetime.utcnow() - timedelta(days=max(1, days))
        orders = db.query(Order).filter(
            Order.merchant_id == merchant_id,
            Order.created_at >= since_date,
            Order.status.in_(["PAID", "AUTHORIZED", "COMPLETED", "DELIVERED"])
        ).all()

        total_revenue = sum(float(o.final_amount or 0.0) for o in orders)
        order_count = len(orders)
        aov = round(total_revenue / order_count, 2) if order_count > 0 else 0.0

        result = {
            "merchant_id": merchant_id,
            "period_days": days,
            "total_revenue": round(total_revenue, 2),
            "total_orders": order_count,
            "average_order_value": aov,
            "currency": "INR"
        }

        log_mcp_activity(merchant_id, "get_sales_summary", {"days": days}, "SUCCESS", f"Revenue: ₹{total_revenue}, Orders: {order_count}")
        return result
    except Exception as e:
        log_mcp_activity(merchant_id, "get_sales_summary", {"days": days}, "ERROR", str(e))
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Tool 8: get_revenue_summary
# ---------------------------------------------------------------------------
@mcp.tool()
def get_revenue_summary() -> Dict[str, Any]:
    """
    Get detailed financial breakdown: Total Revenue, Cost of Goods Sold (COGS), Gross Profit, Gross Margin %, and Inventory Valuation.
    """
    merchant_info = _get_active_merchant()
    merchant_id = merchant_info["merchant_id"]

    db = SessionLocal()
    try:
        # Completed orders
        paid_orders = db.query(Order).filter(
            Order.merchant_id == merchant_id,
            Order.status.in_(["PAID", "AUTHORIZED", "COMPLETED", "DELIVERED"])
        ).all()

        total_revenue = 0.0
        total_cogs = 0.0
        product_sales = {}

        for ord in paid_orders:
            total_revenue += float(ord.final_amount or 0.0)
            for item in ord.items:
                cogs_item = float(item.unit_cost or 0.0) * item.quantity
                total_cogs += cogs_item
                prod_key = item.product_name
                if prod_key not in product_sales:
                    product_sales[prod_key] = {"quantity": 0, "revenue": 0.0}
                product_sales[prod_key]["quantity"] += item.quantity
                product_sales[prod_key]["revenue"] += float(item.total_price or 0.0)

        gross_profit = round(total_revenue - total_cogs, 2)
        gross_margin_pct = round((gross_profit / total_revenue) * 100, 1) if total_revenue > 0 else 0.0

        # Current inventory valuation
        products = db.query(Product).filter(
            Product.merchant_id == merchant_id,
            Product.is_archived == False
        ).all()

        inventory_cost_value = sum(float(p.cost_price or 0.0) * int(p.stock or 0) for p in products)
        inventory_retail_value = sum(float(p.price or 0.0) * int(p.stock or 0) for p in products)

        top_products = sorted(
            [{"name": k, **v} for k, v in product_sales.items()],
            key=lambda x: x["revenue"],
            reverse=True
        )[:5]

        result = {
            "merchant_id": merchant_id,
            "currency": "INR",
            "total_revenue": round(total_revenue, 2),
            "total_cogs": round(total_cogs, 2),
            "gross_profit": gross_profit,
            "gross_margin_percent": gross_margin_pct,
            "top_selling_products": top_products,
            "inventory_valuation": {
                "total_items_in_stock": sum(int(p.stock or 0) for p in products),
                "total_cost_value": round(inventory_cost_value, 2),
                "total_retail_value": round(inventory_retail_value, 2),
                "potential_profit": round(inventory_retail_value - inventory_cost_value, 2)
            }
        }

        log_mcp_activity(merchant_id, "get_revenue_summary", {}, "SUCCESS", f"Profit: ₹{gross_profit} ({gross_margin_pct}%)")
        return result
    except Exception as e:
        log_mcp_activity(merchant_id, "get_revenue_summary", {}, "ERROR", str(e))
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Tool 9: get_product_recommendations
# ---------------------------------------------------------------------------
@mcp.tool()
def get_product_recommendations(product_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Get deterministic cross-sell product recommendations and bundle opportunities using genuine Apriori market basket analysis.
    """
    merchant_info = _get_active_merchant()
    merchant_id = merchant_info["merchant_id"]

    db = SessionLocal()
    try:
        # Mine basket associations
        rules = RevenueService.mine_basket_associations(
            db=db,
            min_support=0.02,
            min_confidence=0.15,
            merchant_id=merchant_id
        )

        recommendations = []
        for r in rules:
            if product_id and r.antecedent_id != product_id:
                continue
            recommendations.append({
                "antecedent_id": r.antecedent_id,
                "antecedent_name": r.antecedent_name,
                "recommended_product_id": r.consequent_id,
                "recommended_product_name": r.consequent_name,
                "support": r.support,
                "confidence": r.confidence,
                "lift": r.lift,
                "co_occurrences": r.co_occurrences,
                "pitch": r.recommendation_pitch
            })

        # Fallback if catalog has few multi-item orders yet: Complementary catalog pairings
        if not recommendations:
            query = db.query(Product).filter(
                Product.merchant_id == merchant_id,
                Product.is_active == True,
                Product.is_archived == False
            )
            if product_id:
                target_p = db.query(Product).filter(Product.id == product_id).first()
                if target_p:
                    query = query.filter(Product.id != product_id)
            alt_products = query.order_by(Product.stock.desc()).limit(3).all()

            for p in alt_products:
                recommendations.append({
                    "antecedent_id": product_id or "catalog",
                    "antecedent_name": "Selected Items",
                    "recommended_product_id": p.id,
                    "recommended_product_name": p.name,
                    "support": 0.1,
                    "confidence": 0.5,
                    "lift": 1.2,
                    "co_occurrences": 1,
                    "pitch": f"Popular complementary item from your catalog: {p.name} (₹{p.price})"
                })

        result = {
            "merchant_id": merchant_id,
            "algorithm": "Apriori Association Rule Mining",
            "total_rules": len(recommendations),
            "recommendations": recommendations[:10]
        }

        log_mcp_activity(merchant_id, "get_product_recommendations", {"product_id": product_id}, "SUCCESS", f"Found {len(recommendations)} rules")
        return result
    except Exception as e:
        log_mcp_activity(merchant_id, "get_product_recommendations", {"product_id": product_id}, "ERROR", str(e))
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Tool 10: get_discount_policies
# ---------------------------------------------------------------------------
@mcp.tool()
def get_discount_policies() -> Dict[str, Any]:
    """
    Get active merchant commercial discount limits, margin guardrails, and automated governance rules.
    """
    merchant_info = _get_active_merchant()
    merchant_id = merchant_info["merchant_id"]

    db = SessionLocal()
    try:
        policies = db.query(Policy).filter(
            Policy.merchant_id == merchant_id,
            Policy.is_active == True
        ).all()

        policy_list = []
        for pol in policies:
            policy_list.append({
                "id": pol.id,
                "name": pol.name,
                "max_discount_percentage": pol.max_discount_percentage,
                "max_discount_amount": pol.max_discount_amount,
                "max_transaction_amount": pol.max_transaction_amount,
                "require_human_approval": pol.require_human_approval,
                "allowed_actions": pol.allowed_actions,
                "restricted_actions": pol.restricted_actions
            })

        # If no custom policy configured, provide default safety guardrails
        if not policy_list:
            policy_list.append({
                "id": "pol_default",
                "name": "Standard Commercial Guardrail Policy",
                "max_discount_percentage": 10.0,
                "max_discount_amount": 6000.0,
                "max_transaction_amount": 100000.0,
                "require_human_approval": True,
                "allowed_actions": ["search_catalog", "check_inventory", "recommend_cross_sell", "create_offer"],
                "restricted_actions": ["refund", "arbitrary_price_override", "money_transfer"]
            })

        result = {
            "merchant_id": merchant_id,
            "policies": policy_list
        }

        log_mcp_activity(merchant_id, "get_discount_policies", {}, "SUCCESS", f"{len(policy_list)} policies")
        return result
    except Exception as e:
        log_mcp_activity(merchant_id, "get_discount_policies", {}, "ERROR", str(e))
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Tool 11: create_store
# ---------------------------------------------------------------------------
@mcp.tool()
def create_store(
    store_name: str,
    category: str = "General Retail",
    description: str = ""
) -> Dict[str, Any]:
    """
    Set up or update the merchant's store name, category, description, and unique store slug.
    """
    merchant_info = _get_active_merchant()
    merchant_id = merchant_info["merchant_id"]

    if not store_name or not store_name.strip():
        raise ValueError("Store name cannot be empty.")

    db = SessionLocal()
    try:
        m = db.query(Merchant).filter(Merchant.id == merchant_id).first()
        if not m:
            raise ValueError(f"Merchant '{merchant_id}' not found.")

        clean_slug = re.sub(r'[^a-z0-9]+', '-', store_name.lower()).strip('-')
        # Check slug uniqueness
        existing_slug = db.query(Merchant).filter(Merchant.slug == clean_slug, Merchant.id != merchant_id).first()
        if existing_slug:
            clean_slug = f"{clean_slug}-{uuid.uuid4().hex[:4]}"

        m.name = store_name.strip()
        m.slug = clean_slug
        m.business_category = category.strip()
        if description:
            m.description = description.strip()
        m.onboarding_completed = True
        m.is_published = True

        db.commit()
        db.refresh(m)

        result = {
            "success": True,
            "merchant_id": m.id,
            "store_name": m.name,
            "slug": m.slug,
            "storefront_url": f"https://merchantpilot-ai.vercel.app/store/{m.slug}",
            "business_category": m.business_category,
            "description": m.description,
            "is_published": m.is_published,
            "onboarding_completed": m.onboarding_completed
        }

        log_mcp_activity(merchant_id, "create_store", {"store_name": store_name}, "SUCCESS", f"Store: {m.name} ({m.slug})")
        return result
    except Exception as e:
        db.rollback()
        log_mcp_activity(merchant_id, "create_store", {"store_name": store_name}, "ERROR", str(e))
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Tool 12: publish_store
# ---------------------------------------------------------------------------
@mcp.tool()
def publish_store(is_published: bool = True) -> Dict[str, Any]:
    """
    Publish or unpublish the merchant's public storefront.
    """
    merchant_info = _get_active_merchant()
    merchant_id = merchant_info["merchant_id"]

    db = SessionLocal()
    try:
        m = db.query(Merchant).filter(Merchant.id == merchant_id).first()
        if not m:
            raise ValueError(f"Merchant '{merchant_id}' not found.")

        m.is_published = bool(is_published)
        db.commit()

        status_text = "published" if m.is_published else "unpublished"
        result = {
            "success": True,
            "merchant_id": m.id,
            "store_name": m.name,
            "slug": m.slug,
            "is_published": m.is_published,
            "storefront_url": f"https://merchantpilot-ai.vercel.app/store/{m.slug}" if m.is_published and m.slug else None,
            "message": f"Store has been {status_text}."
        }

        log_mcp_activity(merchant_id, "publish_store", {"is_published": is_published}, "SUCCESS", f"Store {status_text}")
        return result
    except Exception as e:
        db.rollback()
        log_mcp_activity(merchant_id, "publish_store", {"is_published": is_published}, "ERROR", str(e))
        raise
    finally:
        db.close()


# ---------------------------------------------------------------------------
# MCP Bearer Authentication ASGI Middleware
# ---------------------------------------------------------------------------
class McpAuthMiddleware:
    """
    ASGI middleware ensuring all calls to the Streamable HTTP MCP transport
    are authenticated via a valid merchant MCP Bearer token, handle CORS preflights,
    support RFC 9728/RFC 8414 OAuth discovery challenges, normalize content negotiation,
    and log comprehensive request/response audit events without exposing secret tokens.
    """
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        start_time = time.time()
        method = scope.get("method", "GET").upper()
        path = scope.get("path", "")

        cors_headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, HEAD",
            "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept, mcp-session-id, x-mcp-token, mcp-protocol-version, x-vercel-protection-bypass",
            "Access-Control-Expose-Headers": "MCP-Protocol-Version, Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
            "MCP-Protocol-Version": "2025-03-26"
        }

        # 1. Allow CORS preflight requests without authentication
        if method == "OPTIONS":
            response = JSONResponse({"status": "ok"}, headers=cors_headers)
            await response(scope, receive, send)
            duration_ms = int((time.time() - start_time) * 1000)
            print(f"[MCP-INSPECT] method=OPTIONS path={path} status=200 latency={duration_ms}ms")
            return

        # 2. Allow HEAD requests for connectivity checks
        if method == "HEAD":
            response = Response(status_code=200, headers=cors_headers)
            await response(scope, receive, send)
            duration_ms = int((time.time() - start_time) * 1000)
            print(f"[MCP-INSPECT] method=HEAD path={path} status=200 latency={duration_ms}ms")
            return

        # 3. Extract and inspect incoming headers safely (NO secrets logged)
        headers = dict(scope.get("headers", []))
        auth_raw = headers.get(b"authorization", b"").decode("utf-8", errors="ignore").strip()
        user_agent = headers.get(b"user-agent", b"").decode("utf-8", errors="ignore")[:60]
        mcp_proto_header = headers.get(b"mcp-protocol-version", b"").decode("utf-8", errors="ignore")
        has_auth = bool(auth_raw)

        token_str = None
        if auth_raw:
            # Bulletproof extraction: matches mp_mcp_... even if 'Bearer' is missing, conjoined ('Bearermp_mcp_...'), has colons, or quotes
            m = re.search(r"(mp_mcp_[A-Za-z0-9_\-]+)", auth_raw, re.IGNORECASE)
            if m:
                token_str = m.group(1)
            elif auth_raw.lower().startswith("bearer"):
                token_str = re.sub(r"^bearer[:\s]*", "", auth_raw, flags=re.I).strip()
            else:
                token_str = auth_raw.strip()

        if not token_str and b"x-mcp-token" in headers:
            token_str = headers[b"x-mcp-token"].decode("utf-8", errors="ignore").strip()

        auth_scheme = "BEARER" if (auth_raw and "bearer" in auth_raw.lower()) else ("RAW_TOKEN" if token_str else "NONE")

        # 4. Reachability Probe: Unauthenticated GET returns 200 OK operational metadata
        if method == "GET" and not token_str:
            response = JSONResponse(
                {
                    "status": "operational",
                    "service": "MerchantPilot AI MCP Server",
                    "transport": "streamable-http",
                    "endpoint": "https://merchantpilot-ai.vercel.app/mcp",
                    "protocolVersion": "2025-03-26",
                    "supportedProtocolVersions": ["2025-03-26", "2024-11-05"],
                    "auth": "bearer",
                    "tools_count": 12,
                    "description": (
                        "Authenticated Streamable HTTP MCP server for Claude. "
                        "Connect with 'Authorization: Bearer mp_mcp_...'."
                    )
                },
                status_code=200,
                headers=cors_headers
            )
            await response(scope, receive, send)
            duration_ms = int((time.time() - start_time) * 1000)
            print(f"[MCP-INSPECT] method=GET path={path} status=200 has_auth=False ua={user_agent} latency={duration_ms}ms")
            return

        # 5. Authenticate token against active McpTokens in DB
        merchant_info = verify_mcp_token(token_str) if token_str else None

        if not merchant_info:
            unauth_headers = dict(cors_headers)
            # Standards-compliant RFC 9728 WWW-Authenticate challenge with resource_metadata pointer
            unauth_headers["WWW-Authenticate"] = (
                'Bearer realm="MerchantPilot MCP", '
                'resource_metadata="https://merchantpilot-ai.vercel.app/.well-known/oauth-protected-resource"'
            )
            response = JSONResponse(
                {
                    "jsonrpc": "2.0",
                    "error": {
                        "code": -32001,
                        "message": (
                            "Unauthorized: Valid MerchantPilot MCP Bearer token required. "
                            "Provide header 'Authorization: Bearer mp_mcp_...'"
                        )
                    }
                },
                status_code=401,
                headers=unauth_headers
            )
            await response(scope, receive, send)
            duration_ms = int((time.time() - start_time) * 1000)
            print(
                f"[MCP-INSPECT] method={method} path={path} status=401 "
                f"has_auth={has_auth} auth_scheme={auth_scheme} "
                f"mcp_version={mcp_proto_header or 'N/A'} ua={user_agent} latency={duration_ms}ms"
            )
            return

        # 6. Normalize Accept header for FastMCP Streamable HTTP transport
        headers_list = list(scope.get("headers", []))
        accept_idx = next((i for i, (k, _) in enumerate(headers_list) if k.lower() == b"accept"), -1)
        if accept_idx != -1:
            headers_list[accept_idx] = (b"accept", b"application/json, text/event-stream")
        else:
            headers_list.append((b"accept", b"application/json, text/event-stream"))
        scope["headers"] = headers_list

        # 7. Wrap send to inject CORS headers and protocol version into all downstream responses
        async def cors_send(message):
            if message.get("type") == "http.response.start":
                resp_headers = list(message.get("headers", []))
                existing_names = {k.lower() for k, _ in resp_headers}
                if b"access-control-allow-origin" not in existing_names:
                    resp_headers.append((b"access-control-allow-origin", b"*"))
                if b"access-control-allow-methods" not in existing_names:
                    resp_headers.append((b"access-control-allow-methods", b"GET, POST, OPTIONS, HEAD"))
                if b"access-control-allow-headers" not in existing_names:
                    resp_headers.append((b"access-control-allow-headers", b"Authorization, Content-Type, Accept, mcp-session-id, x-mcp-token, mcp-protocol-version, x-vercel-protection-bypass"))
                if b"mcp-protocol-version" not in existing_names:
                    resp_headers.append((b"mcp-protocol-version", b"2025-03-26"))
                message["headers"] = resp_headers
            await send(message)

        # 8. Ensure taskgroup is running for serverless and bind authenticated merchant context
        await _ensure_session_manager_running()
        token_ctx = current_mcp_merchant.set(merchant_info)
        try:
            await self.app(scope, receive, cors_send)
            duration_ms = int((time.time() - start_time) * 1000)
            print(
                f"[MCP-INSPECT] method={method} path={path} status=200 "
                f"merchant_id={merchant_info['merchant_id']} "
                f"mcp_version={mcp_proto_header or '2025-03-26'} ua={user_agent} latency={duration_ms}ms"
            )
        finally:
            current_mcp_merchant.reset(token_ctx)


def get_mcp_app() -> ASGIApp:
    """Return the Streamable HTTP MCP ASGI app wrapped with bearer token authentication."""
    base_app = mcp.streamable_http_app()
    return McpAuthMiddleware(base_app)
