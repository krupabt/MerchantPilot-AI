from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SaleItemInput(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)
    unit_price: Optional[float] = None
    discount_amount: float = Field(0.0, ge=0)

class CreateSaleRequest(BaseModel):
    items: Optional[List[SaleItemInput]] = None
    product_id: Optional[str] = None
    quantity: Optional[int] = None
    discount_percent: Optional[float] = 0.0
    discount_amount: float = Field(0.0, ge=0)
    discount_reason: Optional[str] = None
    payment_method: str = Field("CASH", description="CASH, UPI, CARD, RAZORPAY")
    payment_reference: Optional[str] = None
    customer_name: Optional[str] = "Walk-in Customer"
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    notes: Optional[str] = None

class SaleItemReceipt(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    unit_cost: float
    total_price: float

class SaleReceiptResponse(BaseModel):
    order_id: str
    receipt_number: str
    merchant_id: str
    merchant_name: str
    sales_channel: str  # "POS" or "ONLINE"
    customer_name: str
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    items: List[SaleItemReceipt]
    subtotal: float
    discount_amount: float
    final_amount: float
    payment_method: str
    payment_status: str
    payment_reference: Optional[str] = None
    total_cogs: float
    gross_profit: float
    notes: Optional[str] = None
    created_at: str
