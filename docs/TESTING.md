# MerchantPilot AI 2.0 — Testing & QA Documentation

MerchantPilot AI 2.0 includes a comprehensive automated test suite covering all critical workflows, cryptographic checks, role-based authorization, inventory concurrency, and failure scenarios.

---

## 1. Test Suite Architecture

The test suite contains **48 automated tests** across 11 test modules:

| Test Module | Coverage Area | Tests | Status |
|---|---|:---:|:---:|
| `test_auth_phase3.py` | JWT authentication, role authorization, cart provisioning, PBKDF2 hashing | 6 | ✅ Passed |
| `test_merchant_phase4.py` | Merchant database-derived metrics, product CRUD, tenant isolation, fulfillment | 4 | ✅ Passed |
| `test_customer_phase5.py` | Persistent cart CRUD, stock boundaries, order history isolation | 4 | ✅ Passed |
| `test_payments_phase6.py` | Razorpay paise calculation, HMAC signature validation, raw-body webhooks, idempotency | 3 | ✅ Passed |
| `test_ai_shopping_phase7.py` | Natural language query parsing, budget filtering, policy violation blocking, agent chat contract | 4 | ✅ Passed |
| `test_merchant_ai_phase8.py` | Natural language business query answering, low-stock alerts, AOV, bundle recommendations | 4 | ✅ Passed |
| `test_apriori_phase9.py` | Genuine Apriori association rule mining, support/confidence/lift, dynamic bundles | 2 | ✅ Passed |
| `test_agent_flows.py` | End-to-end buyer flow, compliant bundle scenario, deliberate policy violation scenario | 2 | ✅ Passed |
| `test_catalog.py` | Agent catalog structure, keyword/category search, batch availability checking | 4 | ✅ Passed |
| `test_policy_engine.py` | Discount percentage limits, transaction ceilings, restricted action blocking | 5 | ✅ Passed |
| `test_failure_scenarios.py` | Out-of-stock rejection, invalid cryptographic signature rejection, audit recording | 3 | ✅ Passed |
| `test_razorpay_checkout.py` | Checkout order creation API, client verification flow | 2 | ✅ Passed |
| `test_revenue_intelligence.py` | Cross-sell and upsell recommendations, revenue insights endpoint | 4 | ✅ Passed |
| `test_audit.py` | Audit event logging and filtering | 1 | ✅ Passed |
| **Total** | **Comprehensive Full-Stack Coverage** | **48** | **100% Passed** |

---

## 2. Running Automated Tests

### Run All Backend Tests
```bash
python -m pytest backend/tests -v
```

### Run Specific Test Suites
```bash
# Test Payments & Webhook Idempotency
python -m pytest backend/tests/test_payments_phase6.py -v

# Test Genuine Apriori Market Basket Analysis
python -m pytest backend/tests/test_apriori_phase9.py -v

# Test Merchant AI Business Assistant
python -m pytest backend/tests/test_merchant_ai_phase8.py -v

# Test Customer Persistent Cart & Isolation
python -m pytest backend/tests/test_customer_phase5.py -v
```

### Run Frontend Production Build Check
```bash
npm --prefix frontend run build
```

---

## 3. Key Edge Cases Verified

1. **Client Price Manipulation**: Submitting a modified `unit_price` in checkout is completely ignored; price is recalculated server-side from database catalog records.
2. **Inventory Race Conditions & Duplicate Webhooks**: Verifying a payment multiple times or receiving duplicate `payment.captured` webhooks does NOT double-decrement inventory.
3. **Over-Ordering Prevention**: Requesting more units than currently in stock returns an immediate HTTP 400 with a clear error message.
4. **Tenant Isolation**: Merchants cannot view, edit, or archive products belonging to other merchants. Customers cannot view other customers' orders.
5. **Excessive Discount Blocking**: Buyer requests exceeding the 10% discount cap are intercepted by the deterministic policy engine, recorded as violations, and blocked from order creation.
