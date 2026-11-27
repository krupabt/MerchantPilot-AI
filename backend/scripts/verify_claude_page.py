import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\df4ae428-8651-40d9-a2f3-88792a12deea\verification_evidence"
os.makedirs(OUTPUT_DIR, exist_ok=True)

PROD_URL = "https://merchantpilot-ai.vercel.app"
BYPASS_HEADER_NAME = "x-vercel-protection-bypass"
BYPASS_HEADER_VALUE = "OsefuL0ZsnbtmAxNdkQ1N1GUpZiJUC9P"

def run_browser_verification():
    print("Launching Playwright Chrome to inspect production Connect Claude page...")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 1050},
            extra_http_headers={BYPASS_HEADER_NAME: BYPASS_HEADER_VALUE}
        )
        page = context.new_page()

        # 1. Sign in as Merchant
        print("1. Signing in as merchant...")
        page.goto(f"{PROD_URL}/merchant/signin", wait_until="domcontentloaded")
        page.wait_for_selector("#merchant-email", timeout=15000)
        page.fill("#merchant-email", "merchant@merchantpilot.ai")
        page.fill("#merchant-password", "Admin@123456")
        page.click("button:has-text('Sign In to Workspace')")

        page.wait_for_url("**/merchant/overview", timeout=15000)
        time.sleep(2)
        print("Logged in, current URL:", page.url)

        # 2. Navigate to Connect Claude page
        print("2. Navigating to Connect Claude page...")
        page.goto(f"{PROD_URL}/merchant/claude", wait_until="networkidle")
        time.sleep(2)

        # Generate a token through the UI
        print("3. Generating a new token via UI...")
        page.fill("input[placeholder*='Token description']", "Claude Desktop Workstation")
        page.click("button:has-text('Generate Token')")
        time.sleep(2)

        # Capture Overview Tab with generated token
        ss_overview = os.path.join(OUTPUT_DIR, "production_connect_claude_overview.png")
        page.screenshot(path=ss_overview, full_page=True)
        print("Saved:", ss_overview)

        # Switch to Tools Directory Tab
        print("4. Switching to Tools Directory Tab...")
        page.click("button:has-text('MCP Tools Directory')")
        time.sleep(1)
        page.evaluate("window.scrollTo(0, 300)")
        time.sleep(1)
        ss_tools = os.path.join(OUTPUT_DIR, "production_connect_claude_tools.png")
        page.screenshot(path=ss_tools, full_page=True)
        print("Saved:", ss_tools)

        # Switch to Live Activity Audit Tab
        print("5. Switching to Live Activity Audit Tab...")
        page.click("button:has-text('Live Activity Audit')")
        time.sleep(1)
        page.evaluate("window.scrollTo(0, 200)")
        time.sleep(1)
        ss_activity = os.path.join(OUTPUT_DIR, "production_connect_claude_activity.png")
        page.screenshot(path=ss_activity, full_page=True)
        print("Saved:", ss_activity)

        browser.close()
        print("Browser inspection completed successfully!")

if __name__ == "__main__":
    run_browser_verification()
