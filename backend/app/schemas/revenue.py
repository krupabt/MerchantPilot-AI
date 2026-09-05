from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class AssociationRule(BaseModel):
    antecedent_id: str
    antecedent_name: str
    consequent_id: str
    consequent_name: str
    support: float
    confidence: float
    lift: float
    co_occurrences: int
    recommendation_pitch: str

class BundleOpportunity(BaseModel):
    bundle_id: str
    title: str
    product_ids: List[str]
    product_names: List[str]
    individual_total: float
    bundle_price: float
    discount_amount: float
    discount_pct: float
    historical_conversion_rate: float
    rationale: str

class RevenueInsightsResponse(BaseModel):
    total_orders: int
    total_revenue: float
    ai_assisted_revenue: float
    ai_revenue_percentage: float
    average_order_value: float
    cross_sell_revenue: float
    upsell_revenue: float
    conversion_rate: float
    top_associations: List[AssociationRule]
    active_bundle_opportunities: List[BundleOpportunity]
    category_breakdown: Dict[str, float]
