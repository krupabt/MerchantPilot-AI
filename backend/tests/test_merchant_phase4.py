import pytest
from backend.app.services.merchant_service import MerchantService
from backend.app.schemas.merchant import ProductCreateRequest, ProductUpdateRequest, FulfillmentUpdateRequest
from backend.app.models.product import Product
from backend.app.models.order import Order

def test_merchant_stats_database_derived(db_session):
    stats = MerchantService.get_merchant_stats(db_session, "m_1001")
    assert stats["total_orders"] >= 10
    assert stats["total_revenue"] > 0
    assert stats["average_order_value"] > 0
    assert len(stats["top_selling_products"]) >= 1
    assert len(stats["revenue_trend"]) == 7
    # Verify daily trend has real structure
    for trend in stats["revenue_trend"]:
        assert "date" in trend
        assert "revenue" in trend
        assert "orders_count" in trend

def test_merchant_product_crud(db_session):
    # 1. Create Product
    create_req = ProductCreateRequest(
        name="Apex Titanium Wireless ANC 2026",
        category="Audio",
        description="Premium titanium wireless ANC headphones with 60-hour battery life.",
        price=12500.0,
        currency="INR",
        stock=25,
        low_stock_threshold=5,
        specs={"battery": "60 hours", "driver": "40mm Beryllium"}
    )
    prod = MerchantService.create_product(db_session, "m_1001", create_req)
    assert prod.id is not None
    assert prod.name == "Apex Titanium Wireless ANC 2026"
    assert prod.stock == 25
    assert prod.merchant_id == "m_1001"
    
    # 2. Update Product
    update_req = ProductUpdateRequest(
        price=11999.0,
        stock=22
    )
    updated = MerchantService.update_product(db_session, "m_1001", prod.id, update_req)
    assert updated.price == 11999.0
    assert updated.stock == 22
    
    # 3. Archive Product
    archived = MerchantService.archive_product(db_session, "m_1001", prod.id)
    assert archived is True
    assert updated.is_active is False

def test_merchant_product_ownership_isolation(db_session):
    # Product belongs to m_1001
    prod = db_session.query(Product).filter(Product.merchant_id == "m_1001").first()
    assert prod is not None
    
    # Foreign merchant "m_intruder" tries to modify
    with pytest.raises(ValueError) as exc:
        MerchantService.update_product(
            db_session,
            merchant_id="m_intruder",
            product_id=prod.id,
            data=ProductUpdateRequest(price=1.0)
        )
    assert "not found or you do not have permission" in str(exc.value)

def test_merchant_fulfillment_workflow(db_session):
    order = db_session.query(Order).filter(Order.merchant_id == "m_1001").first()
    assert order is not None
    
    res = MerchantService.update_fulfillment(
        db_session,
        merchant_id="m_1001",
        order_id=order.id,
        new_status="SHIPPED"
    )
    assert res["fulfillment_status"] == "SHIPPED"
    assert order.fulfillment_status == "SHIPPED"
