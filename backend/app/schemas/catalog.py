from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ProductSpec(BaseModel):
    specs: Dict[str, Any] = Field(default_factory=dict)

class ProductBase(BaseModel):
    id: str
    sku: Optional[str] = None
    name: str
    category: str
    description: Optional[str] = ""
    price: float
    cost_price: Optional[float] = 0.0
    currency: str = "INR"
    stock: int
    rating: Optional[float] = 4.5
    image_url: Optional[str] = None
    specs: Optional[Dict[str, Any]] = Field(default_factory=dict)
    compatible_product_ids: Optional[List[str]] = Field(default_factory=list)
    tags: Optional[List[str]] = Field(default_factory=list)
    is_active: bool = True

class ProductResponse(ProductBase):
    pass

class MerchantInfo(BaseModel):
    id: str
    name: str
    currency: str = "INR"

class AgentCatalogResponse(BaseModel):
    merchant: MerchantInfo
    count: int
    products: List[ProductResponse]
    categories: List[str]

class AvailabilityItem(BaseModel):
    product_id: str
    name: str
    available: bool
    stock: int
    price: float

class AvailabilityResponse(BaseModel):
    all_available: bool
    items: List[AvailabilityItem]
