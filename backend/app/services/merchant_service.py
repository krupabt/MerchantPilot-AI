import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_

from backend.app.models.product import Product
from backend.app.models.category import Category
from backend.app.models.order import Order, OrderItem
from backend.app.models.payment import Payment
from backend.app.models.audit import AuditLog
from backend.app.models.user import User
from backend.app.schemas.merchant import (
    ProductCreateRequest, ProductUpdateRequest, CategoryCreateRequest,
    MerchantStatsResponse, TopProductResponse, RevenueTrendItem
)

class MerchantService:
    @staticmethod
    def get_merchant_stats(db: Session, merchant_id: str = "m_1001") -> Dict[str, Any]:
        """
        Calculates 100% database-derived analytics for the authenticated merchant.
        Zero mock data or fabricated numbers.
        """
        # 1. Total revenue from verified paid orders
        total_rev_scalar = db.query(func.sum(Order.final_amount)).filter(
            Order.merchant_id == merchant_id,
            Order.status.in_(["PAID", "AUTHORIZED"])
        ).scalar()
        total_revenue = round(float(total_rev_scalar or 0.0), 2)

        # 2. Order counts
        total_orders = db.query(Order).filter(Order.merchant_id == merchant_id).count()
        pending_orders = db.query(Order).filter(
            Order.merchant_id == merchant_id,
            Order.status == "PENDING"
        ).count()
        completed_orders = db.query(Order).filter(
            Order.merchant_id == merchant_id,
            Order.status.in_(["PAID", "AUTHORIZED"])
        ).count()

        # 3. Average Order Value (AOV)
        aov = round(total_revenue / completed_orders, 2) if completed_orders > 0 else 0.0

        # 4. Inventory counts
        out_of_stock_count = db.query(Product).filter(
            Product.merchant_id == merchant_id,
            Product.is_active == True,
            Product.stock <= 0
        ).count()

        low_stock_query = db.query(Product).filter(
            Product.merchant_id == merchant_id,
            Product.is_active == True,
            Product.stock > 0,
            Product.stock <= Product.low_stock_threshold
        ).all()
        low_stock_count = len(low_stock_query)

        low_stock_products = [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "stock": p.stock,
                "low_stock_threshold": p.low_stock_threshold,
                "price": p.price
            }
            for p in low_stock_query[:10]
        ]

        # 5. Top-selling products derived from OrderItem
        top_items = (
            db.query(
                OrderItem.product_id,
                OrderItem.product_name,
                func.sum(OrderItem.quantity).label("total_qty"),
                func.sum(OrderItem.total_price).label("total_sales")
            )
            .join(Order, Order.id == OrderItem.order_id)
            .filter(
                Order.merchant_id == merchant_id,
                Order.status.in_(["PAID", "AUTHORIZED"])
            )
            .group_by(OrderItem.product_id, OrderItem.product_name)
            .order_by(desc("total_qty"))
            .limit(5)
            .all()
        )

        top_selling_products = []
        for pid, pname, t_qty, t_sales in top_items:
            prod = db.query(Product).filter(Product.id == pid).first()
            top_selling_products.append({
                "product_id": pid,
                "name": pname,
                "category": prod.category if prod else "General",
                "price": prod.price if prod else 0.0,
                "units_sold": int(t_qty or 0),
                "total_revenue": round(float(t_sales or 0.0), 2),
                "current_stock": prod.stock if prod else 0
            })

        # 6. Real database-derived 7-day revenue trend
        today = datetime.utcnow().date()
        daily_map = {}
        for d in range(6, -1, -1):
            target_date = today - timedelta(days=d)
            date_str = target_date.strftime("%Y-%m-%d")
            daily_map[date_str] = {
                "date": date_str,
                "day": target_date.strftime("%a"),
                "revenue": 0.0,
                "orders_count": 0
            }

        # Query orders in date range
        start_dt = datetime.combine(today - timedelta(days=6), datetime.min.time())
        paid_orders_recent = db.query(Order).filter(
            Order.merchant_id == merchant_id,
            Order.status.in_(["PAID", "AUTHORIZED"]),
            Order.created_at >= start_dt
        ).all()

        for o in paid_orders_recent:
            if o.created_at:
                o_date_str = o.created_at.date().strftime("%Y-%m-%d")
                if o_date_str in daily_map:
                    daily_map[o_date_str]["revenue"] += o.final_amount
                    daily_map[o_date_str]["orders_count"] += 1

        revenue_trend = [
            {
                "date": v["date"],
                "day": v["day"],
                "revenue": round(v["revenue"], 2),
                "orders_count": v["orders_count"]
            }
            for v in daily_map.values()
        ]

        # 7. Recent orders for this merchant
        recent_orders_db = (
            db.query(Order)
            .filter(Order.merchant_id == merchant_id)
            .order_by(Order.created_at.desc())
            .limit(10)
            .all()
        )

        recent_orders = [
            {
                "id": o.id,
                "customer_name": o.customer_name or "Store Customer",
                "customer_email": o.customer_email or "",
                "amount": o.final_amount,
                "final_amount": o.final_amount,
                "status": o.status,
                "fulfillment_status": o.fulfillment_status or "UNFULFILLED",
                "is_ai_assisted": o.is_ai_assisted,
                "is_bundle": o.is_bundle,
                "bundle_name": o.bundle_name,
                "items_count": len(o.items),
                "created_at": o.created_at.isoformat() if o.created_at else ""
            }
            for o in recent_orders_db
        ]

        return {
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "completed_orders": completed_orders,
            "average_order_value": aov,
            "out_of_stock_count": out_of_stock_count,
            "low_stock_count": low_stock_count,
            "top_selling_products": top_selling_products,
            "low_stock_products": low_stock_products,
            "revenue_trend": revenue_trend,
            "recent_orders": recent_orders
        }

    @staticmethod
    def list_products(
        db: Session,
        merchant_id: str,
        category: Optional[str] = None,
        search: Optional[str] = None,
        stock_filter: Optional[str] = None,
        active_only: bool = False
    ) -> List[Dict[str, Any]]:
        """Lists products belonging strictly to the specified merchant."""
        q = db.query(Product).filter(Product.merchant_id == merchant_id)
        if active_only:
            q = q.filter(Product.is_active == True)
        if category and category.upper() != "ALL":
            q = q.filter(Product.category.ilike(f"%{category}%"))
        if search:
            search_clean = f"%{search.strip()}%"
            q = q.filter(
                Product.name.ilike(search_clean) |
                Product.description.ilike(search_clean) |
                Product.id.ilike(search_clean)
            )
        if stock_filter == "OUT_OF_STOCK":
            q = q.filter(Product.stock <= 0)
        elif stock_filter == "LOW_STOCK":
            q = q.filter(Product.stock > 0, Product.stock <= Product.low_stock_threshold)
        elif stock_filter == "IN_STOCK":
            q = q.filter(Product.stock > 0)

        prods = q.order_by(Product.created_at.desc()).all()
        return [
            {
                "id": p.id,
                "merchant_id": p.merchant_id,
                "category_id": p.category_id,
                "category": p.category,
                "name": p.name,
                "description": p.description,
                "price": p.price,
                "currency": p.currency,
                "stock": p.stock,
                "low_stock_threshold": p.low_stock_threshold,
                "rating": p.rating,
                "image_url": p.image_url,
                "specs": p.specs or {},
                "tags": p.tags or [],
                "compatible_product_ids": p.compatible_product_ids or [],
                "is_active": p.is_active,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in prods
        ]

    @staticmethod
    def create_product(db: Session, merchant_id: str, data: ProductCreateRequest) -> Product:
        # Match or create category
        cat_id = data.category_id
        if not cat_id and data.category:
            cat = db.query(Category).filter(Category.name.ilike(data.category.strip())).first()
            if cat:
                cat_id = cat.id
            else:
                cat_slug = data.category.lower().strip().replace(" ", "-")
                cat = Category(
                    id=f"cat_{uuid.uuid4().hex[:8]}",
                    name=data.category.strip(),
                    slug=cat_slug,
                    description=f"{data.category} collection"
                )
                db.add(cat)
                db.flush()
                cat_id = cat.id

        prod_id = f"P{uuid.uuid4().hex[:6].upper()}"
        new_prod = Product(
            id=prod_id,
            merchant_id=merchant_id,
            category_id=cat_id,
            name=data.name.strip(),
            category=data.category.strip(),
            description=data.description.strip(),
            price=data.price,
            currency=data.currency,
            stock=data.stock,
            low_stock_threshold=data.low_stock_threshold,
            rating=4.5,
            image_url=data.image_url,
            specs=data.specs or {},
            tags=data.tags or [],
            compatible_product_ids=data.compatible_product_ids or [],
            is_active=True
        )
        db.add(new_prod)
        db.commit()
        db.refresh(new_prod)
        return new_prod

    @staticmethod
    def update_product(db: Session, merchant_id: str, product_id: str, data: ProductUpdateRequest) -> Product:
        prod = db.query(Product).filter(
            Product.id == product_id,
            Product.merchant_id == merchant_id
        ).first()
        if not prod:
            raise ValueError(f"Product '{product_id}' not found or you do not have permission to modify it.")

        if data.name is not None:
            prod.name = data.name.strip()
        if data.category is not None:
            prod.category = data.category.strip()
        if data.category_id is not None:
            prod.category_id = data.category_id
        if data.description is not None:
            prod.description = data.description.strip()
        if data.price is not None:
            prod.price = data.price
        if data.stock is not None:
            prod.stock = data.stock
        if data.low_stock_threshold is not None:
            prod.low_stock_threshold = data.low_stock_threshold
        if data.image_url is not None:
            prod.image_url = data.image_url
        if data.specs is not None:
            prod.specs = data.specs
        if data.tags is not None:
            prod.tags = data.tags
        if data.compatible_product_ids is not None:
            prod.compatible_product_ids = data.compatible_product_ids
        if data.is_active is not None:
            prod.is_active = data.is_active

        prod.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(prod)
        return prod

    @staticmethod
    def archive_product(db: Session, merchant_id: str, product_id: str) -> bool:
        prod = db.query(Product).filter(
            Product.id == product_id,
            Product.merchant_id == merchant_id
        ).first()
        if not prod:
            raise ValueError(f"Product '{product_id}' not found or access denied.")
        prod.is_active = False
        prod.updated_at = datetime.utcnow()
        db.commit()
        return True

    @staticmethod
    def update_stock(db: Session, merchant_id: str, product_id: str, new_stock: int) -> Product:
        prod = db.query(Product).filter(
            Product.id == product_id,
            Product.merchant_id == merchant_id
        ).first()
        if not prod:
            raise ValueError(f"Product '{product_id}' not found or access denied.")
        prod.stock = new_stock
        prod.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(prod)
        return prod

    @staticmethod
    def list_orders(
        db: Session,
        merchant_id: str,
        status: Optional[str] = None,
        fulfillment_status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        q = db.query(Order).filter(Order.merchant_id == merchant_id)
        if status:
            q = q.filter(Order.status == status.upper())
        if fulfillment_status:
            q = q.filter(Order.fulfillment_status == fulfillment_status.upper())
        orders = q.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()

        res = []
        for o in orders:
            res.append({
                "id": o.id,
                "customer_name": o.customer_name or "Guest Customer",
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
                "items_count": len(o.items),
                "created_at": o.created_at.isoformat() if o.created_at else None
            })
        return res

    @staticmethod
    def get_order_details(db: Session, merchant_id: str, order_id: str) -> Dict[str, Any]:
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.merchant_id == merchant_id
        ).first()
        if not order:
            raise ValueError(f"Order '{order_id}' not found or access denied.")

        items = [
            {
                "product_id": it.product_id,
                "product_name": it.product_name,
                "quantity": it.quantity,
                "unit_price": it.unit_price,
                "total_price": it.total_price
            }
            for it in order.items
        ]

        payment_info = None
        if order.payment:
            payment_info = {
                "id": order.payment.id,
                "razorpay_order_id": order.payment.razorpay_order_id,
                "razorpay_payment_id": order.payment.razorpay_payment_id,
                "status": order.payment.status,
                "verification_status": order.payment.verification_status,
                "amount": order.payment.amount,
                "created_at": order.payment.created_at.isoformat() if order.payment.created_at else None
            }

        return {
            "id": order.id,
            "merchant_id": order.merchant_id,
            "customer_id": order.customer_id,
            "customer_name": order.customer_name or "Customer",
            "customer_email": order.customer_email or "",
            "customer_phone": order.customer_phone or "",
            "subtotal": order.subtotal_amount,
            "discount": order.discount_amount,
            "final_amount": order.final_amount,
            "currency": order.currency,
            "status": order.status,
            "fulfillment_status": order.fulfillment_status or "UNFULFILLED",
            "is_ai_assisted": order.is_ai_assisted,
            "is_bundle": order.is_bundle,
            "bundle_name": order.bundle_name,
            "items": items,
            "payment": payment_info,
            "created_at": order.created_at.isoformat() if order.created_at else None
        }

    @staticmethod
    def update_fulfillment(db: Session, merchant_id: str, order_id: str, new_status: str) -> Dict[str, Any]:
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.merchant_id == merchant_id
        ).first()
        if not order:
            raise ValueError(f"Order '{order_id}' not found or access denied.")

        valid_statuses = ["UNFULFILLED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
        new_status_clean = new_status.upper().strip()
        if new_status_clean not in valid_statuses:
            raise ValueError(f"Invalid status '{new_status}'. Allowed: {', '.join(valid_statuses)}")

        order.fulfillment_status = new_status_clean
        order.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(order)
        return {
            "order_id": order.id,
            "fulfillment_status": order.fulfillment_status,
            "updated_at": order.updated_at.isoformat() if order.updated_at else None
        }

    @staticmethod
    def list_categories(db: Session) -> List[Dict[str, Any]]:
        cats = db.query(Category).order_by(Category.name.asc()).all()
        return [
            {
                "id": c.id,
                "name": c.name,
                "slug": c.slug,
                "description": c.description
            }
            for c in cats
        ]

    @staticmethod
    def create_category(db: Session, data: CategoryCreateRequest) -> Category:
        slug = data.name.lower().strip().replace(" ", "-")
        existing = db.query(Category).filter(Category.slug == slug).first()
        if existing:
            return existing
        cat = Category(
            id=f"cat_{uuid.uuid4().hex[:8]}",
            name=data.name.strip(),
            slug=slug,
            description=data.description
        )
        db.add(cat)
        db.commit()
        db.refresh(cat)
        return cat
