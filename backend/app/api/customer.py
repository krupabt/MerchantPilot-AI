from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from pydantic import BaseModel, Field

from backend.app.database import get_db
from backend.app.api.deps import get_current_customer
from backend.app.models.user import User
from backend.app.services.customer_service import CustomerService

router = APIRouter(prefix="/customer", tags=["Customer Storefront & Cart"])

class CartItemAddRequest(BaseModel):
    product_id: str = Field(..., description="Target product ID to add to cart")
    quantity: int = Field(default=1, ge=1, description="Quantity to add")
    force_replace: bool = Field(default=False, description="Replace cart items if from different merchant")

class CartItemUpdateRequest(BaseModel):
    quantity: int = Field(..., ge=0, description="New quantity (0 to remove)")

# ----------------- Cart Management -----------------

@router.get("/cart", summary="Get Customer's Persistent Cart")
def get_cart(
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    return CustomerService.get_cart_payload(db, current_user.id)

@router.post("/cart/items", summary="Add Item to Cart")
def add_to_cart(
    request: CartItemAddRequest,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    try:
        return CustomerService.add_to_cart(
            db=db,
            user_id=current_user.id,
            product_id=request.product_id,
            quantity=request.quantity,
            force_replace=request.force_replace
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.put("/cart/items/{item_id}", summary="Update Cart Item Quantity")
def update_cart_item(
    item_id: str,
    request: CartItemUpdateRequest,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    try:
        return CustomerService.update_cart_item(
            db=db,
            user_id=current_user.id,
            item_id=item_id,
            quantity=request.quantity
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/cart/items/{item_id}", summary="Remove Item from Cart")
def remove_cart_item(
    item_id: str,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    return CustomerService.remove_cart_item(
        db=db,
        user_id=current_user.id,
        item_id=item_id
    )

@router.delete("/cart", summary="Clear Entire Cart")
def clear_cart(
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    return CustomerService.clear_cart(db, current_user.id)

# ----------------- Customer Orders -----------------

@router.get("/orders", summary="Get Customer Past Orders")
def get_customer_orders(
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    return CustomerService.get_customer_orders(db, current_user)

@router.get("/orders/{order_id}", summary="Get Customer Order Details")
def get_customer_order_details(
    order_id: str,
    current_user: User = Depends(get_current_customer),
    db: Session = Depends(get_db)
):
    try:
        return CustomerService.get_customer_order_details(db, current_user, order_id)
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
