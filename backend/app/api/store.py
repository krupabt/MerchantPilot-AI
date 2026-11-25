from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Dict, Any

from backend.app.database import get_db
from backend.app.models.merchant import Merchant
from backend.app.models.product import Product

router = APIRouter(tags=["Dynamic Merchant Storefronts"])

def _resolve_merchant(db: Session, store_slug: str) -> Merchant:
    slug_clean = store_slug.lower().strip()
    # Check by slug
    merchant = db.query(Merchant).filter(Merchant.slug == slug_clean).first()
    if not merchant:
        # Check by ID (e.g. m_1001)
        merchant = db.query(Merchant).filter(Merchant.id == store_slug).first()
    if not merchant and slug_clean in ("smart-accessories", "smartaccessories", "default", "shop"):
        merchant = db.query(Merchant).filter(
            (Merchant.id == "m_1001") | (Merchant.email == "merchant@merchantpilot.ai")
        ).first()
    if not merchant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Store '{store_slug}' was not found. Please verify the storefront link."
        )
    return merchant

@router.get("/stores", summary="List All Public Published Stores")
def list_public_stores(db: Session = Depends(get_db)):
    stores = db.query(Merchant).filter(Merchant.is_published == True).all()
    results = []
    for s in stores:
        p_count = db.query(Product).filter(
            Product.merchant_id == s.id,
            Product.is_active == True,
            Product.is_published == True,
            Product.is_archived == False
        ).count()
        results.append({
            "id": s.id,
            "name": s.name,
            "slug": getattr(s, "slug", None) or f"store-{s.id}",
            "business_category": getattr(s, "business_category", "General Retail"),
            "description": getattr(s, "description", None),
            "logo_url": getattr(s, "logo_url", None),
            "product_count": p_count,
            "is_demo": getattr(s, "is_demo", False)
        })
    return {"stores": results, "total": len(results)}

@router.get("/store/{store_slug}", summary="Get Public Storefront Profile")
def get_storefront_profile(store_slug: str, db: Session = Depends(get_db)):
    merchant = _resolve_merchant(db, store_slug)
    
    # Category list
    cats = db.query(Product.category, func.count(Product.id)).filter(
        Product.merchant_id == merchant.id,
        Product.is_active == True,
        Product.is_archived != True
    ).group_by(Product.category).all()

    total_products = sum(c[1] for c in cats)

    return {
        "id": merchant.id,
        "name": merchant.name,
        "store_name": merchant.name,
        "slug": getattr(merchant, "slug", None) or f"store-{merchant.id}",
        "business_category": getattr(merchant, "business_category", "General Retail"),
        "category": getattr(merchant, "business_category", "General Retail"),
        "description": getattr(merchant, "description", None) or f"Welcome to {merchant.name}.",
        "logo_url": getattr(merchant, "logo_url", None),
        "phone": getattr(merchant, "phone", None),
        "address": getattr(merchant, "address", None),
        "currency": merchant.currency or "INR",
        "is_published": getattr(merchant, "is_published", True),
        "is_demo": getattr(merchant, "is_demo", False),
        "categories": [{"name": c[0], "count": c[1]} for c in cats],
        "total_products": total_products
    }

@router.get("/store/{store_slug}/products", summary="Get Public Storefront Products")
def get_storefront_products(
    store_slug: str,
    category: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = Query("featured", description="featured, price_asc, price_desc, rating"),
    db: Session = Depends(get_db)
):
    merchant = _resolve_merchant(db, store_slug)

    q = db.query(Product).filter(
        Product.merchant_id == merchant.id,
        Product.is_active == True,
        Product.is_published != False,
        Product.is_archived != True
    )

    if category and category.lower() != "all":
        q = q.filter(Product.category.ilike(category.strip()))

    if search:
        search_term = f"%{search.strip()}%"
        q = q.filter(
            (Product.name.ilike(search_term)) |
            (Product.description.ilike(search_term)) |
            (Product.category.ilike(search_term))
        )

    if sort_by == "price_asc":
        q = q.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        q = q.order_by(Product.price.desc())
    elif sort_by == "rating":
        q = q.order_by(Product.rating.desc())
    else:
        q = q.order_by(Product.created_at.desc())

    prods = q.all()

    # Sanitized customer output: NO cost_price or internal merchant financials!
    results = []
    for p in prods:
        imgs = getattr(p, "images", None) or ([p.image_url] if p.image_url else [])
        vars_list = getattr(p, "variants", None) or []
        results.append({
            "id": p.id,
            "merchant_id": p.merchant_id,
            "merchant_name": merchant.name,
            "name": p.name,
            "category": p.category,
            "description": p.description,
            "price": p.price,
            "currency": p.currency or "INR",
            "stock": p.stock,
            "low_stock_threshold": p.low_stock_threshold,
            "is_out_of_stock": p.stock <= 0,
            "is_low_stock": 0 < p.stock <= p.low_stock_threshold,
            "rating": p.rating or 4.5,
            "image_url": p.image_url,
            "images": imgs,
            "variants": vars_list,
            "specs": p.specs or {},
            "tags": p.tags or [],
            "compatible_product_ids": p.compatible_product_ids or []
        })

    return {
        "store": {
            "id": merchant.id,
            "name": merchant.name,
            "slug": getattr(merchant, "slug", None) or f"store-{merchant.id}",
            "business_category": getattr(merchant, "business_category", "General Retail")
        },
        "products": results,
        "count": len(results)
    }

@router.get("/store/{store_slug}/categories", summary="Get Public Storefront Categories")
def get_storefront_categories(store_slug: str, db: Session = Depends(get_db)):
    merchant = _resolve_merchant(db, store_slug)

    cats = db.query(Product.category, func.count(Product.id)).filter(
        Product.merchant_id == merchant.id,
        Product.is_active == True,
        Product.is_archived != True
    ).group_by(Product.category).all()

    return {
        "store_slug": merchant.slug,
        "categories": [{"name": c[0], "count": c[1]} for c in cats]
    }
