from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class CategoryCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    created_at: Optional[datetime] = None

class ProductCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    category: str = Field(..., min_length=2, max_length=100)
    category_id: Optional[str] = None
    description: str = Field(..., min_length=5, max_length=1000)
    price: float = Field(..., gt=0)
    currency: str = "INR"
    stock: int = Field(0, ge=0)
    low_stock_threshold: int = Field(5, ge=0)
    image_url: Optional[str] = None
    specs: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)
    compatible_product_ids: List[str] = Field(default_factory=list)

class ProductUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)
    category: Optional[str] = None
    category_id: Optional[str] = None
    description: Optional[str] = Field(None, min_length=5, max_length=1000)
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    specs: Optional[Dict[str, Any]] = None
    tags: Optional[List[str]] = None
    compatible_product_ids: Optional[List[str]] = None
    is_active: Optional[bool] = None

class StockUpdateRequest(BaseModel):
    stock: int = Field(..., ge=0)

class FulfillmentUpdateRequest(BaseModel):
    fulfillment_status: str = Field(..., description="UNFULFILLED, PROCESSING, SHIPPED, DELIVERED, CANCELLED")

class TopProductResponse(BaseModel):
    product_id: str
    name: str
    category: str
    price: float
    units_sold: int
    total_revenue: float
    current_stock: int

class RevenueTrendItem(BaseModel):
    date: str
    day: str
    revenue: float
    orders_count: int

class MerchantStatsResponse(BaseModel):
    total_revenue: float
    total_orders: int
    pending_orders: int
    completed_orders: int
    average_order_value: float
    out_of_stock_count: int
    low_stock_count: int
    top_selling_products: List[TopProductResponse]
    low_stock_products: List[Dict[str, Any]]
    revenue_trend: List[RevenueTrendItem]
    recent_orders: List[Dict[str, Any]]
