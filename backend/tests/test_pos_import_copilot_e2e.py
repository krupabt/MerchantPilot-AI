import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.app.main import app
from backend.app.database import get_db, SessionLocal
from backend.app.models.user import User
from backend.app.models.product import Product
from backend.app.models.order import Order, OrderItem
from backend.app.services.merchant_ai_service import MerchantAIService
from backend.app.services.merchant_service import MerchantService

client = TestClient(app)

@pytest.fixture
def db():
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()

def test_merchant_registration_and_multi_tenant_isolation(db: Session):
    """Test 1: Merchant registration with store metadata and isolated 0-state."""
    import uuid
    unique_id = uuid.uuid4().hex[:6]
    email = f"merchant_{unique_id}@retailer.com"
    
    signup_data = {
        "email": email,
        "password": "StrongPassword123!",
        "role": "MERCHANT",
        "name": f"Retail Owner {unique_id}",
        "store_name": f"Apex Retail {unique_id}",
        "business_category": "Electronics & Computers",
        "business_phone": "+91 98765 00000",
        "business_address": "MG Road, Bangalore"
    }

    res = client.post("/api/auth/signup", json=signup_data)
    assert res.status_code == 200, res.text
    token = res.json()["token"]
    merchant_id = res.json()["user"]["merchant_id"]

    headers = {"Authorization": f"Bearer {token}"}

    # Verify merchant starts with zero orders and zero gross profit
    stats_res = client.get("/api/dashboard/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_revenue"] == 0.0
    assert stats["total_orders"] == 0
    assert stats["gross_profit"] == 0.0

