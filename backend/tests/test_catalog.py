import pytest
from backend.app.services.catalog_service import CatalogService

def test_agent_catalog_structure(client, db_session):
    """Test that /api/agent/catalog returns machine-readable products with specs and compatibility."""
    response = client.get("/api/agent/catalog")
    assert response.status_code == 200
    data = response.json()
    
    assert "merchant" in data
    assert data["merchant"]["currency"] == "INR"
    assert "count" in data
    assert data["count"] >= 10
    assert "products" in data
    
    first_prod = data["products"][0]
    assert "id" in first_prod
    assert "specs" in first_prod
    assert isinstance(first_prod["specs"], dict)
    assert "compatible_product_ids" in first_prod
    assert isinstance(first_prod["compatible_product_ids"], list)

def test_product_search_and_filter(client, db_session):
    """Test catalog search by keyword and category."""
    # Search laptop
    results = CatalogService.search_products(db_session, query_text="laptop programming", category="Laptops")
    assert len(results) >= 1
    assert any("P101" == p.id for p in results)

    # Budget filter
    budget_results = CatalogService.search_products(db_session, query_text="laptop", max_budget=55000.0)
    assert all(p.price <= 55000.0 for p in budget_results)

def test_batch_inventory_check(client, db_session):
    """Test /api/agent/availability batch inventory check."""
    response = client.post("/api/agent/availability", json={"product_ids": ["P101", "P102", "NON_EXISTENT"]})
    assert response.status_code == 200
    data = response.json()
    
    assert data["all_available"] is False
    assert len(data["items"]) == 3
    
    p101_item = next(i for i in data["items"] if i["product_id"] == "P101")
    assert p101_item["available"] is True
    assert p101_item["stock"] > 0

def test_single_product_details(client, db_session):
    """Test /api/products/{id} lookup."""
    response = client.get("/api/products/P101")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Apex ProBook 15 Developer Edition"
    assert data["price"] == 60000.0
