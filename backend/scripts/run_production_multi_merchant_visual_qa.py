import os
import sys
import time
import uuid
from playwright.sync_api import sync_playwright

OUTPUT_DIR = r"C:\Users\Admin\.gemini\antigravity\brain\df4ae428-8651-40d9-a2f3-88792a12deea\verification_evidence"
os.makedirs(OUTPUT_DIR, exist_ok=True)

PROD_URL = "https://merchantpilot-ai.vercel.app"

def run_prod_visual_verification():
    print(f"\n=======================================================")
    print(f"🚀 VERIFYING PRODUCTION MULTI-MERCHANT SYSTEM ON {PROD_URL}")
    print(f"=======================================================\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)

        # -----------------------------------------------------------------
        # 1. Desktop Homepage Verification
        # -----------------------------------------------------------------
        print("--- 1. Verifying Editorial Homepage ---")
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        page.goto(PROD_URL, wait_until="networkidle")
        time.sleep(2)
        h1 = page.locator("h1").inner_text()
        print(f"H1 Title: {h1}")
        assert "Better essentials." in h1

        ss_home = os.path.join(OUTPUT_DIR, "production_type1_homepage.png")
        page.screenshot(path=ss_home, full_page=True)
        print(f"✅ Captured: {ss_home}")

        # -----------------------------------------------------------------
        # 2. Public Storefront: /store/smart-accessories
        # -----------------------------------------------------------------
        print("\n--- 2. Verifying Public Storefront /store/smart-accessories ---")
        page.goto(f"{PROD_URL}/store/smart-accessories", wait_until="domcontentloaded")
        page.wait_for_selector("h1", timeout=15000)
        time.sleep(2)
        
        store_title = page.locator("h1").inner_text()
        print(f"Store Title: {store_title}")
        assert "Smart Accessories Store" in store_title

        ss_store = os.path.join(OUTPUT_DIR, "production_public_storefront.png")
        page.screenshot(path=ss_store, full_page=True)
        print(f"✅ Captured: {ss_store}")

        # -----------------------------------------------------------------
        # 3. Merchant Registration -> Onboarding Workflow
        # -----------------------------------------------------------------
        print("\n--- 3. Verifying Merchant Signup & Onboarding ---")
        page.goto(f"{PROD_URL}/merchant/signup", wait_until="domcontentloaded")
        page.wait_for_selector("button:has-text('Create Merchant Account')", timeout=15000)
        time.sleep(1)

        rand_suffix = uuid.uuid4().hex[:6]
        biz_email = f"aarav_test_{rand_suffix}@store.com"
        page.locator("input[placeholder='Aarav Patel']").fill("Aarav Sharma")
        page.locator("input[placeholder='e.g. Apex Tech Retailers']").fill(f"Urban Fashion {rand_suffix}")
        page.locator("input[placeholder='aarav@apextech.in']").fill(biz_email)
        page.locator("input[placeholder='Create a robust password']").fill("Password123!")
        page.locator("input[placeholder='Re-type your password']").fill("Password123!")
        
        ss_signup = os.path.join(OUTPUT_DIR, "production_merchant_signup.png")
        page.screenshot(path=ss_signup, full_page=True)
        print(f"✅ Captured: {ss_signup}")

        # Submit registration
        page.locator("button:has-text('Create Merchant Account')").click()
        page.wait_for_url("**/merchant/onboarding**", timeout=12000)
        time.sleep(2)
        print(f"Current URL after registration: {page.url}")
        assert "/merchant/onboarding" in page.url

        ss_onboarding = os.path.join(OUTPUT_DIR, "production_merchant_onboarding_step1.png")
        page.screenshot(path=ss_onboarding, full_page=True)
        print(f"✅ Captured: {ss_onboarding}")

        # Fill Step 1 and proceed to Step 2
        page.locator("button:has-text('Continue to Step 2')").click()
        time.sleep(1)

        ss_onboarding_step2 = os.path.join(OUTPUT_DIR, "production_merchant_onboarding_step2.png")
        page.screenshot(path=ss_onboarding_step2, full_page=True)
        print(f"✅ Captured: {ss_onboarding_step2}")

        # -----------------------------------------------------------------
        # 4. Merchant Dashboard Catalog & Orders
        # -----------------------------------------------------------------
        print("\n--- 4. Verifying Merchant Catalog & Orders Management ---")
        page.goto(f"{PROD_URL}/merchant/products", wait_until="domcontentloaded")
        page.wait_for_selector("h1", timeout=15000)
        time.sleep(2)
        ss_catalog = os.path.join(OUTPUT_DIR, "production_merchant_catalog.png")
        page.screenshot(path=ss_catalog, full_page=True)
        print(f"✅ Captured: {ss_catalog}")

        page.goto(f"{PROD_URL}/merchant/orders", wait_until="domcontentloaded")
        page.wait_for_selector("h1", timeout=15000)
        time.sleep(2)
        ss_orders = os.path.join(OUTPUT_DIR, "production_merchant_orders.png")
        page.screenshot(path=ss_orders, full_page=True)
        print(f"✅ Captured: {ss_orders}")

        browser.close()

    print("\n" + "=" * 70)
    print("🎉 ALL PRODUCTION VISUAL QA VERIFICATIONS COMPLETED AND CAPTURED!")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    run_prod_visual_verification()
