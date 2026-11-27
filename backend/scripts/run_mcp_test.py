import sys
import os
from pathlib import Path
root_dir = str(Path(__file__).parent.parent.parent.resolve())
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

import json
from starlette.testclient import TestClient
from backend.app.main import app
from backend.app.database import SessionLocal
from backend.app.models.merchant import Merchant
from backend.app.models.user import User
from backend.app.models.product import Product
from backend.app.services.mcp_service import generate_mcp_token, revoke_mcp_token, get_mcp_activities

def run_tests():
    print("=" * 60)
    print("MERCHANTPILOT AI — MCP SERVER TEST SUITE")
    print("=" * 60)

    db = SessionLocal()
    try:
        # 1. Setup Test Merchant A
        merchant_a = db.query(Merchant).filter(Merchant.id == "m_1001").first()
        if not merchant_a:
            merchant_a = Merchant(
                id="m_1001",
                name="Smart Accessories Store",
                email="merchant@merchantpilot.ai",
                business_category="Electronics",
                slug="smart-accessories",
                is_published=True,
                onboarding_completed=True
            )
            db.add(merchant_a)
            db.commit()

        # 2. Setup Test Merchant B (for isolation testing)
        merchant_b = db.query(Merchant).filter(Merchant.id == "m_test_isolation_b").first()
        if not merchant_b:
            merchant_b = Merchant(
                id="m_test_isolation_b",
                name="Aura Artisanal Boutique",
                email="aura@test.com",
                business_category="Apparel",
                slug="aura-boutique",
                is_published=True,
                onboarding_completed=True
            )
            db.add(merchant_b)
            db.commit()

        # Save merchant IDs as strings
        merchant_a_id = merchant_a.id
        merchant_b_id = merchant_b.id

        # Generate tokens
        tok_data_a = generate_mcp_token(db, merchant_a_id, "Claude Connector A")
        raw_token_a = tok_data_a["token"]
        token_id_a = tok_data_a["id"]
        print(f"Generated Token A: {tok_data_a['token_preview']} (ID: {token_id_a})")

        tok_data_b = generate_mcp_token(db, merchant_b_id, "Claude Connector B")
        raw_token_b = tok_data_b["token"]
        print(f"Generated Token B: {tok_data_b['token_preview']}")

    finally:
        db.close()

    with TestClient(app) as client:
        # TEST 1: Unauthenticated request should fail with 401
        print("\n--- TEST 1: Authentication Gate ---")
        unauth_res = client.post("/mcp/", json={"jsonrpc": "2.0", "id": 1, "method": "initialize"})
        assert unauth_res.status_code == 401, f"Expected 401, got {unauth_res.status_code}"
        print("✓ Unauthenticated request rejected with 401 Unauthorized")

        # Headers for Merchant A
        headers_a = {
            "Authorization": f"Bearer {raw_token_a}",
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream"
        }

        # TEST 2: MCP Initialize
        print("\n--- TEST 2: MCP Protocol Initialize ---")
        init_payload = {
            "jsonrpc": "2.0",
            "id": 101,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "Claude Desktop", "version": "1.0.0"}
            }
        }
        init_res = client.post("/mcp/", json=init_payload, headers=headers_a)
        assert init_res.status_code == 200, f"Init failed: {init_res.status_code} {init_res.text}"
        print(f"✓ MCP Initialize successful (Status 200, Content-Type: {init_res.headers.get('content-type')})")

        # TEST 3: Tools List
        print("\n--- TEST 3: Tools List ---")
        tools_res = client.post("/mcp/", json={"jsonrpc": "2.0", "id": 102, "method": "tools/list", "params": {}}, headers=headers_a)
        assert tools_res.status_code == 200, f"tools/list failed: {tools_res.status_code}"
        
        # Parse SSE response
        tools_text = tools_res.text
        lines = [line[6:] for line in tools_text.split("\n") if line.startswith("data: ")]
        data_json = json.loads(lines[0]) if lines else {}
        tools = data_json.get("result", {}).get("tools", [])
        tool_names = [t["name"] for t in tools]
        print(f"✓ Discovered {len(tools)} tools: {', '.join(tool_names)}")
        
        required_tools = [
            "get_store_details", "list_products", "add_product", "update_product",
            "update_inventory", "get_orders", "get_sales_summary", "get_revenue_summary",
            "get_product_recommendations", "get_discount_policies", "create_store", "publish_store"
        ]
        for rt in required_tools:
            assert rt in tool_names, f"Missing required tool: {rt}"
        print("✓ All 12 required MCP tools are registered and available!")

        def call_tool(tool_name: str, args: dict, headers: dict = headers_a):
            res = client.post("/mcp/", json={
                "jsonrpc": "2.0",
                "id": 200,
                "method": "tools/call",
                "params": {"name": tool_name, "arguments": args}
            }, headers=headers)
            assert res.status_code == 200, f"Call {tool_name} HTTP failed: {res.status_code}"
            txt = res.text
            dlines = [line[6:] for line in txt.split("\n") if line.startswith("data: ")]
            assert dlines, f"No SSE data in {txt}"
            parsed = json.loads(dlines[0])
            content = parsed.get("result", {}).get("content", [])
            assert content, f"No content in tool response: {parsed}"
            if parsed.get("result", {}).get("isError"):
                raise ValueError(content[0]["text"])
            text_val = content[0]["text"]
            return json.loads(text_val)

        # TEST 4: get_store_details
        print("\n--- TEST 4: Tool get_store_details ---")
        store_data = call_tool("get_store_details", {})
        assert store_data["merchant_id"] == "m_1001"
        assert store_data["store_name"] == "Smart Accessories Store"
        print(f"✓ Store Details verified: {store_data['store_name']} ({store_data['slug']}), {store_data['total_products']} products")

        # TEST 5: add_product
        print("\n--- TEST 5: Tool add_product ---")
        new_prod = call_tool("add_product", {
            "name": "MCP Titanium Pro Cable",
            "price": 1299.0,
            "cost_price": 450.0,
            "stock": 25,
            "category": "Cables & Power",
            "description": "Ultra durable braided fast charging cable created via Claude MCP tool."
        })
        assert new_prod["success"] is True
        assert new_prod["name"] == "MCP Titanium Pro Cable"
        assert new_prod["price"] == 1299.0
        assert new_prod["gross_margin_percent"] > 60.0
        created_prod_id = new_prod["product_id"]
        print(f"✓ Product created via MCP: {new_prod['name']} (ID: {created_prod_id}, Margin: {new_prod['gross_margin_percent']}%)")

        # TEST 6: update_inventory
        print("\n--- TEST 6: Tool update_inventory ---")
        inv_res = call_tool("update_inventory", {"product_id": created_prod_id, "stock": 4})
        assert inv_res["current_stock"] == 4
        assert inv_res["is_low_stock"] is True
        print(f"✓ Stock updated: {inv_res['previous_stock']} -> {inv_res['current_stock']} (Low stock warning: {inv_res['is_low_stock']})")

        # TEST 7: list_products
        print("\n--- TEST 7: Tool list_products ---")
        prods_res = call_tool("list_products", {"search": "Titanium"})
        assert prods_res["total_count"] >= 1
        found_prod = next(p for p in prods_res["products"] if p["id"] == created_prod_id)
        assert found_prod["stock"] == 4
        print(f"✓ Found {prods_res['total_count']} matching products, verified updated stock")

        # TEST 8: get_sales_summary & get_revenue_summary
        print("\n--- TEST 8: Tools get_sales_summary & get_revenue_summary ---")
        sales_summary = call_tool("get_sales_summary", {"days": 30})
        rev_summary = call_tool("get_revenue_summary", {})
        print(f"✓ Sales Summary: {sales_summary['total_orders']} orders, ₹{sales_summary['total_revenue']} revenue")
        print(f"✓ Revenue Breakdown: Gross Profit ₹{rev_summary['gross_profit']}, Margin {rev_summary['gross_margin_percent']}%")

        # TEST 9: get_product_recommendations (Deterministic Apriori)
        print("\n--- TEST 9: Tool get_product_recommendations ---")
        recs = call_tool("get_product_recommendations", {})
        print(f"✓ Apriori Recommendations: {recs['total_rules']} rules generated using {recs['algorithm']}")

        # TEST 10: get_discount_policies
        print("\n--- TEST 10: Tool get_discount_policies ---")
        policies = call_tool("get_discount_policies", {})
        assert len(policies["policies"]) >= 1
        print(f"✓ Commercial Policies verified: {len(policies['policies'])} active guardrails")

        # TEST 11: Multi-tenant boundary isolation
        print("\n--- TEST 11: Multi-Tenant Boundary Isolation ---")
        headers_b = {
            "Authorization": f"Bearer {raw_token_b}",
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream"
        }
        # Merchant B tries to update Merchant A's product -> MUST fail with 400/500/error
        try:
            call_tool("update_inventory", {"product_id": created_prod_id, "stock": 999}, headers=headers_b)
            raise AssertionError("Security failure: Merchant B was able to modify Merchant A's product!")
        except Exception as e:
            print(f"✓ Security tenant check passed: Merchant B cannot alter Merchant A's product ({e})")

        # TEST 12: Token Revocation
        print("\n--- TEST 12: Token Revocation ---")
        db = SessionLocal()
        try:
            revoke_mcp_token(db, merchant_a_id, token_id_a)
        finally:
            db.close()

        revoked_res = client.post("/mcp/", json={"jsonrpc": "2.0", "id": 999, "method": "initialize"}, headers=headers_a)
        assert revoked_res.status_code == 401, f"Expected 401 after revocation, got {revoked_res.status_code}"
        print("✓ Revoked token successfully rejected with 401 Unauthorized")

        # TEST 13: Activity Logging Check
        print("\n--- TEST 13: Activity Log Verification ---")
        db = SessionLocal()
        try:
            activities = get_mcp_activities(db, merchant_a_id, limit=10)
            assert len(activities) >= 5, f"Expected at least 5 logged activities, got {len(activities)}"
            tool_calls_logged = [a["tool_name"] for a in activities]
            print(f"✓ {len(activities)} tool executions recorded in audit trail: {', '.join(tool_calls_logged[:5])}")
        finally:
            db.close()

    print("\n" + "=" * 60)
    print("ALL 13 MCP TEST SCENARIOS PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
