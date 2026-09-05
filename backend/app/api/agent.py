from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import Optional, List
from backend.app.database import get_db
from backend.app.schemas.catalog import AgentCatalogResponse, ProductResponse, AvailabilityResponse
from backend.app.schemas.policy import PolicyConfig
from backend.app.schemas.agent import ChatRequest, ChatResponse
from backend.app.services.catalog_service import CatalogService
from backend.app.services.policy_service import PolicyService
from backend.app.services.agent_service import AgentService

router = APIRouter(prefix="/agent", tags=["AI Agent Commerce"])

@router.get("/catalog", response_model=AgentCatalogResponse, summary="Agent-Readable Catalog")
def get_agent_catalog(
    category: Optional[str] = None,
    in_stock_only: bool = True,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """
    Structured, machine-readable endpoint designed for AI buyer agents to discover products,
    hardware specs, compatibility graphs, and bundle eligibility without scraping.
    """
    return CatalogService.get_agent_catalog(
        db=db,
        category=category,
        in_stock_only=in_stock_only,
        max_price=max_price
    )

@router.get("/products/{product_id}", response_model=ProductResponse, summary="Agent Product Specs & Availability")
def get_agent_product(product_id: str, db: Session = Depends(get_db)):
    prod = CatalogService.get_product_by_id(db, product_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found in agent catalog.")
    return prod

@router.post("/availability", response_model=AvailabilityResponse, summary="Agent Batch Inventory Check")
def check_availability(product_ids: List[str] = Body(..., embed=True), db: Session = Depends(get_db)):
    return CatalogService.check_availability(db, product_ids)

@router.get("/policies", response_model=PolicyConfig, summary="Agent Machine-Readable Commercial Policies")
def get_agent_policies(db: Session = Depends(get_db)):
    pol = PolicyService.get_active_policy(db)
    return PolicyConfig(
        id=pol.id,
        merchant_id=pol.merchant_id,
        name=pol.name,
        max_discount_percentage=pol.max_discount_percentage,
        max_discount_amount=pol.max_discount_amount,
        max_transaction_amount=pol.max_transaction_amount,
        allowed_actions=pol.allowed_actions or [],
        restricted_actions=pol.restricted_actions or [],
        require_human_approval=pol.require_human_approval,
        is_active=pol.is_active
    )

@router.post("/chat", response_model=ChatResponse, summary="AI Buyer Commerce Conversation")
def agent_chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Processes natural-language commerce inquiries, checks inventory,
    mines upsell/cross-sell associations, computes bounded offers, and applies policy guardrails.
    """
    return AgentService.process_buyer_message(
        db=db,
        message=request.message,
        session_id=request.session_id,
        customer_id=request.customer_id,
        customer_name=request.customer_name,
        customer_email=request.customer_email
    )
