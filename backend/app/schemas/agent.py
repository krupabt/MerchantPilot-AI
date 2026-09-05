from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    message: str
    customer_id: Optional[str] = "cust_demo_buyer"
    customer_name: Optional[str] = "Demo AI Buyer"
    customer_email: Optional[str] = "buyer@merchantpilot.ai"

class ProductRecommendation(BaseModel):
    id: str
    name: str
    price: float
    category: str
    stock: int
    reason: Optional[str] = None
    image_url: Optional[str] = None

class OfferDetails(BaseModel):
    bundle_title: Optional[str] = None
    items: List[Dict[str, Any]] = Field(default_factory=list)
    original_total: float
    discount_amount: float
    discount_percentage: float
    final_amount: float
    reason: str
    is_bundle: bool = False

class PolicyEvaluationResult(BaseModel):
    passed: bool
    status: str  # "PASSED" | "VIOLATION" | "BLOCKED"
    reason: str
    max_allowed_discount: float
    requested_discount: float
    max_discount_percentage: float
    requested_discount_percentage: float
    requires_approval: bool = True
    approval_token: Optional[str] = None

class ActionItem(BaseModel):
    tool: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    result_summary: str

class ChatResponse(BaseModel):
    session_id: str
    message: str
    intent: Optional[Dict[str, Any]] = None
    recommendations: Optional[Dict[str, Any]] = None
    offer: Optional[OfferDetails] = None
    policy_evaluation: Optional[PolicyEvaluationResult] = None
    requires_approval: bool = False
    action_trace: List[ActionItem] = Field(default_factory=list)
    cart_items: List[Dict[str, Any]] = Field(default_factory=list)
