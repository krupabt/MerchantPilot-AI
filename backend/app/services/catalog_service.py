from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend.app.models.product import Product
from backend.app.models.merchant import Merchant
from backend.app.schemas.catalog import AgentCatalogResponse, ProductResponse, AvailabilityResponse, AvailabilityItem, MerchantInfo

class CatalogService:
    @staticmethod
    def get_merchant(db: Session, merchant_id: str = "m_1001") -> Merchant:
        merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
        if not merchant:
            merchant = Merchant(id=merchant_id, name="Apex Electronics & Compute", email="admin@apexelectronics.com", currency="INR")
            db.add(merchant)
            db.commit()
            db.refresh(merchant)
        return merchant

    @staticmethod
    def get_agent_catalog(
        db: Session,
        merchant_id: str = "m_1001",
        category: Optional[str] = None,
        in_stock_only: bool = True,
        max_price: Optional[float] = None
    ) -> AgentCatalogResponse:
        merchant = CatalogService.get_merchant(db, merchant_id)
        query = db.query(Product).filter(Product.merchant_id == merchant_id, Product.is_active == True)
        
        if category:
            query = query.filter(Product.category.ilike(f"%{category}%"))
        if in_stock_only:
            query = query.filter(Product.stock > 0)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
            
        products = query.order_by(Product.price.asc()).all()
        categories = list(set([p.category for p in products]))
        
        product_responses = [
            ProductResponse(
                id=p.id,
                name=p.name,
                category=p.category,
                description=p.description,
                price=p.price,
                currency=p.currency,
                stock=p.stock,
                rating=p.rating,
                image_url=p.image_url,
                specs=p.specs or {},
                compatible_product_ids=p.compatible_product_ids or [],
                tags=p.tags or [],
                is_active=p.is_active
            ) for p in products
        ]
        
        return AgentCatalogResponse(
            merchant=MerchantInfo(id=merchant.id, name=merchant.name, currency=merchant.currency),
            count=len(product_responses),
            products=product_responses,
            categories=categories
        )

    @staticmethod
    def get_product_by_id(db: Session, product_id: str) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id, Product.is_active == True).first()

    @staticmethod
    def check_availability(db: Session, product_ids: List[str]) -> AvailabilityResponse:
        products = db.query(Product).filter(Product.id.in_(product_ids)).all()
        found_map = {p.id: p for p in products}
        
        items = []
        all_available = True
        
        for pid in product_ids:
            if pid in found_map:
                prod = found_map[pid]
                is_avail = prod.stock > 0 and prod.is_active
                if not is_avail:
                    all_available = False
                items.append(AvailabilityItem(
                    product_id=prod.id,
                    name=prod.name,
                    available=is_avail,
                    stock=prod.stock,
                    price=prod.price
                ))
            else:
                all_available = False
                items.append(AvailabilityItem(
                    product_id=pid,
                    name="Unknown Product",
                    available=False,
                    stock=0,
                    price=0.0
                ))
                
        return AvailabilityResponse(all_available=all_available, items=items)

    @staticmethod
    def search_products(
        db: Session,
        query_text: str,
        category: Optional[str] = None,
        max_budget: Optional[float] = None,
        limit: int = 10
    ) -> List[Product]:
        """
        Smart catalog search matching keywords against name, description, tags, and hardware specs.
        """
        terms = [t.strip().lower() for t in query_text.split() if len(t.strip()) > 1]
        products = db.query(Product).filter(Product.is_active == True).all()
        
        scored_products = []
        for p in products:
            if max_budget is not None and p.price > max_budget:
                continue
            if category and category.lower() not in p.category.lower():
                continue
                
            score = 0
            searchable_blob = f"{p.name} {p.category} {p.description} {' '.join(p.tags or [])} {str(p.specs or {})}".lower()
            
            for term in terms:
                if term in p.name.lower():
                    score += 10
                if any(term == tag.lower() for tag in (p.tags or [])):
                    score += 8
                if term in p.category.lower():
                    score += 5
                if term in searchable_blob:
                    score += 2
                    
            if score > 0 or not terms:
                scored_products.append((score, p))
                
        scored_products.sort(key=lambda x: (x[0], -x[1].price), reverse=True)
        return [p for score, p in scored_products[:limit]]
