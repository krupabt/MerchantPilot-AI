import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.models.order import Order, OrderItem
from backend.app.models.product import Product
from backend.app.models.merchant import Merchant
from backend.app.models.payment import Payment
from backend.app.models.policy import Policy
from backend.app.models.stock_adjustment import StockAdjustment
from backend.app.models.audit import AuditLog
from backend.app.schemas.sale import CreateSaleRequest, SaleReceiptResponse, SaleItemReceipt

class SaleService:
    @staticmethod
    def record_sale(db: Session, merchant_id: str, request: CreateSaleRequest) -> Dict[str, Any]:
        """
        Records an in-store (POS) sale directly from the merchant's physical shop.
        Atomically validates inventory, enforces commercial policy discount boundaries,
        deducts stock, logs stock adjustment audit trail, and generates an itemized receipt.
        """
        merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
        if not merchant:
            raise ValueError(f"Merchant workspace '{merchant_id}' not found.")

        # Resolve items from request
        items_to_process = request.items or []
        if not items_to_process and request.product_id and request.quantity:
            disc_amt = request.discount_amount or 0.0
            if request.discount_percent and request.discount_percent > 0:
                p_temp = db.query(Product).filter(Product.id == request.product_id, Product.merchant_id == merchant_id).first()
                if p_temp:
                    disc_amt = round((p_temp.price * request.quantity) * (request.discount_percent / 100.0), 2)
            from backend.app.schemas.sale import SaleItemInput
            items_to_process = [SaleItemInput(
                product_id=request.product_id,
                quantity=request.quantity,
                discount_amount=disc_amt
            )]

        if not items_to_process:
            raise ValueError("No sale items provided.")

        # 1. Fetch and validate all products
        order_items_data = []
        total_subtotal = 0.0
        total_cogs = 0.0

        for item_in in items_to_process:
            prod = db.query(Product).filter(
                Product.id == item_in.product_id,
                Product.merchant_id == merchant_id,
                Product.is_active == True
            ).first()
            if not prod:
                raise ValueError(f"Product '{item_in.product_id}' not found in your workspace.")

            if prod.stock < item_in.quantity:
                raise ValueError(
                    f"Insufficient stock for '{prod.name}'. Requested: {item_in.quantity}, Available: {prod.stock} units."
                )

            # Determine unit price (default to product price if not provided)
            unit_price = float(item_in.unit_price if item_in.unit_price is not None else prod.price)
            if unit_price <= 0:
                raise ValueError(f"Invalid unit price for '{prod.name}'.")

            item_total = round(unit_price * item_in.quantity - (item_in.discount_amount or 0.0), 2)
            unit_cost = float(getattr(prod, "cost_price", 0.0) or 0.0)
            item_cogs = round(unit_cost * item_in.quantity, 2)

            total_subtotal += (unit_price * item_in.quantity)
            total_cogs += item_cogs

            order_items_data.append({
                "product": prod,
                "quantity": item_in.quantity,
                "unit_price": unit_price,
                "unit_cost": unit_cost,
                "total_price": item_total
            })

        total_subtotal = round(total_subtotal, 2)
        total_discount = round(float(request.discount_amount or 0.0), 2)
        if total_discount == 0.0 and request.discount_percent and request.discount_percent > 0:
            total_discount = round(total_subtotal * (request.discount_percent / 100.0), 2)

        # 2. Check Commercial Policy Ceiling
        policy = db.query(Policy).filter(Policy.merchant_id == merchant_id, Policy.is_active == True).first()
        max_discount_pct = policy.max_discount_percentage if policy else 10.0
        max_allowed_discount = round(total_subtotal * (max_discount_pct / 100.0), 2)

        if total_discount > max_allowed_discount:
            raise ValueError(
                f"Proposed discount ₹{total_discount:,.2f} exceeds your business policy ceiling of "
                f"{max_discount_pct}% (Maximum allowed: ₹{max_allowed_discount:,.2f})."
            )

        final_amount = max(0.0, round(total_subtotal - total_discount, 2))
        gross_profit = round(final_amount - total_cogs, 2)

        # 3. Create Order
        order_id = f"ord_pos_{uuid.uuid4().hex[:10]}"
        receipt_num = f"REC-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        order = Order(
            id=order_id,
            merchant_id=merchant_id,
            customer_name=request.customer_name or "Walk-in Customer",
            customer_phone=request.customer_phone,
            customer_email=request.customer_email,
            sales_channel="POS",
            payment_method=request.payment_method.upper(),
            payment_reference=request.payment_reference or receipt_num,
            subtotal_amount=total_subtotal,
            discount_amount=total_discount,
            final_amount=final_amount,
            status="PAID",
            fulfillment_status="DELIVERED",
            notes=request.notes,
            created_at=datetime.utcnow()
        )
        db.add(order)
        db.flush()

        # 4. Deduct Stock & Create OrderItems & StockAdjustments
        receipt_items = []
        for it in order_items_data:
            p = it["product"]
            prev_stock = p.stock
            p.stock -= it["quantity"]
            p.updated_at = datetime.utcnow()

            order_item = OrderItem(
                id=f"item_{uuid.uuid4().hex[:10]}",
                order_id=order.id,
                product_id=p.id,
                product_name=p.name,
                quantity=it["quantity"],
                unit_price=it["unit_price"],
                unit_cost=it["unit_cost"],
                total_price=it["total_price"]
            )
            db.add(order_item)

            # Record Stock Adjustment
            adj = StockAdjustment(
                id=f"adj_{uuid.uuid4().hex[:10]}",
                merchant_id=merchant_id,
                product_id=p.id,
                product_name=p.name,
                adjustment_type="SALE",
                quantity_delta=-it["quantity"],
                previous_stock=prev_stock,
                new_stock=p.stock,
                reason=f"POS Sale #{order.id}"
            )
            db.add(adj)

            receipt_items.append({
                "product_id": p.id,
                "product_name": p.name,
                "quantity": it["quantity"],
                "unit_price": it["unit_price"],
                "unit_cost": it["unit_cost"],
                "total_price": it["total_price"]
            })

        # 5. Create Payment Record
        payment = Payment(
            id=f"pay_pos_{uuid.uuid4().hex[:10]}",
            order_id=order.id,
            razorpay_order_id=receipt_num,
            razorpay_payment_id=request.payment_reference or receipt_num,
            amount=final_amount,
            currency="INR",
            status="CAPTURED",
            verification_status="VERIFIED_POS"
        )
        db.add(payment)

        # 6. Audit Log
        audit = AuditLog(
            id=f"aud_{uuid.uuid4().hex[:10]}",
            merchant_id=merchant_id,
            actor="MERCHANT_POS",
            action="record_pos_sale",
            decision="PERMITTED",
            amount=final_amount,
            policy_checked="commercial_discount_limit",
            policy_result="PASSED",
            final_result="SUCCESS",
            input_data={
                "items_count": len(items_to_process),
                "payment_method": request.payment_method,
                "subtotal": total_subtotal,
                "discount": total_discount,
                "final_amount": final_amount,
                "gross_profit": gross_profit
            }
        )
        db.add(audit)

        db.commit()
        db.refresh(order)

        return {
            "success": True,
            "message": "Sale recorded successfully.",
            "order_id": order.id,
            "receipt_number": receipt_num,
            "subtotal": total_subtotal,
            "discount_amount": total_discount,
            "final_amount": final_amount,
            "total_cogs": total_cogs,
            "gross_profit": gross_profit,
            "receipt": {
                "order_id": order.id,
                "receipt_number": receipt_num,
                "merchant_id": merchant.id,
                "merchant_name": merchant.name,
                "sales_channel": "POS",
                "customer_name": order.customer_name,
                "customer_phone": order.customer_phone,
                "customer_email": order.customer_email,
                "items": receipt_items,
                "subtotal": total_subtotal,
                "discount_amount": total_discount,
                "final_amount": final_amount,
                "payment_method": order.payment_method,
                "payment_status": "PAID",
                "payment_reference": order.payment_reference,
                "total_cogs": total_cogs,
                "gross_profit": gross_profit,
                "notes": order.notes,
                "created_at": order.created_at.isoformat()
            }
        }

    @staticmethod
    def list_sales(
        db: Session,
        merchant_id: str,
        channel: Optional[str] = None,
        payment_method: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        q = db.query(Order).filter(Order.merchant_id == merchant_id)
        if channel and channel.upper() != "ALL":
            q = q.filter(Order.sales_channel == channel.upper())
        if payment_method and payment_method.upper() != "ALL":
            q = q.filter(Order.payment_method == payment_method.upper())

        orders = q.order_by(Order.created_at.desc()).offset(offset).limit(limit).all()

        results = []
        for o in orders:
            # Compute COGS and Gross profit
            cogs = sum((item.unit_cost or 0.0) * item.quantity for item in o.items)
            profit = o.final_amount - cogs
            results.append({
                "id": o.id,
                "receipt_number": o.payment_reference or o.id,
                "customer_name": o.customer_name or "Walk-in Customer",
                "customer_phone": o.customer_phone,
                "sales_channel": getattr(o, "sales_channel", "ONLINE"),
                "payment_method": getattr(o, "payment_method", "RAZORPAY"),
                "subtotal": o.subtotal_amount,
                "discount_amount": o.discount_amount,
                "final_amount": o.final_amount,
                "cost_of_goods_sold": round(cogs, 2),
                "gross_profit": round(profit, 2),
                "status": o.status,
                "fulfillment_status": o.fulfillment_status,
                "items_count": len(o.items),
                "created_at": o.created_at.isoformat() if o.created_at else None
            })
        return results

    @staticmethod
    def get_sale_receipt(db: Session, merchant_id: str, order_id: str) -> Dict[str, Any]:
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.merchant_id == merchant_id
        ).first()
        if not order:
            raise ValueError(f"Sale order '{order_id}' not found.")

        merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
        cogs = sum((item.unit_cost or 0.0) * item.quantity for item in order.items)

        items = [
            {
                "product_id": it.product_id,
                "product_name": it.product_name,
                "quantity": it.quantity,
                "unit_price": it.unit_price,
                "unit_cost": getattr(it, "unit_cost", 0.0),
                "total_price": it.total_price
            }
            for it in order.items
        ]

        return {
            "order_id": order.id,
            "receipt_number": order.payment_reference or order.id,
            "merchant_id": merchant_id,
            "merchant_name": merchant.name if merchant else "Merchant Store",
            "business_category": getattr(merchant, "business_category", "Retail"),
            "merchant_phone": getattr(merchant, "phone", ""),
            "merchant_address": getattr(merchant, "address", ""),
            "sales_channel": getattr(order, "sales_channel", "POS"),
            "customer_name": order.customer_name or "Walk-in Customer",
            "customer_phone": order.customer_phone,
            "customer_email": order.customer_email,
            "items": items,
            "subtotal": order.subtotal_amount,
            "discount_amount": order.discount_amount,
            "final_amount": order.final_amount,
            "payment_method": getattr(order, "payment_method", "CASH"),
            "payment_status": order.status,
            "payment_reference": order.payment_reference,
            "total_cogs": round(cogs, 2),
            "gross_profit": round(order.final_amount - cogs, 2),
            "notes": order.notes,
            "created_at": order.created_at.isoformat() if order.created_at else None
        }
