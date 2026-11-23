import pytest
from backend.app.database import SessionLocal
from backend.app.services.revenue_service import RevenueService
from backend.app.models.order import Order

@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_genuine_apriori_association_mining(db_session):
    rules = RevenueService.mine_basket_associations(db_session, min_support=0.05, min_confidence=0.15)
    assert len(rules) >= 1

    # Verify mathematical properties of Apriori rules
    for rule in rules:
        assert 0.0 < rule.support <= 1.0
        assert 0.0 < rule.confidence <= 1.0
        assert rule.lift > 0.0
        assert rule.co_occurrences >= 2
        assert rule.antecedent_name is not None
        assert rule.consequent_name is not None

    # Verify sorted by lift descending
    lifts = [r.lift for r in rules]
    assert lifts == sorted(lifts, reverse=True)

def test_dynamic_bundle_opportunities(db_session):
    insights = RevenueService.get_revenue_insights(db_session)
    assert insights.status == "SUCCESS"
    assert insights.sample_size >= 5
    assert len(insights.active_bundle_opportunities) >= 1

    # Verify bundle values are calculated, not hardcoded dummy constants
    for bundle in insights.active_bundle_opportunities:
        assert bundle.individual_total > 0
        assert bundle.bundle_price > 0
        assert bundle.discount_amount > 0
        assert round(bundle.individual_total - bundle.discount_amount, 2) == bundle.bundle_price
        assert bundle.historical_conversion_rate > 0
        assert "Apriori" in bundle.rationale or "Lift" in bundle.rationale
