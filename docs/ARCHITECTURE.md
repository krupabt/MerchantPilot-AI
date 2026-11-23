# MerchantPilot AI 2.0 — Architecture & System Design

MerchantPilot AI 2.0 is an AI-native autonomous commerce and revenue intelligence platform engineered for modern merchants. It bridges the gap between natural language agentic shoppers and strict commercial guardrails, featuring machine-readable catalogs, real-time inventory management, deterministic policy enforcement, market basket analysis, and Razorpay cryptographic settlement.

---

## 1. High-Level Architectural Diagram

```
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER                                     |
|  +---------------------------+  +--------------------------+  +----------------+  |
|  |  Customer Storefront &    |  |  AI Shopping Assistant   |  | Merchant Ops   |  |
|  |  Persistent Cart (React)  |  |  (NL Intent Discovery)   |  | Portal (React) |  |
|  +---------------------------+  +--------------------------+  +----------------+  |
+----------------------------------------+------------------------------------------+
                                         | REST / HTTPS JSON
                                         v
+-----------------------------------------------------------------------------------+
|                             API & ROUTING LAYER (FastAPI)                         |
|  +----------------+  +---------------+  +----------------+  +------------------+  |
|  | /api/auth      |  | /api/customer |  | /api/merchant  |  | /api/razorpay    |  |
|  | (JWT Auth)     |  | (Cart/Orders) |  | (Stock/Orders) |  | (Checkout/Hooks) |  |
|  +----------------+  +---------------+  +----------------+  +------------------+  |
|  +----------------+  +---------------+  +----------------+  +------------------+  |
|  | /api/agent     |  | /api/revenue  |  | /api/policies  |  | /api/audit       |  |
|  | (AI Commerce)  |  | (Apriori ML)  |  | (Guardrails)   |  | (Ledger Trace)   |  |
|  +----------------+  +---------------+  +----------------+  +------------------+  |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                                BUSINESS LOGIC ENGINES                             |
|  +---------------------------+  +-----------------------------------------------+  |
|  | Deterministic Policy Engine|  | Genuine Apriori Rule Mining Engine             |  |
|  | (Max 10% Discount, Caps)  |  | (Support >= 0.05, Conf >= 0.20, Lift Ranked)  |  |
|  +---------------------------+  +-----------------------------------------------+  |
|  +---------------------------+  +-----------------------------------------------+  |
|  | Merchant AI Assistant     |  | Cryptographic Razorpay Verification Engine    |  |
|  | (SQL Aggregated Insights) |  | (HMAC-SHA256 Raw Webhook, Idempotent Stock)   |  |
|  +---------------------------+  +-----------------------------------------------+  |
+----------------------------------------+------------------------------------------+
                                         | SQLAlchemy ORM (Connection Pool)
                                         v
+-----------------------------------------------------------------------------------+
|                                DATA PERSISTENCE LAYER                             |
|       PostgreSQL (Production Neon/Supabase) / SQLite Fallback (Local Dev)         |
|  Tables: users, merchants, products, categories, carts, cart_items, orders,      |
|          order_items, payments, policies, audit_logs, agent_sessions              |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core Subsystems

### 2.1 Autonomous Agent Procurement & Negotiation
1. **Buyer Natural Language Intent Extraction**: Parses free-form queries (e.g. *"I need a laptop for programming under ₹65,000 and a mouse"*).
2. **Catalog Querying**: Scans structured hardware specifications, compatibility graphs, and live inventory. Never fabricates products.
3. **Revenue Intelligence Cross-Sell Discovery**: Evaluates statistical product affinity pairs mined from real historical customer order baskets.
4. **Commercial Offer Construction**: Generates a bounded bundle offer with compliant promotional discount.
5. **Deterministic Policy Gate**: Verifies that the proposed discount complies with merchant limits (`<= 10%` discount, absolute cap `₹3,000`, transaction ceiling `₹150,000`). If violated, execution is blocked and logged.
6. **Human-in-the-Loop Approval Gate**: Displays the offer, breakdown, and policy verification token for explicit buyer confirmation.
7. **Razorpay Settlement**: Registers an official order in Razorpay Test Mode with paise-exact server-side pricing.

### 2.2 Genuine Apriori Market Basket Association Engine
- **Transaction Baskets**: Grouped by completed order ID from verified transactions.
- **Support**: \( \text{Support}(A \rightarrow B) = \frac{\text{Orders containing } A \text{ and } B}{\text{Total Completed Orders}} \)
- **Confidence**: \( \text{Confidence}(A \rightarrow B) = \frac{\text{Support}(A \rightarrow B)}{\text{Support}(A)} \)
- **Lift**: \( \text{Lift}(A \rightarrow B) = \frac{\text{Support}(A \rightarrow B)}{\text{Support}(A) \times \text{Support}(B)} \)
- **Dynamic Bundle Generation**: Transforms high-lift association rules into actionable commercial bundle opportunities with merchant-compliant discounts.

### 2.3 Cryptographic Payment & Webhook Settlement
- **Server-Side Pricing**: Client submitted amounts are completely ignored. Pricing is recalculated exclusively from database catalog prices and active discount rules.
- **Razorpay Test Mode Only**: Strict key prefix validation (`rzp_test_`) blocks live credentials.
- **HMAC-SHA256 Signature Verification**: Validates `razorpay_order_id|razorpay_payment_id` against `RAZORPAY_KEY_SECRET`.
- **Raw-Body Webhooks**: Reads raw bytes prior to JSON parsing to verify `x-razorpay-signature` against `RAZORPAY_WEBHOOK_SECRET`.
- **Concurrency & Idempotency**: Order status transition to `PAID` and inventory decrementing are protected against race conditions and duplicate webhook deliveries.

---

## 3. Data Isolation & Security Boundaries
- **Multi-Tenant Scoping**: All merchant product and order mutations are scoped by `merchant_id` extracted from verified JWT tokens.
- **Customer Privacy**: Cart items, profile details, and purchase records are isolated by `customer_id`.
- **Credentials Protection**: API keys, database connection strings, and payment secrets are stored exclusively in environment variables and never logged or exposed to the client.