def test_pos_sale_recording_and_gross_profit(db: Session):
    """Test 2: Create product with cost & price, record in-store POS sale, verify stock and profit."""
    import uuid
    unique_id = uuid.uuid4().hex[:6]
    email = f"pos_merchant_{unique_id}@store.com"

    signup_res = client.post("/api/auth/signup", json={
        "email": email,
        "password": "SecurePassword123!",
        "role": "MERCHANT",
        "name": "POS Owner",
        "store_name": "Tech Gadgets",
        "business_category": "Electronics"
    })
    token = signup_res.json()["token"]
    merchant_id = signup_res.json()["user"]["merchant_id"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Product: Wireless Mouse (Price: 700, Cost: 400, Stock: 20)
    prod_res = client.post("/api/merchant/products", headers=headers, json={
        "sku": f"SKU-WM-{unique_id}",
        "name": "Wireless Mouse",
        "category": "Electronics",
        "price": 700.0,
        "cost_price": 400.0,
        "stock": 20,
        "low_stock_threshold": 5,
        "description": "Ergonomic 2.4GHz Wireless Mouse"
    })
    assert prod_res.status_code in [200, 201], prod_res.text
    prod_id = prod_res.json()["product"]["id"]

    # 2. Record In-Store POS Sale: 3 units, 0% discount, CASH
    # Expected Revenue = 3 * 700 = 2100. Expected Cost = 3 * 400 = 1200. Expected Profit = 900.
    sale_res = client.post("/api/merchant/sales", headers=headers, json={
        "product_id": prod_id,
        "quantity": 3,
        "discount_percent": 0.0,
        "payment_method": "CASH",
        "customer_name": "Walk-in Buyer"
    })
    assert sale_res.status_code in [200, 201], sale_res.text
    res_body = sale_res.json()
    receipt = res_body.get("receipt", res_body)
    assert receipt["final_amount"] == 2100.0
    assert receipt["total_cogs"] == 1200.0
    assert receipt["gross_profit"] == 900.0

    # 3. Verify stock in catalog is now 17
    prod_check = client.get(f"/api/merchant/products?search=Wireless", headers=headers)
    assert prod_check.status_code == 200
    products = prod_check.json() if isinstance(prod_check.json(), list) else prod_check.json().get("products", [])
    assert products[0]["stock"] == 17

    # 4. Verify Dashboard Stats
    stats_res = client.get("/api/dashboard/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_revenue"] == 2100.0
    assert stats["total_cogs"] == 1200.0
    assert stats["gross_profit"] == 900.0
    assert stats["total_orders"] == 1

def test_copilot_revenue_profit_and_stock_queries(db: Session):
    """Test 3: AI Business Copilot answers gross profit, stock remaining, and follow-ups with real DB data."""
    import uuid
    unique_id = uuid.uuid4().hex[:6]
    email = f"copilot_test_{unique_id}@store.com"

    signup_res = client.post("/api/auth/signup", json={
        "email": email,
        "password": "SecurePassword123!",
        "role": "MERCHANT",
        "name": "Copilot Test Owner",
        "store_name": "Copilot Hardware",
        "business_category": "Hardware & Tools"
    })
    token = signup_res.json()["token"]
    merchant_id = signup_res.json()["user"]["merchant_id"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add Wireless Mouse (Price: 700, Cost: 400, Stock: 20)
    prod_res = client.post("/api/merchant/products", headers=headers, json={
        "sku": f"SKU-M-{unique_id}",
        "name": "Wireless Mouse",
        "category": "Accessories",
        "price": 700.0,
        "cost_price": 400.0,
        "stock": 20,
        "low_stock_threshold": 5
    })
    assert prod_res.status_code in [200, 201]
    prod_id = prod_res.json()["product"]["id"]

    # Record sale: 3 units -> Stock: 17, Revenue: 2100, Cost: 1200, Profit: 900
    sale_res = client.post("/api/merchant/sales", headers=headers, json={
        "product_id": prod_id,
        "quantity": 3,
        "discount_percent": 0.0,
        "payment_method": "UPI"
    })
    assert sale_res.status_code in [200, 201]

    # Query 1: "How much revenue and gross profit did I generate?"
    q1_res = client.post("/api/merchant/ai-assistant", headers=headers, json={
        "query": "How much revenue and gross profit did I generate?"
    })
    assert q1_res.status_code == 200, q1_res.text
    ans1 = q1_res.json()
    assert ans1["intent"] == "GROSS_PROFIT_SUMMARY"
    assert "2,100" in ans1["answer"] or "2100" in ans1["answer"]
    assert "900" in ans1["answer"]
    assert ans1["data"]["gross_profit"] == 900.0

    # Query 2: "How many Wireless Mouse units are remaining?"
    q2_res = client.post("/api/merchant/ai-assistant", headers=headers, json={
        "query": "How many Wireless Mouse units are remaining?"
    })
    assert q2_res.status_code == 200, q2_res.text
    ans2 = q2_res.json()
    assert ans2["intent"] == "PRODUCT_STOCK_QUERY"
    assert "17 units" in ans2["answer"]

    # Query 3: Multi-turn Follow-up: "How much profit did it generate?"
    history = [
        {"sender": "user", "text": "Which product sold the most?"},
        {"sender": "assistant", "text": "Your top product is Wireless Mouse with 3 units sold."}
    ]
    q3_res = client.post("/api/merchant/ai-assistant", headers=headers, json={
        "query": "How much profit did it generate?",
        "history": history
    })
    assert q3_res.status_code == 200, q3_res.text
    ans3 = q3_res.json()
    assert ans3["intent"] == "PRODUCT_PROFIT_QUERY"
    assert "900" in ans3["answer"]
    assert ans3["data"]["gross_profit"] == "₹900.00"

    # Query 4: Discount feasibility: "Can I afford to give a 10% discount on this product?"
    q4_res = client.post("/api/merchant/ai-assistant", headers=headers, json={
        "query": "Can I afford to give a 10% discount on this product?",
        "history": history
    })
    assert q4_res.status_code == 200, q4_res.text
    ans4 = q4_res.json()
    assert ans4["intent"] == "DISCOUNT_FEASIBILITY"
    assert "Feasible and Compliant" in ans4["answer"]
    assert ans4["data"]["status"] == "APPROVED"

def test_csv_import_workflow(db: Session):
    """Test 4: Download CSV template, preview data, and confirm import."""
    import uuid
    unique_id = uuid.uuid4().hex[:6]
    email = f"import_test_{unique_id}@store.com"

    signup_res = client.post("/api/auth/signup", json={
        "email": email,
        "password": "SecurePassword123!",
        "role": "MERCHANT",
        "name": "Importer",
        "store_name": "Import Depot"
    })
    token = signup_res.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Download Products template
    tpl_res = client.get("/api/merchant/import/templates/products", headers=headers)
    assert tpl_res.status_code == 200
    assert "sku" in tpl_res.text.lower()
    assert "name" in tpl_res.text.lower()

    # 2. Preview valid CSV
    csv_sample = (
        "sku,name,category,price,cost_price,stock,low_stock_threshold,description\n"
        f"SKU-USB-{unique_id},USB Cable,Cables,250.00,100.00,50,10,Durable Type-C Cable\n"
        f"SKU-PAD-{unique_id},Mouse Pad,Accessories,400.00,150.00,30,5,Anti-slip Mouse Pad\n"
    )

    prev_res = client.post("/api/merchant/import/preview", headers=headers, json={
        "import_type": "products",
        "filename": "sample_products.csv",
        "csv_content": csv_sample
    })
    assert prev_res.status_code == 200, prev_res.text
    prev_data = prev_res.json()
    assert prev_data["valid_count"] == 2
    assert prev_data["errors_count"] == 0

    # 3. Confirm import
    confirm_res = client.post("/api/merchant/import/confirm", headers=headers, json={
        "import_type": "products",
        "filename": "sample_products.csv",
        "csv_content": csv_sample
    })
    assert confirm_res.status_code == 200, confirm_res.text
    assert confirm_res.json()["imported_count"] == 2

    # 4. Verify products appear in catalog
    cat_res = client.get("/api/merchant/products", headers=headers)
    assert cat_res.status_code == 200
    res_json = cat_res.json()
    prods = res_json if isinstance(res_json, list) else res_json.get("products", [])
    assert len(prods) == 2
    skus = [p["sku"] for p in prods]
    assert f"SKU-USB-{unique_id}" in skus
    assert f"SKU-PAD-{unique_id}" in skus
