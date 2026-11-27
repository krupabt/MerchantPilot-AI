from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

from backend.app.database import get_db
from backend.app.api.deps import get_current_merchant
from backend.app.models.user import User
from backend.app.services.mcp_service import (
    generate_mcp_token,
    list_mcp_tokens,
    revoke_mcp_token,
    get_mcp_activities
)

router = APIRouter(prefix="/merchant/mcp", tags=["Merchant MCP Management"])

class TokenCreateRequest(BaseModel):
    name: Optional[str] = "Claude Custom Connector"

TOOLS_METADATA = [
    {
        "name": "get_store_details",
        "description": "Get current store profile, business details, storefront URL, product count, and publication status.",
        "parameters": []
    },
    {
        "name": "list_products",
        "description": "List products in the merchant's catalog with pricing, cost, gross margins, and stock levels.",
        "parameters": ["category (optional)", "search (optional)", "include_archived (optional)"]
    },
    {
        "name": "add_product",
        "description": "Add a new product to the merchant's store catalog with SKU, pricing, and stock.",
        "parameters": ["name", "price", "cost_price", "stock", "category", "description", "sku", "low_stock_threshold"]
    },
    {
        "name": "update_product",
        "description": "Update details, pricing, cost, or publishing status of an existing product.",
        "parameters": ["product_id", "name", "price", "cost_price", "description", "category", "is_published"]
    },
    {
        "name": "update_inventory",
        "description": "Update the inventory stock level of a specific product with low-stock alerts.",
        "parameters": ["product_id", "stock"]
    },
    {
        "name": "get_orders",
        "description": "Get customer orders placed with the merchant's store, with line items and fulfillment statuses.",
        "parameters": ["fulfillment_status (optional)", "limit (optional)"]
    },
    {
        "name": "get_sales_summary",
        "description": "Get aggregated sales revenue, total completed orders, and average order value (AOV) over the last N days.",
        "parameters": ["days (default 30)"]
    },
    {
        "name": "get_revenue_summary",
        "description": "Get detailed financial breakdown: Total Revenue, COGS, Gross Profit, Gross Margin %, and Inventory Valuation.",
        "parameters": []
    },
    {
        "name": "get_product_recommendations",
        "description": "Get cross-sell product recommendations and bundle opportunities using genuine Apriori market basket analysis.",
        "parameters": ["product_id (optional)"]
    },
    {
        "name": "get_discount_policies",
        "description": "Get active merchant commercial discount limits, margin guardrails, and automated governance rules.",
        "parameters": []
    },
    {
        "name": "create_store",
        "description": "Set up or update the merchant's store name, category, description, and unique store slug.",
        "parameters": ["store_name", "category", "description"]
    },
    {
        "name": "publish_store",
        "description": "Publish or unpublish the merchant's public storefront.",
        "parameters": ["is_published (default true)"]
    }
]

@router.get("/status", summary="Get MCP Server Status and Tool Directory")
def get_mcp_status(
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    tokens = list_mcp_tokens(db, current_merchant.merchant_id)
    active_tokens = [t for t in tokens if t["is_active"]]

    return {
        "status": "online",
        "protocol": "Model Context Protocol (MCP)",
        "protocol_version": "2024-11-05",
        "transport": "Streamable HTTP",
        "mcp_endpoint": "https://merchantpilot-ai.vercel.app/mcp",
        "active_tokens_count": len(active_tokens),
        "total_tokens_count": len(tokens),
        "tools_count": len(TOOLS_METADATA),
        "tools": TOOLS_METADATA
    }

@router.get("/tokens", summary="List Merchant MCP Tokens")
def get_tokens(
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    return list_mcp_tokens(db, current_merchant.merchant_id)

@router.post("/tokens", summary="Generate New MCP Access Token")
def create_token(
    request: TokenCreateRequest,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    return generate_mcp_token(db, current_merchant.merchant_id, request.name or "Claude Custom Connector")

@router.delete("/tokens/{token_id}", summary="Revoke MCP Access Token")
def revoke_token(
    token_id: str,
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    success = revoke_mcp_token(db, current_merchant.merchant_id, token_id)
    if not success:
        raise HTTPException(status_code=404, detail="Token not found or already revoked.")
    return {"success": True, "message": "Token revoked successfully."}

@router.get("/activity", summary="Get Recent MCP Tool Execution Logs")
def get_activity(
    limit: int = Query(30, ge=1, le=100),
    current_merchant: User = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    return get_mcp_activities(db, current_merchant.merchant_id, limit)
