from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from backend.app.models.cart import Cart, CartItem
from backend.app.models.product import Product
from backend.app.models.order import Order, OrderItem
from backend.app.models.user import User

class CustomerService:
    @staticmethod
    def get_or_create_cart(db: Session, user_id: str) -> Cart:
        """Retrieves active persistent cart for authenticated user or creates one."""
        cart = db.query(Cart).filter(Cart.customer_id == user_id).first()
        if not cart:
            cart = Cart(
                id=f"cart_{uuid.uuid4().hex[:10]}",
                customer_id=user_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart

    @staticmethod
    def get_cart_payload(db: Session, user_id: str) -> Dict[str, Any]:
        """Calculates formatted cart details with real-time stock and prices."""
        cart = CustomerService.get_or_create_cart(db, user_id)
        
        items_data = []
        subtotal = 0.0
        total_items_count = 0

        cart_merchant_id = None
        cart_merchant_name = None
        cart_merchant_slug = None

        for item in cart.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product or not product.is_active:
                continue

            if not cart_merchant_id and product.merchant_id:
                cart_merchant_id = product.merchant_id
                from backend.app.models.merchant import Merchant
                m = db.query(Merchant).filter(Merchant.id == product.merchant_id).first()
                if m:
                    cart_merchant_name = m.name
                    cart_merchant_slug = getattr(m, "slug", None) or f"store-{m.id}"

            item_total = item.quantity * item.unit_price
            subtotal += item_total
            total_items_count += item.quantity

            items_data.append({
                "item_id": item.id,
                "product_id": product.id,
                "merchant_id": product.merchant_id,
                "name": product.name,
                "category": product.category,
                "unit_price": item.unit_price,
                "quantity": item.quantity,
                "total_price": item_total,
                "available_stock": product.stock,
                "is_low_stock": product.stock <= (product.low_stock_threshold or 5),
                "is_out_of_stock": product.stock <= 0,
                "image_url": product.image_url,
                "specs": product.specs or {}
            })

        return {
            "cart_id": cart.id,
            "customer_id": user_id,
            "merchant_id": cart_merchant_id,
            "merchant_name": cart_merchant_name,
            "merchant_slug": cart_merchant_slug,
            "items": items_data,
            "total_items": total_items_count,
            "subtotal": round(subtotal, 2),
            "currency": "INR",
            "updated_at": cart.updated_at.isoformat() if cart.updated_at else datetime.utcnow().isoformat()
        }

    @staticmethod
    def add_to_cart(db: Session, user_id: str, product_id: str, quantity: int = 1, force_replace: bool = False) -> Dict[str, Any]:
        """Adds product to cart, validating live stock availability and single-merchant cart boundary."""
        if quantity <= 0:
            raise ValueError("Quantity must be greater than zero.")

        product = db.query(Product).filter(Product.id == product_id).first()
        if not product or not product.is_active:
            raise ValueError(f"Product '{product_id}' not found or inactive.")

        if product.stock <= 0:
            raise ValueError(f"Product '{product.name}' is currently out of stock.")

        cart = CustomerService.get_or_create_cart(db, user_id)

        # Multi-merchant check: only 1 merchant per checkout
        if cart.items:
            first_item = cart.items[0]
            existing_product = db.query(Product).filter(Product.id == first_item.product_id).first()
            if existing_product and existing_product.merchant_id != product.merchant_id:
                if force_replace:
                    # Clear previous merchant's items
                    for it in list(cart.items):
                        db.delete(it)
                    db.flush()
                else:
                    from backend.app.models.merchant import Merchant
                    cur_merch = db.query(Merchant).filter(Merchant.id == existing_product.merchant_id).first()
                    new_merch = db.query(Merchant).filter(Merchant.id == product.merchant_id).first()
                    cur_name = cur_merch.name if cur_merch else "another store"
                    new_name = new_merch.name if new_merch else "this store"
                    raise ValueError(
                        f"Your bag currently contains items from '{cur_name}'. "
                        f"Would you like to clear your bag and start a new order from '{new_name}', "
                        f"or continue shopping at '{cur_name}'?"
                    )

        # Check existing item
        cart_item = db.query(CartItem).filter(
            CartItem.cart_id == cart.id,
            CartItem.product_id == product_id
        ).first()

        current_qty = cart_item.quantity if cart_item else 0
        new_qty = current_qty + quantity

        if new_qty > product.stock:
            raise ValueError(
                f"Cannot add {quantity} item(s). Available stock is {product.stock} (you already have {current_qty} in cart)."
            )

        if cart_item:
            cart_item.quantity = new_qty
            cart_item.unit_price = product.price
            cart_item.updated_at = datetime.utcnow()
        else:
            cart_item = CartItem(
                id=f"ci_{uuid.uuid4().hex[:10]}",
                cart_id=cart.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=product.price,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(cart_item)

        cart.updated_at = datetime.utcnow()
        db.commit()

        return CustomerService.get_cart_payload(db, user_id)

    @staticmethod
    def update_cart_item(db: Session, user_id: str, item_id: str, quantity: int) -> Dict[str, Any]:
        """Updates item quantity or removes if quantity is 0."""
        cart = CustomerService.get_or_create_cart(db, user_id)
        cart_item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id
        ).first()

        if not cart_item:
            raise ValueError(f"Cart item '{item_id}' not found.")

        if quantity <= 0:
            db.delete(cart_item)
            cart.updated_at = datetime.utcnow()
            db.commit()
            return CustomerService.get_cart_payload(db, user_id)

        product = db.query(Product).filter(Product.id == cart_item.product_id).first()
        if not product:
            db.delete(cart_item)
            db.commit()
            raise ValueError("Product no longer available.")

        if quantity > product.stock:
            raise ValueError(f"Cannot set quantity to {quantity}. Available stock is {product.stock}.")

        cart_item.quantity = quantity
        cart_item.unit_price = product.price
        cart_item.updated_at = datetime.utcnow()
        cart.updated_at = datetime.utcnow()
        db.commit()

        return CustomerService.get_cart_payload(db, user_id)

    @staticmethod
    def remove_cart_item(db: Session, user_id: str, item_id: str) -> Dict[str, Any]:
        """Removes a specific line item from user's cart."""
        cart = CustomerService.get_or_create_cart(db, user_id)
        cart_item = db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.cart_id == cart.id
        ).first()

        if cart_item:
            db.delete(cart_item)
            cart.updated_at = datetime.utcnow()
            db.commit()

        return CustomerService.get_cart_payload(db, user_id)

    @staticmethod
    def clear_cart(db: Session, user_id: str) -> Dict[str, Any]:
        """Clears all items from user's cart."""
        cart = CustomerService.get_or_create_cart(db, user_id)
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        cart.updated_at = datetime.utcnow()
        db.commit()
        return CustomerService.get_cart_payload(db, user_id)

    @staticmethod
    def get_customer_orders(db: Session, user: User) -> List[Dict[str, Any]]:
        """Lists all orders belonging to the customer with items, payment, and fulfillment status."""
        query = db.query(Order).filter(
            (Order.customer_id == user.id) | (Order.customer_email == user.email)
        ).order_by(Order.created_at.desc())

        orders = query.all()
        result = []
        for o in orders:
            items_list = []
            for item in o.items:
                items_list.append({
                    "product_id": item.product_id,
                    "product_name": item.product_name,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "total_price": item.total_price
                })

            result.append({
                "id": o.id,
                "created_at": o.created_at.isoformat() if o.created_at else None,
                "status": o.status,
                "fulfillment_status": o.fulfillment_status or "UNFULFILLED",
                "subtotal_amount": o.subtotal_amount,
                "discount_amount": o.discount_amount,
                "final_amount": o.final_amount,
                "currency": o.currency,
                "is_ai_assisted": o.is_ai_assisted,
                "is_bundle": o.is_bundle,
                "bundle_name": o.bundle_name,
                "items": items_list,
                "payment": {
                    "razorpay_order_id": o.payment.razorpay_order_id if o.payment else None,
                    "razorpay_payment_id": o.payment.razorpay_payment_id if o.payment else None,
                    "verification_status": o.payment.verification_status if o.payment else "UNPAID"
                } if o.payment else None
            })

        return result

    @staticmethod
    def get_customer_order_details(db: Session, user: User, order_id: str) -> Dict[str, Any]:
        """Fetches full order details for customer, enforcing ownership."""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError(f"Order '{order_id}' not found.")

        # Check ownership
        if order.customer_id != user.id and order.customer_email != user.email:
            raise PermissionError("Access forbidden: You can only view your own orders.")

        items_list = []
        for item in order.items:
            items_list.append({
                "product_id": item.product_id,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_price": item.total_price
            })

        return {
            "id": order.id,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "customer_name": order.customer_name or user.name,
            "customer_email": order.customer_email or user.email,
            "customer_phone": order.customer_phone or user.phone,
            "status": order.status,
            "fulfillment_status": order.fulfillment_status or "UNFULFILLED",
            "subtotal_amount": order.subtotal_amount,
            "discount_amount": order.discount_amount,
            "final_amount": order.final_amount,
            "currency": order.currency,
            "is_ai_assisted": order.is_ai_assisted,
            "is_bundle": order.is_bundle,
            "bundle_name": order.bundle_name,
            "items": items_list,
            "payment": {
                "razorpay_order_id": order.payment.razorpay_order_id if order.payment else None,
                "razorpay_payment_id": order.payment.razorpay_payment_id if order.payment else None,
                "verification_status": order.payment.verification_status if order.payment else "UNPAID"
            } if order.payment else None
        }
