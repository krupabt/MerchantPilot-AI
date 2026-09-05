from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.models.product import Product
from backend.app.schemas.catalog import ProductResponse

router = APIRouter(prefix="/products", tags=["Merchant Products"])

@router.get("", response_model=List[ProductResponse])
def list_products(
    category: Optional[str] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(Product).filter(Product.is_active == True)
    if category:
        q = q.filter(Product.category.ilike(f"%{category}%"))
    if query:
        q = q.filter(Product.name.ilike(f"%{query}%") | Product.description.ilike(f"%{query}%"))
    return q.all()

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p
