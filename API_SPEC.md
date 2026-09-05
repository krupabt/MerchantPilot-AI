# MerchantPilot AI — API Specification
**Base URL:** `http://localhost:8000/api`

---

## 1. Agent-Readable Catalog Endpoints (`/api/agent/*`)

### `GET /api/agent/catalog`
Returns the full machine-readable catalog tailored for AI Buyer agents.
- **Query Params:** `category` (optional), `in_stock_only` (bool, default=true), `max_price` (optional float)
- **Response `200 OK`:**
```json
{
  "merchant": {
    "id": "m_1001",
    "name": "Apex Electronics & Compute",
    "currency": "INR"
  },
  "count": 10,
  "products": [
    {
      "id": "P101",
      "name": "Apex ProBook 15 Developer Edition",
      "category": "Laptops",
      "price": 60000.0,
      "currency": "INR",
      "stock": 14,
      "rating": 4.8,
      "specs": {
        "cpu": "Intel Core i7-13700H",
        "ram": "32GB DDR5",
        "storage": "1TB NVMe SSD",
        "os": "Ubuntu / Windows 11"
      },
      "compatible_products": ["P102", "P103", "P104", "P105"],
      "bundling_eligible": true,
      "tags": ["laptop", "programming", "developer", "compute"]
    }
  ]
}
```

### `GET /api/agent/products/{id}`
Returns granular machine specifications, real-time inventory, and compatibility graph for a single product.

### `GET /api/agent/availability`
Batch check stock availability for a list of product IDs.
- **Request Body:** `{"product_ids": ["P101", "P102"]}`
- **Response `200 OK`:**
```json
{
  "all_available": true,
  "items": [
    {"product_id": "P101", "name": "Apex ProBook 15", "available": true, "stock": 14, "price": 60000.0},
    {"product_id": "P102", "name": "Apex Precision Wireless Mouse", "available": true, "stock": 45, "price": 1000.0}
  ]
}
```

### `GET /api/agent/policies`
Returns active merchant commercial rules and constraints for agent validation.
- **Response `200 OK`:**
```json
{
  "max_discount_percentage": 10.0,
  "max_discount_amount": 6000.0,
  "max_transaction_amount": 100000.0,
  "allowed_actions": ["search_catalog", "check_inventory", "recommend_upsell", "recommend_cross_sell", "create_offer", "create_cart"],
  "restricted_actions": ["refund", "arbitrary_price_override", "money_transfer", "bypass_approval"],
  "requires_approval_above_discount_pct": 0.0
}
```

---

## 2. AI Commerce Agent Interaction (`/api/agent/chat`)

### `POST /api/agent/chat`
Autonomous agent interaction endpoint supporting natural language commerce requests.
- **Request Body:**
```json
{
  "session_id": "sess_abc123",
  "message": "I need a laptop for programming under ₹65,000 and a mouse.",
  "customer_id": "cust_101"
}
```
- **Response `200 OK`:**
```json
{
  "session_id": "sess_abc123",
  "message": "I found the ideal setup for your programming requirements...",
  "intent": {
    "category": "Laptops",
    "budget": 65000.0,
    "primary_product": "P101",
    "requested_accessories": ["mouse"]
  },
  "recommendations": {
    "primary": { "id": "P101", "name": "Apex ProBook 15 Developer Edition", "price": 60000.0 },
    "cross_sell": { "id": "P102", "name": "Apex Precision Wireless Mouse", "price": 1000.0, "reason": "82% of developers who bought ProBook 15 purchased this ergonomic wireless mouse." }
  },
  "offer": {
    "original_total": 61000.0,
    "discount_amount": 501.0,
    "discount_percentage": 0.82,
    "final_amount": 60499.0,
    "bundle_title": "Developer Starter Bundle (ProBook 15 + Precision Mouse)"
  },
  "policy_evaluation": {
    "passed": true,
    "reason": "Discount of 0.82% is within the merchant limit of 10.0% (₹501 <= ₹6,000 max discount).",
    "approval_required": true
  },
  "requires_approval": true,
  "action_items": ["P101", "P102"]
}
```

---

## 3. Revenue Intelligence Endpoints (`/api/revenue/*`)

### `GET /api/revenue/insights`
Summary of historical basket associations, cross-sell lift, top bundled pairs, and AI-assisted revenue growth.

### `GET /api/revenue/recommendations/{product_id}`
Computes real-time affinity recommendations based on mined historical transaction baskets.

---

## 4. Policy Guardrails (`/api/policies/*`)

### `GET /api/policies`
Get current policy rules.

### `POST /api/policies/validate`
Deterministic validation of a proposed transaction or discount offer.
- **Request Body:**
```json
{
  "original_amount": 60000.0,
  "proposed_discount": 20000.0,
  "action": "create_offer",
  "product_ids": ["P101"]
}
```
- **Response `200 OK`:**
```json
{
  "passed": false,
  "violation_code": "EXCEEDS_MAX_DISCOUNT",
  "message": "Requested discount of ₹20,000 (33.3%) exceeds maximum allowed discount of 10.0% (₹6,000).",
  "max_allowed_discount": 6000.0,
  "requested_discount": 20000.0
}
```

---

## 5. Razorpay & Checkout Endpoints (`/api/checkout/*` & `/api/razorpay/*`)

### `POST /api/checkout/create-order`
Creates a server-side validated order and registers with Razorpay.
- **Request Body:**
```json
{
  "session_id": "sess_abc123",
  "customer_name": "Demo Buyer",
  "customer_email": "buyer@example.com",
  "items": [
    {"product_id": "P101", "quantity": 1, "price": 60000.0},
    {"product_id": "P102", "quantity": 1, "price": 1000.0}
  ],
  "discount_amount": 501.0,
  "approval_token": "appr_tok_xyz"
}
```
- **Response `200 OK`:**
```json
{
  "order_id": "ord_db_9912",
  "razorpay_order_id": "order_test_991201",
  "amount_paise": 6049900,
  "amount_inr": 60499.0,
  "currency": "INR",
  "key_id": "rzp_test_sampleKey123",
  "merchant_name": "MerchantPilot AI Store"
}
```

### `POST /api/razorpay/verify-payment`
Server-side cryptographic HMAC-SHA256 signature verification.
- **Request Body:**
```json
{
  "order_id": "ord_db_9912",
  "razorpay_order_id": "order_test_991201",
  "razorpay_payment_id": "pay_test_881901",
  "razorpay_signature": "e5c7...618b"
}
```
- **Response `200 OK`:**
```json
{
  "verified": true,
  "status": "PAID",
  "transaction_id": "tx_991201",
  "audit_event_id": "aud_1082"
}
```

### `POST /api/razorpay/webhook`
Razorpay webhook receiver with HMAC signature verification and idempotent order state transition.

---

## 6. Audit Trail Endpoints (`/api/audit/*`)

### `GET /api/audit/logs`
Query full chronological audit trail with filters (`session_id`, `actor`, `policy_result`, `limit`).
