# MerchantPilot AI 2.0 — Feature Deep Dive

MerchantPilot AI 2.0 delivers an integrated full-stack commerce suite engineered for both customers and merchants.

---

## 1. Customer Commerce Storefront
- **Hardware Catalog**: Rich grid of developer hardware, monitors, laptops, and ergonomic peripherals.
- **Real-Time Stock Availability**: Displays exact units remaining with automated badges for *In Stock*, *Low Stock (≤ threshold)*, and *Out of Stock*.
- **Machine Specifications Modal**: Deep view of hardware architecture, processor, RAM, port connectivity, and manufacturer compatibility.
- **Instant Cart Actions**: Add to cart with real-time stock boundary enforcement.

---

## 2. Persistent Shopping Cart
- **Database Persistence**: Carts are permanently stored in the database for authenticated users across devices and browser sessions.
- **Live Stock Bounds**: Prevents adding more units than physically available in stock. Automatically prevents adding sold-out products.
- **Dynamic Quantity Controls**: Increment/decrement controls with instant subtotal and tax calculation.

---

## 3. AI Shopping Assistant (Natural Language NLU)
- **Natural Language Inquiry**: Accepts customer queries such as:
  - *"I need a laptop for programming under ₹65,000 and a mouse"*
  - *"Suggest wireless headphones under ₹60,000"*
  - *"Looking for a 4K monitor and a webcam under ₹35,000"*
- **Zero Hallucination Guarantee**: Directly queries the live database catalog; strictly returns authentic products, genuine prices, and real stock levels.
- **Explainable Recommendation Pitch**: Outlines why each item is suggested based on hardware specifications and compatibility.
- **Direct Cart & Checkout Links**: Allows adding individual recommended items or the entire bundled offer directly into the customer's cart or initiating immediate Razorpay checkout.

---

## 4. Merchant Operations Portal
- **Real-Time Database Derived KPIs**:
  - Total Verified Paid Revenue
  - Completed Transaction Count
  - Average Order Value (AOV)
  - 7-Day Revenue Trend (daily SQL aggregations)
- **Product Management & Inventory Controls**:
  - Create new products with custom SKU, category, price, and specs.
  - Set customizable low-stock warning thresholds.
  - Quick stock increment/decrement buttons (+5, -1, custom setter).
  - Archive obsolete products.
- **Order Management & Fulfillment**:
  - Filter orders by status (`PAID`, `PENDING`, `FAILED`).
  - Manage fulfillment pipeline: `UNFULFILLED` → `PROCESSING` → `SHIPPED` → `DELIVERED`.

---

## 5. Merchant AI Business Assistant
- **Conversational Analytics**: Merchants can ask natural language questions about their business operations.
- **Computed SQL Answers**:
  - *"Which products are low in stock?"* → Returns urgent items sorted by stock with stock alert table.
  - *"Which products sold the most?"* → Calculates top 5 volume leaders by units sold and revenue.
  - *"What is our average order value?"* → Computes total revenue divided by paid transactions.
  - *"What product bundles should I create to increase revenue?"* → Synthesizes high-conversion bundles compliant with merchant margin rules.
  - *"Show fulfillment status"* → Aggregates orders across fulfillment lifecycle states.

---

## 6. Genuine Apriori Market Basket Analysis
- **Machine Learning Basket Mining**: Analyzes co-occurrence in multi-item orders.
- **Support, Confidence, and Lift**: Computes mathematical affinity metrics across all historical customer baskets.
- **Dynamic Bundle Generation**: Automatically constructs commercial bundles with policy-compliant discounts based on highest statistical lift.
- **Graceful Insufficient Data State**: Displays clear messaging when fewer than 5 orders exist rather than fabricating false trends.

---

## 7. Deterministic Policy Guardrails
- **Commercial Hard Limits**:
  - Maximum allowable discount percentage (`10.0%`).
  - Maximum absolute discount amount (`₹3,000.00`).
  - Maximum per-order transaction ceiling (`₹150,000.00`).
- **Action Whitelisting**: Autonomous AI agents can only execute approved actions (`search_products`, `check_inventory`, `create_offer`, `validate_policy`). Restricted financial operations are blocked.
- **Interactive Simulator**: Allows testing hypothetical order amounts and discounts against active guardrails.

---

## 8. Cryptographic Razorpay Test Mode Settlement
- **Server-Side Price Validation**: Eliminates client-side tampering by computing prices from catalog data.
- **Paise Conversion**: Converts INR to paise (`amount * 100`) for accurate Razorpay transactions.
- **HMAC-SHA256 Cryptographic Verification**: Computes SHA256 signature using `RAZORPAY_KEY_SECRET`.
- **Raw-Body Webhooks**: Verifies webhook signatures using `RAZORPAY_WEBHOOK_SECRET` before parsing JSON.
- **Idempotent Inventory Decrementing**: Prevents double-decrementing stock even if client verification and webhooks arrive simultaneously.

---

## 9. Immutable Audit Trail
- **Complete Chronological Ledger**: Records every AI query, tool call, policy evaluation, and payment settlement event.
- **Traceable Decision Metadata**: Captures actor, session ID, inputs, decision reasons, and cryptographic verification statuses.
- **Audit Filtering**: Filter by outcome (`ALL`, `PASSED`, `VIOLATION`) and search by keyword or session ID.
