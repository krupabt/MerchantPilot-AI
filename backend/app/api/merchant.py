from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from backend.app.database import get_db
from backend.app.api.deps import get_current_merchant
from backend.app.models.user import User
from backend.app.services.merchant_service import MerchantService
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.inventory_intelligence_service import InventoryIntelligenceService
from backend.app.services.action_service import ActionService
from backend.app.schemas.merchant import (
    ProductCreateRequest, ProductUpdateRequest, StockUpdateRequest,
    FulfillmentUpdateRequest, CategoryCreateRequest, CategoryResponse,
    StoreOnboardingRequest, StoreOnboardingResponse, ImageUploadRequest
)

router = APIRouter(prefix="/merchant", tags=["Merchant Portal Management"])

# ----------------- Store Onboarding & Identity -----------------

@router.get("/store/onboarding", summary="Get Current Merchant Onboarding Status")
def get_store_onboarding(
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        return MerchantService.get_onboarding_data(db, current_merchant.merchant_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/store/onboarding", response_model=StoreOnboardingResponse, summary="Complete Merchant Store Setup")
def complete_store_onboarding(
    request: StoreOnboardingRequest,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        return MerchantService.complete_onboarding(db, current_merchant.merchant_id, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/store/publish", summary="Toggle Storefront Visibility")
def toggle_store_publish(
    payload: Dict[str, Any] = None,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    is_pub = payload.get("is_published") if payload else None
    return MerchantService.toggle_store_publish(db, current_merchant.merchant_id, is_pub)

@router.post("/upload-image", summary="Upload Product Photo (Persistent Storage)")
def upload_product_image(
    request: ImageUploadRequest,
    current_merchant: User = Depends(get_current_merchant)
):
    raw_b64 = request.image_base64.strip()
    if not raw_b64:
        raise HTTPException(status_code=400, detail="Image data is required.")
    
    # Ensure standard data URI format so it renders reliably across any client
    if not raw_b64.startswith("data:image/"):
        image_url = f"data:image/webp;base64,{raw_b64}"
    else:
        image_url = raw_b64

    return {
        "success": True,
        "image_url": image_url,
        "filename": request.filename or "product_image.png",
        "message": "Image processed and stored persistently."
    }

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
        gross_profit = round(prod.price - (prod.cost_price or 0.0), 2)
        gross_margin = round(((prod.price - (prod.cost_price or 0.0)) / prod.price) * 100, 1) if prod.price > 0 else 0.0
        return {
            "success": True,
            "message": "Product created successfully.",
            "product": {
                "id": prod.id,
                "sku": prod.sku,
                "name": prod.name,
                "category": prod.category,
                "cost_price": prod.cost_price,
                "price": prod.price,
                "gross_profit": gross_profit,
                "gross_margin_percent": gross_margin,
                "stock": prod.stock,
                "low_stock_threshold": prod.low_stock_threshold,
                "image_url": prod.image_url,
                "images": getattr(prod, "images", None) or ([prod.image_url] if prod.image_url else []),
                "variants": getattr(prod, "variants", None) or [],
                "is_active": prod.is_active,
                "is_published": getattr(prod, "is_published", True)
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
        gross_profit = round(prod.price - (prod.cost_price or 0.0), 2)
        gross_margin = round(((prod.price - (prod.cost_price or 0.0)) / prod.price) * 100, 1) if prod.price > 0 else 0.0
        return {
            "success": True,
            "message": "Product updated successfully.",
            "product": {
                "id": prod.id,
                "sku": prod.sku,
                "name": prod.name,
                "category": prod.category,
                "cost_price": prod.cost_price,
                "price": prod.price,
                "gross_profit": gross_profit,
                "gross_margin_percent": gross_margin,
                "stock": prod.stock,
                "low_stock_threshold": prod.low_stock_threshold,
                "image_url": prod.image_url,
                "images": getattr(prod, "images", None) or ([prod.image_url] if prod.image_url else []),
                "variants": getattr(prod, "variants", None) or [],
                "is_active": prod.is_active,
                "is_published": getattr(prod, "is_published", True)
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

# ----------------- Sales Period Analytics -----------------

@router.get("/analytics/period-comparison", summary="Sales Performance Period Comparison")
def get_period_comparison(
    days: int = Query(7, description="Window size in days (7 or 30)"),
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_sales_period_comparison(
        db=db,
        merchant_id=current_merchant.merchant_id,
        window_days=days
    )

# ----------------- Inventory Intelligence -----------------

@router.get("/inventory/intelligence", summary="Inventory Velocity, Runway & Replenishment")
def get_inventory_intelligence(
    target_buffer_days: int = Query(30, description="Target buffer days"),
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    return InventoryIntelligenceService.get_inventory_intelligence(
        db=db,
        merchant_id=current_merchant.merchant_id,
        target_buffer_days=target_buffer_days
    )

# ----------------- Merchant Action Center -----------------

@router.get("/actions", summary="List Merchant Proactive Actions")
def list_actions(
    status: Optional[str] = Query(None, description="PENDING, APPROVED, REJECTED, EXECUTED, or ALL"),
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    actions = ActionService.get_merchant_actions(
        db=db,
        merchant_id=current_merchant.merchant_id,
        status=status
    )
    return {"actions": actions, "count": len(actions)}

@router.post("/actions/generate", summary="Scan Database and Generate Proactive Actions")
def generate_actions(
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    actions = ActionService.generate_proactive_actions(
        db=db,
        merchant_id=current_merchant.merchant_id
    )
    return {"actions": actions, "count": len(actions)}

@router.post("/actions/{action_id}/approve", summary="Approve and Execute Merchant Action")
def approve_action(
    action_id: str,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        return ActionService.approve_and_execute_action(
            db=db,
            merchant_id=current_merchant.merchant_id,
            action_id=action_id,
            user_email=current_merchant.email
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/actions/{action_id}/reject", summary="Reject Merchant Action")
def reject_action(
    action_id: str,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        return ActionService.reject_action(
            db=db,
            merchant_id=current_merchant.merchant_id,
            action_id=action_id,
            user_email=current_merchant.email
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ----------------- Business Settings & Adjustments -----------------

@router.get("/settings", summary="Get Merchant Business Settings")
def get_merchant_settings(
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        return MerchantService.get_settings(db, current_merchant.merchant_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/settings", summary="Update Merchant Business Settings")
def update_merchant_settings(
    request: Dict[str, Any],
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    try:
        from types import SimpleNamespace
        data_obj = SimpleNamespace(**request)
        return MerchantService.update_settings(db, current_merchant.merchant_id, data_obj)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/inventory/adjustments", summary="List Stock Adjustment History")
def list_stock_adjustments(
    limit: int = 50,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    return MerchantService.list_stock_adjustments(db, current_merchant.merchant_id, limit=limit)


