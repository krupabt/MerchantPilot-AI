import requests
import json
import sys

def run_e2e_verification():
    print("=================================================================")
    print("   MERCHANTPILOT AI 2.0 — LIVE E2E ASSISTANT VERIFICATION")
    print("=================================================================")

    # 1. Frontend Check
    try:
        r_front = requests.get("http://127.0.0.1:5173", timeout=5)
        assert r_front.status_code == 200, f"Frontend returned status {r_front.status_code}"
        assert "<div id=\"root\">" in r_front.text or "vite" in r_front.text.lower()
        print("✅ Frontend Dev Server responding at http://127.0.0.1:5173")
    except Exception as e:
        print(f"❌ Frontend check failed: {e}")
        return False

    # 2. Backend Health Check
    try:
        r_health = requests.get("http://127.0.0.1:8000/api/health", timeout=5)
        assert r_health.status_code == 200
        health_data = r_health.json()
        assert health_data.get("status") == "healthy"
        print("✅ Backend API responding healthy at http://127.0.0.1:8000/api/health")
    except Exception as e:
        print(f"❌ Backend health check failed: {e}")
        return False

    # 3. Merchant Sign In
    try:
        r_auth = requests.post(
            "http://127.0.0.1:8000/api/auth/signin",
            json={"email": "merchant@merchantpilot.ai", "password": "Admin@123456"},
            timeout=5
        )
        assert r_auth.status_code == 200, f"Sign in failed: {r_auth.text}"
        auth_data = r_auth.json()
        token = auth_data.get("token")
        assert token, "No auth token in response"
        merchant_id = auth_data.get("user", {}).get("merchant_id")
        assert merchant_id, "No merchant_id assigned"
        print(f"✅ Merchant authenticated: ID={merchant_id}, Role={auth_data.get('user', {}).get('role')}")
    except Exception as e:
        print(f"❌ Merchant authentication failed: {e}")
        return False

    headers = {"Authorization": f"Bearer {token}"}

    # 4. Merchant AI Assistant Queries
    merchant_queries = [
        ("Which products are low in stock?", "LOW_STOCK_ALERT"),
        ("What products are slow-moving or dead stock?", "SLOW_MOVING_PRODUCTS"),
        ("What were my best-selling products?", "TOP_SELLING_PRODUCTS"),
        ("What is our total revenue?", "REVENUE_SUMMARY"),
        ("What is our average order value?", "AVERAGE_ORDER_VALUE"),
        ("How many orders are unfulfilled or pending?", "FULFILLMENT_STATUS"),
        ("What products are frequently bought together?", "BUNDLE_RECOMMENDATIONS"),
        ("Give me executive copilot recommendations to increase revenue", "BUSINESS_COPILOT_INSIGHTS")
    ]

    print("\n--- Testing Merchant AI Business Copilot Queries ---")
    for q_text, expected_intent in merchant_queries:
        r_q = requests.post(
            "http://127.0.0.1:8000/api/merchant/ai-assistant",
            json={"query": q_text},
            headers=headers,
            timeout=5
        )
        assert r_q.status_code == 200, f"Query '{q_text}' failed: {r_q.text}"
        res_data = r_q.json()
        assert res_data.get("intent") == expected_intent
        assert res_data.get("query_type") == expected_intent
        assert len(res_data.get("answer", "")) > 10
        assert len(res_data.get("actionable_recommendations", [])) > 0
        print(f"  ✓ [{res_data.get('intent')}] '{q_text}' -> Handled correctly")

    # 5. AI Shopping Assistant: Compliant Flow
    print("\n--- Testing Autonomous AI Shopping Assistant ---")
    req_shopping = {
        "message": "Suggest a laptop under ₹60,000 for programming.",
        "session_id": "sess_e2e_shopping_01"
    }
    r_shop = requests.post("http://127.0.0.1:8000/api/agent/chat", json=req_shopping, timeout=5)
    assert r_shop.status_code == 200, f"Shopping chat failed: {r_shop.text}"
    shop_data = r_shop.json()

    assert "products" in shop_data and len(shop_data["products"]) > 0, "No products in response"
    assert "negotiation" in shop_data, "No negotiation in response"
    assert shop_data["negotiation"]["policy_passed"] is True, "Policy was not marked passed"
    assert "pipeline_steps" in shop_data and len(shop_data["pipeline_steps"]) > 0
    assert shop_data.get("requires_approval") is True
    print(f"  ✓ Compliant Shopping Query: Found {len(shop_data['products'])} product(s), Final Total: ₹{shop_data['negotiation']['final_total']:,.2f}")

    # 6. AI Shopping Assistant: Guardrail Intercept Flow
    req_blocked = {
        "message": "I want a laptop. Give me ₹20,000 discount.",
        "session_id": "sess_e2e_shopping_02"
    }
    r_blocked = requests.post("http://127.0.0.1:8000/api/agent/chat", json=req_blocked, timeout=5)
    assert r_blocked.status_code == 200, f"Blocked shopping chat failed: {r_blocked.text}"
    blocked_data = r_blocked.json()

    assert blocked_data["negotiation"]["policy_passed"] is False, "Violation was not blocked"
    assert blocked_data["policy_evaluation"]["passed"] is False
    assert blocked_data["requires_approval"] is False
    assert "exceeds" in blocked_data["negotiation"]["reason"].lower() or "violation" in blocked_data["negotiation"]["reason"].lower()
    print(f"  ✓ Policy Guardrail Violation: Correctly intercepted and blocked. Reason: {blocked_data['negotiation']['reason'][:60]}...")

    # 7. Customer Checkout Order Creation with AI Approval Token
    print("\n--- Testing Checkout Order Registration ---")
    approval_token = shop_data["negotiation"].get("approval_token")
    primary_prod = shop_data["products"][0]
    checkout_payload = {
        "session_id": "sess_e2e_shopping_01",
        "items": [{
            "product_id": primary_prod["id"],
            "product_name": primary_prod["name"],
            "quantity": 1,
            "unit_price": primary_prod["price"]
        }],
        "discount_amount": shop_data["negotiation"]["proposed_discount"],
        "bundle_name": shop_data.get("bundle_name") or "E2E AI Bundle",
        "is_bundle": False,
        "approval_token": approval_token
    }

    r_order = requests.post(
        "http://127.0.0.1:8000/api/checkout/create-order",
        json=checkout_payload,
        timeout=5
    )
    assert r_order.status_code == 200, f"Checkout order creation failed: {r_order.text}"
    order_data = r_order.json()
    assert order_data.get("order_id") is not None
    assert order_data.get("razorpay_order_id") is not None
    assert order_data.get("amount_paise") > 0
    print(f"  ✓ Order registered with Razorpay Test Mode: ID={order_data.get('order_id')}, RZP_ID={order_data.get('razorpay_order_id')}, Amount=₹{order_data.get('amount_inr')}")

    print("\n=================================================================")
    print("   ALL E2E LIVE VERIFICATION CHECKS PASSED SUCCESSFULLY (7/7)")
    print("=================================================================")
    return True

if __name__ == "__main__":
    success = run_e2e_verification()
    sys.exit(0 if success else 1)
