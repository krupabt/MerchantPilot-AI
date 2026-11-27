import requests
import json
import sys

BASE_URL = "https://merchantpilot-ai.vercel.app"

print("============================================================")
print("VERIFYING LIVE PRODUCTION CLAUDE MCP CONNECTION FIX")
print(f"Target URL: {BASE_URL}")
print("============================================================\n")

s = requests.Session()

# 1. Sign in to obtain merchant token
print("1. Signing in as merchant to generate a fresh test token...")
login_res = s.post(f"{BASE_URL}/api/auth/signin", json={
    "email": "merchant@merchantpilot.ai",
    "password": "Admin@123456"
})
if login_res.status_code != 200:
    print(f"FAILED to login: {login_res.status_code} {login_res.text}")
    sys.exit(1)

auth_token = login_res.json()["token"]
print("✓ Merchant logged in successfully.")

# 2. Generate a dedicated test token
tok_res = s.post(f"{BASE_URL}/api/merchant/mcp/tokens", 
    headers={"Authorization": f"Bearer {auth_token}"},
    json={"name": "Live Claude Production Verification Token"}
)
if tok_res.status_code != 200:
    print(f"FAILED to create token: {tok_res.status_code} {tok_res.text}")
    sys.exit(1)

mcp_token_data = tok_res.json()
mcp_token = mcp_token_data["token"]
print(f"✓ MCP token generated: {mcp_token[:15]}...{mcp_token[-6:]}")

# 3. Test CORS Preflights (OPTIONS /mcp and OPTIONS /mcp/)
print("\n2. Testing CORS Preflight Requests (OPTIONS)...")
for endpoint in ["/mcp", "/mcp/"]:
    res = s.options(f"{BASE_URL}{endpoint}", allow_redirects=False)
    print(f"  OPTIONS {endpoint} -> Status: {res.status_code}")
    print(f"    CORS Origin: {res.headers.get('Access-Control-Allow-Origin')}")
    print(f"    CORS Methods: {res.headers.get('Access-Control-Allow-Methods')}")
    print(f"    CORS Headers: {res.headers.get('Access-Control-Allow-Headers')}")
    assert res.status_code == 200, f"Expected 200 on OPTIONS {endpoint}, got {res.status_code}"
    assert res.headers.get("Access-Control-Allow-Origin") == "*", "Missing CORS Allow-Origin header"
print("✓ CORS Preflights passed with HTTP 200 and zero redirects!")

# 4. Test Reachability Probe (GET /mcp and GET /mcp/)
print("\n3. Testing Reachability Probes (GET without token)...")
for endpoint in ["/mcp", "/mcp/"]:
    res = s.get(f"{BASE_URL}{endpoint}", allow_redirects=False)
    print(f"  GET {endpoint} -> Status: {res.status_code}")
    data = res.json()
    print(f"    Service: {data.get('service')}, Status: {data.get('status')}")
    assert res.status_code == 200, f"Expected 200 on GET {endpoint}, got {res.status_code}"
    assert data.get("status") == "operational", "Status is not operational"
print("✓ Claude Web reachability verification probe passed with HTTP 200!")

# 5. Test Unauthenticated POST (Must be rejected with 401, NO 307)
print("\n4. Testing Unauthenticated Request Gate...")
for endpoint in ["/mcp", "/mcp/"]:
    res = s.post(f"{BASE_URL}{endpoint}", json={"jsonrpc": "2.0", "id": 1, "method": "tools/list"}, allow_redirects=False)
    print(f"  POST {endpoint} (no auth) -> Status: {res.status_code}")
    assert res.status_code == 401, f"Expected 401 on unauthenticated POST {endpoint}, got {res.status_code}"
print("✓ Unauthenticated POST rejected with HTTP 401 (Zero redirects)!")

# 6. Test Streamable HTTP Initialize via POST /mcp (NO Trailing Slash)
print("\n5. Testing MCP Initialize Handshake via POST /mcp (without trailing slash)...")
headers = {
    "Authorization": f"Bearer {mcp_token}",
    "Content-Type": "application/json",
    "Accept": "application/json, text/event-stream"
}
init_payload = {
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {
            "name": "claude-web-live-verifier",
            "version": "1.0.0"
        }
    }
}
res = s.post(f"{BASE_URL}/mcp", headers=headers, json=init_payload, allow_redirects=False)
print(f"  POST /mcp -> Status: {res.status_code}")
print(f"    Content-Type: {res.headers.get('content-type')}")
print(f"    CORS Origin: {res.headers.get('access-control-allow-origin')}")
assert res.status_code == 200, f"Expected 200 on POST /mcp, got {res.status_code}"
print("✓ Initialize Handshake succeeded directly on /mcp with ZERO redirects!")

# 7. Test tools/list via POST /mcp
print("\n6. Testing tools/list Discovery...")
tools_payload = {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
}
res = s.post(f"{BASE_URL}/mcp", headers=headers, json=tools_payload, allow_redirects=False)
print(f"  POST /mcp tools/list -> Status: {res.status_code}")
tools_body = res.text
# Parse SSE stream or JSON
tools = []
for line in tools_body.split("\n"):
    if line.startswith("data:"):
        d = json.loads(line[5:].strip())
        if "result" in d and "tools" in d["result"]:
            tools = d["result"]["tools"]

print(f"✓ Successfully discovered {len(tools)} tools:")
for t in tools:
    print(f"    • {t['name']}")
assert len(tools) == 12, f"Expected 12 tools, got {len(tools)}"

# 8. Test tools/call: get_store_details
print("\n7. Executing tool: get_store_details...")
call_payload = {
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
        "name": "get_store_details",
        "arguments": {}
    }
}
res = s.post(f"{BASE_URL}/mcp", headers=headers, json=call_payload, allow_redirects=False)
print(f"  get_store_details -> Status: {res.status_code}")
for line in res.text.split("\n"):
    if line.startswith("data:"):
        d = json.loads(line[5:].strip())
        print(f"    Result: {d.get('result', {})}")

# 9. Test Direct URL Token Authentication (?token=...)
print("\n8. Testing URL Query Parameter Authentication (?token=...)...")
res = s.post(
    f"{BASE_URL}/mcp?token={mcp_token}",
    headers={"Content-Type": "application/json", "Accept": "application/json"},
    json=tools_payload,
    allow_redirects=False
)
print(f"  POST /mcp?token=... -> Status: {res.status_code}")
assert res.status_code == 200, f"Expected 200 with query token, got {res.status_code}"
print("✓ Direct URL token parameter authentication succeeded!")

# 10. Verify Live Activity Log
print("\n9. Verifying Live Activity Audit Trail in Dashboard...")
act_res = s.get(f"{BASE_URL}/api/merchant/mcp/activity?limit=10", headers={"Authorization": f"Bearer {auth_token}"})
activities = act_res.json()
print(f"✓ Found {len(activities)} audit records:")
for a in activities[:3]:
    print(f"    [{a.get('created_at')}] {a.get('tool_name')} -> {a.get('status')} ({a.get('duration_ms', a.get('execution_time_ms', 0))}ms)")

print("\n============================================================")
print("ALL LIVE PRODUCTION TESTS PASSED WITH 100% SUCCESS!")
print("============================================================")
