from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from backend.app.database import get_db
from backend.app.api.deps import get_current_merchant
from backend.app.models.user import User
from backend.app.services.merchant_service import MerchantService
from backend.app.schemas.merchant import (
    ProductCreateRequest, ProductUpdateRequest, StockUpdateRequest,
    FulfillmentUpdateRequest, CategoryCreateRequest, CategoryResponse
)

router = APIRouter(prefix="/merchant", tags=["Merchant Portal Management"])

# ----------------- Product Management -----------------

@router.get("/products", summary="List Merchant's Own Products")
def list_merchant_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    stock_status: Optional[str] = Query(None, description="ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK"),
    active_only: bool = False,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    return MerchantService.list_products(
        db=db,
        merchant_id=current_merchant.merchant_id,
        category=category,
        search=search,
        stock_filter=stock_status,
        active_only=active_only
    )

@router.post("/products", status_code=status.HTTP_201_CREATED, summary="Create New Merchant Product")
def create_product(
    request: ProductCreateRequest,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        prod = MerchantService.create_product(db, current_merchant.merchant_id, request)
        return {
            "success": True,
            "message": "Product created successfully.",
            "product": {
                "id": prod.id,
                "name": prod.name,
                "category": prod.category,
                "price": prod.price,
                "stock": prod.stock,
                "is_active": prod.is_active
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/products/{product_id}", summary="Update Existing Merchant Product")
def update_product(
    product_id: str,
    request: ProductUpdateRequest,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        prod = MerchantService.update_product(db, current_merchant.merchant_id, product_id, request)
        return {
            "success": True,
            "message": "Product updated successfully.",
            "product": {
                "id": prod.id,
                "name": prod.name,
                "price": prod.price,
                "stock": prod.stock,
                "is_active": prod.is_active
            }
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/products/{product_id}", summary="Archive Product")
def archive_product(
    product_id: str,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        MerchantService.archive_product(db, current_merchant.merchant_id, product_id)
        return {"success": True, "message": f"Product '{product_id}' archived successfully."}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/products/{product_id}/stock", summary="Update Product Stock Inventory")
def update_stock(
    product_id: str,
    request: StockUpdateRequest,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        prod = MerchantService.update_stock(db, current_merchant.merchant_id, product_id, request.stock)
        return {
            "success": True,
            "message": "Stock updated.",
            "product_id": prod.id,
            "current_stock": prod.stock,
            "is_out_of_stock": prod.stock <= 0,
            "is_low_stock": prod.stock <= prod.low_stock_threshold
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ----------------- Order Management -----------------

@router.get("/orders", summary="List Merchant's Orders")
def list_merchant_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    fulfillment_filter: Optional[str] = Query(None, alias="fulfillment_status"),
    limit: int = 50,
    offset: int = 0,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    return MerchantService.list_orders(
        db=db,
        merchant_id=current_merchant.merchant_id,
        status=status_filter,
        fulfillment_status=fulfillment_filter,
        limit=limit,
        offset=offset
    )

@router.get("/orders/{order_id}", summary="Get Detailed Order Information")
def get_order_details(
    order_id: str,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        return MerchantService.get_order_details(db, current_merchant.merchant_id, order_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/orders/{order_id}/fulfillment", summary="Update Order Fulfillment Status")
def update_fulfillment_status(
    order_id: str,
    request: FulfillmentUpdateRequest,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        return MerchantService.update_fulfillment(
            db=db,
            merchant_id=current_merchant.merchant_id,
            order_id=order_id,
            new_status=request.fulfillment_status
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# ----------------- Category Management -----------------

@router.get("/categories", response_model=List[CategoryResponse], summary="List Product Categories")
def list_categories(db: Session = Depends(get_db)):
    return MerchantService.list_categories(db)

@router.post("/categories", response_model=CategoryResponse, summary="Create Product Category")
def create_category(
    request: CategoryCreateRequest,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    cat = MerchantService.create_category(db, request)
    return CategoryResponse(
        id=cat.id,
        name=cat.name,
        slug=cat.slug,
        description=cat.description,
        created_at=cat.created_at
    )
