import pytest
from backend.app.services.policy_service import PolicyService
from backend.app.services.offer_service import OfferService
from backend.app.models.product import Product

def test_compliant_discount_passes(db_session):
    """Test valid discount within policy limits passes."""
    # Laptop + Mouse = ₹61,000, discount ₹501 (0.82% < 10%)
    res = PolicyService.validate_policy(
        db=db_session,
        original_amount=61000.0,
        proposed_discount=501.0,
        action="create_offer"
    )
    assert res["passed"] is True
    assert res["status"] == "PASSED"
    assert res["approval_token"] is not None
    assert res["approval_token"].startswith("appr_")

def test_excessive_discount_percentage_blocked(db_session):
    """Test discount exceeding 10% limit is blocked."""
    # ₹60,000 laptop with ₹15,000 discount (25% > 10%)
    res = PolicyService.validate_policy(
        db=db_session,
        original_amount=60000.0,
        proposed_discount=15000.0,
        action="create_offer"
    )
    assert res["passed"] is False
    assert res["status"] == "VIOLATION"
    assert res["violation_code"] == "EXCEEDS_MAX_DISCOUNT"
    assert res["approval_token"] is None

def test_excessive_transaction_amount_blocked(db_session):
    """Test transaction exceeding max limit is blocked."""
    res = PolicyService.validate_policy(
        db=db_session,
        original_amount=150000.0,
        proposed_discount=1000.0,
        action="create_offer"
    )
    assert res["passed"] is False
    assert res["violation_code"] == "EXCEEDS_MAX_TRANSACTION"

def test_restricted_action_blocked(db_session):
    """Test forbidden action like 'refund' or 'arbitrary_price_override' is rejected."""
    res = PolicyService.validate_policy(
        db=db_session,
        original_amount=1000.0,
        proposed_discount=0.0,
        action="arbitrary_price_override"
    )
    assert res["passed"] is False
    assert res["violation_code"] == "RESTRICTED_ACTION"

def test_offer_service_bounded_generation(db_session):
    """Test offer service automatically creates bounded bundle with policy validation."""
    p1 = db_session.query(Product).filter(Product.id == "P101").first()
    p2 = db_session.query(Product).filter(Product.id == "P102").first()
    
    result = OfferService.generate_bounded_offer(db_session, [p1, p2])
    offer = result["offer"]
    eval_res = result["policy_evaluation"]
    
    assert offer.original_total == 61000.0
    assert offer.discount_amount == 501.0
    assert offer.final_amount == 60499.0
    assert eval_res["passed"] is True
