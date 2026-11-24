import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
import uuid
import time
import requests

BASE_URL = "http://127.0.0.1:8000"

def log_step(num, title, details):
    print(f"\n=======================================================")
    print(f"STEP {num}: {title}")
    print(f"=======================================================")
    for k, v in details.items():
        print(f"  • {k}: {v}")

def run_14_step_verification():
    print(f"\n🚀 STARTING MANDATORY 14-STEP END-TO-END VERIFICATION")
    print(f"Target Backend: {BASE_URL}")

    # Generate isolated test merchant
    uid1 = uuid.uuid4().hex[:6].upper()
    merchant1_email = f"merchant_{uid1.lower()}@teststore.com"
    password = "TestPassword123!"

    # -------------------------------------------------------------------------
    # STEP 1: Register new merchant -> verify 0 sales & empty state
    # -------------------------------------------------------------------------
    reg_payload = {
        "email": merchant1_email,
        "password": password,
        "role": "MERCHANT",
        "name": f"Retail Owner {uid1}",
        "store_name": f"Apex Retail {uid1}",
        "business_category": "Electronics & Computers",
        "business_phone": "+91 98765 11111",
        "business_address": "Indiranagar, Bangalore"
    }
    r1 = requests.post(f"{BASE_URL}/api/auth/signup", json=reg_payload)
    assert r1.status_code == 200, f"Step 1 failed: {r1.text}"
    token1 = r1.json()["token"]
    m1_id = r1.json()["user"]["merchant_id"]
    headers1 = {"Authorization": f"Bearer {token1}"}

    # Verify initial isolated 0-state
    s1 = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers1).json()
    assert s1["total_revenue"] == 0.0, f"Expected 0 revenue, got {s1['total_revenue']}"
    assert s1["total_orders"] == 0, f"Expected 0 orders, got {s1['total_orders']}"
    assert s1["gross_profit"] == 0.0, f"Expected 0 profit, got {s1['gross_profit']}"
    log_step(1, "Merchant Registration & Isolated Zero-State", {
        "Merchant ID": m1_id,
        "Store Name": reg_payload["store_name"],
        "Initial Revenue": f"₹{s1['total_revenue']}",
        "Initial Orders": s1["total_orders"],
        "Initial Gross Profit": f"₹{s1['gross_profit']}",
        "Status": "PASS ✅"
    })

    # -------------------------------------------------------------------------
    # STEP 2: Add product Wireless Mouse (Cost ₹400, Selling ₹700, Stock 20)
    # -------------------------------------------------------------------------
    prod_payload = {
        "sku": f"SKU-WM-{uid1}",
        "name": "Wireless Mouse",
        "category": "Electronics",
        "description": "Ergonomic 2.4GHz optical wireless mouse with silent clicks.",
        "cost_price": 400.0,
        "price": 700.0,
        "stock": 20,
        "low_stock_threshold": 5
    }
    r2 = requests.post(f"{BASE_URL}/api/merchant/products", headers=headers1, json=prod_payload)
    assert r2.status_code in [200, 201], f"Step 2 failed: {r2.text}"
    prod1 = r2.json()["product"]
    prod1_id = prod1["id"]
    log_step(2, "Add Product with Cost & Selling Price", {
        "Product ID": prod1_id,
        "Name": prod1["name"],
        "Selling Price": f"₹{prod1['price']}",
        "Cost Price (COGS)": f"₹{prod_payload['cost_price']}",
        "Initial Stock": prod1["stock"],
        "Status": "PASS ✅"
    })

    # -------------------------------------------------------------------------
    # STEP 3: Record in-store POS sale of 3 units -> verify stock 17, Rev ₹2100, Cost ₹1200, Profit ₹900
    # -------------------------------------------------------------------------
    sale_payload = {
        "product_id": prod1_id,
        "quantity": 3,
        "discount_percent": 0.0,
        "payment_method": "CASH",
        "customer_name": "Walk-in Customer"
    }
    r3 = requests.post(f"{BASE_URL}/api/merchant/sales", headers=headers1, json=sale_payload)
    assert r3.status_code in [200, 201], f"Step 3 failed: {r3.text}"
    receipt = r3.json().get("receipt", r3.json())

    # Check dashboard stats
    s3 = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers1).json()
    assert s3["total_revenue"] == 2100.0
    assert s3["total_cogs"] == 1200.0
    assert s3["gross_profit"] == 900.0
    assert s3["total_orders"] == 1

    # Check remaining stock in catalog
    p_check = requests.get(f"{BASE_URL}/api/merchant/products", headers=headers1).json()
    prods_list = p_check if isinstance(p_check, list) else p_check.get("products", [])
    active_mouse = next(p for p in prods_list if p["id"] == prod1_id)
    assert active_mouse["stock"] == 17

    log_step(3, "Record POS Sale & Deduct Inventory", {
        "Order ID": receipt["order_id"],
        "Quantity Sold": 3,
        "Total Revenue": f"₹{s3['total_revenue']:,.2f}",
        "Total Cost (COGS)": f"₹{s3['total_cogs']:,.2f}",
        "Gross Profit": f"₹{s3['gross_profit']:,.2f} ({s3['gross_profit_margin_pct']}% margin)",
        "Remaining Stock": f"{active_mouse['stock']} units",
        "Receipt Number": receipt.get("receipt_number"),
        "Status": "PASS ✅"
    })

    # -------------------------------------------------------------------------
    # STEP 4: AI Business Copilot: "How much revenue and gross profit did I generate?"
    # -------------------------------------------------------------------------
    r4 = requests.post(f"{BASE_URL}/api/merchant/ai-assistant", headers=headers1, json={
        "query": "How much revenue and gross profit did I generate?"
    })
    assert r4.status_code == 200, f"Step 4 failed: {r4.text}"
    ans4 = r4.json()
    assert ans4["intent"] == "GROSS_PROFIT_SUMMARY"
    assert ans4["data"]["gross_profit"] == 900.0
    assert ans4["data"]["total_revenue"] == 2100.0
    log_step(4, "AI Copilot: Revenue & Gross Profit Query", {
        "Query": "How much revenue and gross profit did I generate?",
        "Intent": ans4["intent"],
        "Answer Excerpt": ans4["answer"][:160] + "...",
        "Computed Profit": f"₹{ans4['data']['gross_profit']}",
        "Status": "PASS ✅"
    })

    # -------------------------------------------------------------------------
    # STEP 5: AI Business Copilot: "How many Wireless Mouse units are remaining?"
    # -------------------------------------------------------------------------
    r5 = requests.post(f"{BASE_URL}/api/merchant/ai-assistant", headers=headers1, json={
        "query": "How many Wireless Mouse units are remaining?"
    })
    assert r5.status_code == 200, f"Step 5 failed: {r5.text}"
    ans5 = r5.json()
    assert ans5["intent"] == "PRODUCT_STOCK_QUERY"
    assert "17 units" in ans5["answer"]
    log_step(5, "AI Copilot: Specific Product Stock Query", {
        "Query": "How many Wireless Mouse units are remaining?",
        "Intent": ans5["intent"],
        "Answer Excerpt": ans5["answer"][:160] + "...",
        "Stock Reported": ans5["data"]["stock_remaining"],
        "Status": "PASS ✅"
    })

    # -------------------------------------------------------------------------
    # STEP 6: AI Business Copilot follow-up: "How much profit did it generate?"
    # -------------------------------------------------------------------------
    history = [
        {"sender": "user", "text": "Which product sold the most?"},
        {"sender": "assistant", "text": "Your top product is Wireless Mouse with 3 units sold."}
    ]
    r6 = requests.post(f"{BASE_URL}/api/merchant/ai-assistant", headers=headers1, json={
        "query": "How much profit did it generate?",
        "history": history
    })
    assert r6.status_code == 200, f"Step 6 failed: {r6.text}"
    ans6 = r6.json()
    assert ans6["intent"] == "PRODUCT_PROFIT_QUERY"
    assert ans6["data"]["gross_profit"] == "₹900.00"
    log_step(6, "AI Copilot: Contextual Pronoun Follow-up Query", {
        "Query": "How much profit did it generate?",
        "Resolved Product": "Wireless Mouse",
        "Intent": ans6["intent"],
        "Profit Calculated": ans6["data"]["gross_profit"],
        "Units Sold": ans6["data"]["units_sold"],
        "Status": "PASS ✅"
    })

    # -------------------------------------------------------------------------
    # STEP 7: AI Business Copilot: "Can I afford to give a 10% discount on this product?"
    # -------------------------------------------------------------------------
    r7 = requests.post(f"{BASE_URL}/api/merchant/ai-assistant", headers=headers1, json={
        "query": "Can I afford to give a 10% discount on this product?",
        "history": history
    })
    assert r7.status_code == 200, f"Step 7 failed: {r7.text}"
    ans7 = r7.json()
    assert ans7["intent"] == "DISCOUNT_FEASIBILITY"
    assert ans7["data"]["status"] == "APPROVED"
    log_step(7, "AI Copilot: Discount Feasibility & Policy Check", {
        "Query": "Can I afford to give a 10% discount on this product?",
        "Intent": ans7["intent"],
        "Discount Simulation": ans7["data"]["discount"],
        "Retained Unit Margin": ans7["data"]["retained_margin"],
        "Policy Status": ans7["data"]["status"],
        "Status": "PASS ✅"
    })

    # -------------------------------------------------------------------------
    # STEP 8: Stock adjustment & Proactive Merchant Actions
    # -------------------------------------------------------------------------
    r8_stock = requests.post(f"{BASE_URL}/api/merchant/products/{prod1_id}/stock", headers=headers1, json={
        "stock": 35
    })
    assert r8_stock.status_code == 200, f"Stock update failed: {r8_stock.text}"

    # Generate proactive merchant actions
    r8_act = requests.post(f"{BASE_URL}/api/merchant/actions/generate", headers=headers1)
    assert r8_act.status_code == 200, f"Action gen failed: {r8_act.text}"
    actions_data = r8_act.json()
    actions = actions_data.get("actions", actions_data if isinstance(actions_data, list) else [])

    log_step(8, "Inventory Stock Adjustment & Proactive Actions", {
        "Adjusted Stock Level": "35 units",
        "Proactive Actions Count": len(actions),
        "Sample Action": actions[0]["title"] if actions else "None",
        "Status": "PASS ✅"
    })

    # -------------------------------------------------------------------------
    # STEP 9: CSV Data Import (Template, Preview, Confirm)
    # -------------------------------------------------------------------------
    tpl_r = requests.get(f"{BASE_URL}/api/merchant/import/templates/products", headers=headers1)
    assert tpl_r.status_code == 200
    assert "sku" in tpl_r.text.lower()

    csv_data = (
        "sku,name,category,price,cost_price,stock,low_stock_threshold,description\n"
        f"SKU-KB-{uid1},Mechanical Keyboard,Electronics,2500.00,1200.00,15,5,RGB Gaming Mechanical Keyboard\n"
        f"SKU-USB-{uid1},Braided USB-C Cable,Accessories,350.00,120.00,40,10,2-meter Fast Charging Cable\n"
    )
    prev_r = requests.post(f"{BASE_URL}/api/merchant/import/preview", headers=headers1, json={
        "import_type": "products",
        "filename": "sample_hardware.csv",
        "csv_content": csv_data
    })
    assert prev_r.status_code == 200, f"Preview failed: {prev_r.text}"
    assert prev_r.json()["valid_count"] == 2

    conf_r = requests.post(f"{BASE_URL}/api/merchant/import/confirm", headers=headers1, json={
        "import_type": "products",
        "filename": "sample_hardware.csv",
        "csv_content": csv_data
    })
    assert conf_r.status_code == 200, f"Confirm failed: {conf_r.text}"
    assert conf_r.json()["imported_count"] == 2

    log_step(9, "CSV Bulk Data Import Pipeline", {
        "Imported File": "sample_hardware.csv",
        "Valid Records": 2,
        "Imported Records": conf_r.json()["imported_count"],
        "Status": "PASS ✅"
    })

    # -------------------------------------------------------------------------
    # STEP 10: Online Customer Checkout and Razorpay Test Mode Order Creation
    # -------------------------------------------------------------------------
    # Register a customer
    cust_email = f"customer_{uid1.lower()}@gmail.com"
    cust_res = requests.post(f"{BASE_URL}/api/auth/signup", json={
        "email": cust_email,
        "password": password,
        "role": "CUSTOMER",
        "name": "Arjun Sharma"
    })
    cust_token = cust_res.json()["token"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}

    # Create checkout order for Keyboard (Price 2500, Qty 1)
    # Find Merchant 1's imported Keyboard product
    m1_prods_res = requests.get(f"{BASE_URL}/api/merchant/products", headers=headers1).json()
    m1_prods = m1_prods_res if isinstance(m1_prods_res, list) else m1_prods_res.get("products", [])
    kb_prod = next(p for p in m1_prods if p.get("sku") == f"SKU-KB-{uid1}")

    checkout_res = requests.post(f"{BASE_URL}/api/checkout/create-order", headers=cust_headers, json={
        "items": [{
            "product_id": kb_prod["id"],
            "quantity": 1,
            "unit_price": float(kb_prod["price"])
        }],
        "customer_name": "Arjun Sharma",
        "customer_email": cust_email,
        "customer_phone": "+91 98765 22222",
        "shipping_address": "Koramangala, Bangalore"
    })
    assert checkout_res.status_code == 200, f"Checkout failed: {checkout_res.text}"
    co_data = checkout_res.json()
    order_id = co_data["order_id"]
    razorpay_order_id = co_data["razorpay_order_id"]
    amount_inr = co_data.get("amount_inr", co_data.get("amount", 0))

    log_step(10, "Customer Online Checkout & Razorpay Order Creation", {
        "Customer": cust_email,
        "Order ID": order_id,
        "Razorpay Order ID": razorpay_order_id,
        "Amount": f"₹{amount_inr}",
        "Status": "PASS ✅"
    })

    # -------------------------------------------------------------------------
    # STEP 11: Razorpay Payment Verification & Inventory/Revenue Update
    # -------------------------------------------------------------------------
    import hmac
    import hashlib
    from backend.app.config import settings

    payment_id = f"pay_test_{uid1}"
    secret_key = settings.RAZORPAY_KEY_SECRET or "test_secret"
    generated_sig = hmac.new(
        secret_key.encode("utf-8"),
        f"{razorpay_order_id}|{payment_id}".encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    verify_res = requests.post(f"{BASE_URL}/api/razorpay/verify-payment", json={
        "order_id": order_id,
        "razorpay_order_id": razorpay_order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": generated_sig
    })
    assert verify_res.status_code == 200, f"Verify payment failed: {verify_res.text}"
    assert verify_res.json()["status"] == "PAID", f"Unexpected verify status: {verify_res.json()}"

    # Verify merchant dashboard reflects new revenue and profit
    s11 = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers1).json()
    # Prev rev was 2100 + 2500 = 4600. Prev cost was 1200 + 1200 = 2400. Profit = 2200.
    assert s11["total_revenue"] == 4600.0
    assert s11["gross_profit"] == 2200.0
    assert s11["total_orders"] == 2

    log_step(11, "Payment Settlement, Order Status (PAID) & Financial Ledger", {
        "Settled Order": order_id,
        "Payment ID": f"pay_test_{uid1}",
        "Verification Status": verify_res.json()["status"],
        "Updated Revenue": f"₹{s11['total_revenue']:,.2f}",
        "Updated Cost (COGS)": f"₹{s11['total_cogs']:,.2f}",
        "Updated Gross Profit": f"₹{s11['gross_profit']:,.2f}",
        "Total Orders Count": s11["total_orders"],
        "Status": "PASS ✅"
    })

    # -------------------------------------------------------------------------
    # STEP 12: Confirm Persistence Across Logout and Login
    # -------------------------------------------------------------------------
    # Login again with merchant 1 credentials
    login_res = requests.post(f"{BASE_URL}/api/auth/signin", json={
        "email": merchant1_email,
        "password": password
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    new_token = login_res.json()["token"]
    new_headers = {"Authorization": f"Bearer {new_token}"}

    s12 = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=new_headers).json()
    assert s12["total_revenue"] == 4600.0
    assert s12["gross_profit"] == 2200.0
    assert s12["total_orders"] == 2

    log_step(12, "Persistence Across Re-Authentication & Sessions", {
        "Re-authenticated Merchant": merchant1_email,
        "Persisted Revenue": f"₹{s12['total_revenue']:,.2f}",
        "Persisted Gross Profit": f"₹{s12['gross_profit']:,.2f}",
        "Persisted Orders": s12["total_orders"],
        "Status": "PASS ✅"
    })

    # -------------------------------------------------------------------------
    # STEP 13: Register Second Merchant -> Verify Strict Multi-Tenant Data Isolation
    # -------------------------------------------------------------------------
    uid2 = uuid.uuid4().hex[:6].upper()
    merchant2_email = f"merchant_{uid2.lower()}@otherbiz.com"
    r13 = requests.post(f"{BASE_URL}/api/auth/signup", json={
        "email": merchant2_email,
        "password": password,
        "role": "MERCHANT",
        "name": f"Stationery Owner {uid2}",
        "store_name": f"City Stationery {uid2}",
        "business_category": "Stationery & Books"
    })
    assert r13.status_code == 200
    token2 = r13.json()["token"]
    m2_id = r13.json()["user"]["merchant_id"]
    headers2 = {"Authorization": f"Bearer {token2}"}

    # Merchant 2 MUST see 0 revenue, 0 orders, 0 products from Merchant 1
    s13 = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers2).json()
    assert s13["total_revenue"] == 0.0, f"Data leak detected! Rev: {s13['total_revenue']}"
    assert s13["total_orders"] == 0, f"Data leak detected! Orders: {s13['total_orders']}"
    assert s13["gross_profit"] == 0.0, f"Data leak detected! Profit: {s13['gross_profit']}"

    # Merchant 2 catalog must be empty
    m2_prods = requests.get(f"{BASE_URL}/api/merchant/products", headers=headers2).json()
    m2_list = m2_prods if isinstance(m2_prods, list) else m2_prods.get("products", [])
    assert len(m2_list) == 0, f"Product leak! Expected 0, found {len(m2_list)}"

    log_step(13, "Multi-Tenant Partitioning & Data Isolation", {
        "Merchant 2 ID": m2_id,
        "Merchant 2 Store": f"City Stationery {uid2}",
        "Merchant 2 Revenue (Isolated)": f"₹{s13['total_revenue']}",
        "Merchant 2 Orders (Isolated)": s13["total_orders"],
        "Merchant 2 Catalog Items": len(m2_list),
        "Leak Check": "Zero data leaked from Merchant 1",
        "Status": "PASS ✅"
    })

    # -------------------------------------------------------------------------
    # STEP 14: Settings Configuration & UI Metadata
    # -------------------------------------------------------------------------
    settings_res = requests.get(f"{BASE_URL}/api/merchant/settings", headers=headers1)
    print(f"DEBUG settings_res: {settings_res.status_code} -> {settings_res.text}")
    assert settings_res.status_code == 200, f"Settings fetch failed: {settings_res.text}"
    set_data = settings_res.json()
    assert set_data["merchant_id"] == m1_id

    # Update settings
    up_res = requests.put(f"{BASE_URL}/api/merchant/settings", headers=headers1, json={
        "store_name": f"Apex Premium Hardware {uid1}",
        "business_category": "Hardware & Tools",
        "phone": "+91 99999 88888",
        "address": "Brigade Road, Bangalore",
        "is_demo": False
    })
    assert up_res.status_code == 200
    assert up_res.json()["store_name"] == f"Apex Premium Hardware {uid1}"

    log_step(14, "Business Settings & Workspace Configuration", {
        "Workspace ID": m1_id,
        "Updated Store Name": up_res.json()["store_name"],
        "Updated Category": up_res.json()["business_category"],
        "Contact Phone": up_res.json()["phone"],
        "Store Address": up_res.json()["address"],
        "Status": "PASS ✅"
    })

    print(f"\n🎉 ALL 14 VERIFICATION STEPS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    run_14_step_verification()
