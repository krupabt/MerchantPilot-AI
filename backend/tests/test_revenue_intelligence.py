import pytest
from backend.app.services.revenue_service import RevenueService

def test_market_basket_association_mining(db_session):
    """Test that association rules are discovered from seeded historical orders."""
    rules = RevenueService.mine_basket_associations(db_session)
    assert len(rules) > 0
    
    # Check rule attributes
    first_rule = rules[0]
    assert hasattr(first_rule, "antecedent_id")
    assert hasattr(first_rule, "consequent_id")
    assert hasattr(first_rule, "support")
    assert hasattr(first_rule, "confidence")
    assert hasattr(first_rule, "lift")
    assert first_rule.lift >= 1.0
    assert len(first_rule.recommendation_pitch) > 10

def test_cross_sell_recommendations(db_session):
    """Test that querying cross-sell for laptop returns mouse/bag."""
    cross_sells = RevenueService.get_cross_sell_recommendations(db_session, "P101", limit=3)
    assert len(cross_sells) >= 1
    rec_ids = [cs["product_id"] for cs in cross_sells]
    # P102 (Mouse) or P103 (Bag) should be recommended
    assert "P102" in rec_ids or "P103" in rec_ids

def test_upsell_recommendations(db_session):
    """Test upsell recommendations within same category."""
    upsells = RevenueService.get_upsell_recommendations(db_session, "P111") # UltraBook 14 (₹52,000) -> ProBook 15 (₹60,000)
    assert len(upsells) >= 1
    assert any(u["product_id"] == "P101" for u in upsells)
    assert upsells[0]["price_difference"] > 0

def test_revenue_insights_endpoint(client, db_session):
    """Test /api/revenue/insights API."""
    response = client.get("/api/revenue/insights")
    assert response.status_code == 200
    data = response.json()
    
    assert data["total_orders"] >= 10
    assert data["total_revenue"] > 0
    assert data["ai_assisted_revenue"] > 0
    assert len(data["top_associations"]) > 0
    assert len(data["active_bundle_opportunities"]) >= 2
