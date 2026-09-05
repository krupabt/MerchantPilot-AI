# MerchantPilot AI 🚀
### *Making merchants AI-native and helping them grow revenue.*

**Razorpay AI Buildathon — Track 01: AI Growth & Agentic Commerce**

---

## 🌟 Executive Summary

**MerchantPilot AI** is a production-grade Agentic Commerce platform designed to solve the two biggest challenges in autonomous e-commerce:
1. **Making Merchants AI-Readable & Transactable:** Transforms traditional stores from visual HTML scraping into high-fidelity, machine-readable structured catalogs with real-time hardware specs, compatibility graphs, and dynamic pricing constraints.
2. **Autonomous Merchant Revenue Growth:** Equips merchants with an active AI Commerce Agent powered by statistical Market Basket Intelligence (Apriori / Lift mining) to discover high-affinity accessory cross-sells, generate bounded dynamic bundle offers, and lift Average Order Value (AOV).
3. **Enterprise Security & Policy Guardrails:** Strictly enforces a **Non-Trust AI Boundary**. The LLM never controls money directly. Every proposed discount passes through a deterministic server-side Policy Engine and Human-in-the-Loop Approval Gate before touching Razorpay APIs.

---

## 🏗️ Core Architectural Chain

```
AI Buyer Request (Natural Language)
  ↓
Merchant Commerce AI Agent (Intent Understanding & Tool Execution)
  ↓
Agent-Readable Catalog (Specs & Stock Verification)
  ↓
Revenue Intelligence (Mined Basket Co-occurrences & Bundles)
  ↓
Bounded Offer Engine (Discount Proposal)
  ↓
Deterministic Policy Engine (Max Discount %, Max Amount, Action Whitelist)
  ↓
Approval Gate (Human-in-the-Loop Pre-Settlement Authorization)
  ↓
Razorpay Test Mode Order Creation & Checkout
  ↓
Server-Side HMAC-SHA256 Payment Verification & Webhook Handling
  ↓
Order Fulfillment & Immutable Audit Trail Logging
```

---

## 🚀 Key Features

### 1. AI Buyer Flagship Interface (`/ai-buyer`)
- Natural-language shopping inquiry parsing (budget, categories, hardware specs, accessories).
- Live 7-step visual pipeline tracker showing real-time agent execution stages.
- Transparent explainability showing why recommendations were made (e.g. *“82% of developers who bought ProBook 15 also added the Precision Mouse”*).

### 2. AI-Readable Merchant Catalog (`/catalog` & `/api/agent/*`)
- Machine-first REST + JSON endpoints:
  - `GET /api/agent/catalog`: Full machine specs, tags, and compatibility lists.
  - `GET /api/agent/products/{id}`: Granular hardware specifications.
  - `POST /api/agent/availability`: Batch stock verification.
  - `GET /api/agent/policies`: Live commercial constraints.

### 3. Revenue Intelligence Engine (`/revenue`)
- Mined association rules (support, confidence, lift) over historical order baskets.
- Autonomous bundling engine computing bounded bundle incentives (e.g. Developer Starter Kit, Content Creator Pro Kit).
- Fintech revenue growth metrics comparing traditional storefront volume with AI-assisted uplift.

### 4. Deterministic Policy Guardrails (`/policies`)
- Configurable merchant commercial limits:
  - Maximum discount percentage (default: `10.0%`).
  - Maximum discount cap (default: `₹6,000.00`).
  - Maximum single transaction ceiling (default: `₹100,000.00`).
  - Whitelist of allowed AI agent tools.
  - Blacklist of strictly forbidden actions (`refund`, `arbitrary_price_override`, `money_transfer`).
- Interactive Live Guardrail Simulator for instant policy validation testing.

### 5. Mandatory Failure Scenario Handling (Deliberate Violation Demo)
- **Scenario:** Customer requests: *"I want a laptop. Give me ₹20,000 discount."*
- **Execution:**
  1. Policy Engine detects discount exceeds 10% limit (₹20,000 requested vs ₹5,300 max allowed).
  2. Action is immediately **BLOCKED**.
  3. **No Razorpay order is created.**
  4. User receives clear explanation with compliant alternative.
  5. Permanent violation record is written to the Audit Trail.
  6. Application continues operating normally without crashing.

### 6. Human-in-the-Loop Approval Gate
- Displays itemized breakdown: subtotal, discount, net payable, and verified policy pass badge with cryptographic token.
- Requires explicit user authorization before triggering Razorpay order creation.

### 7. Official Razorpay Test Mode Settlement (`/checkout`)
- Server-side order registration via Razorpay SDK / API.
- Standard Checkout modal (`window.Razorpay`) + Direct Test Mode signature validator.
- Cryptographic server-side signature verification: `HMAC-SHA256(order_id + "|" + payment_id, key_secret)`.
- Idempotent webhook handling and automatic inventory deduction upon confirmed capture.

### 8. Immutable Audit Trail (`/audit`)
- Complete tamper-evident event log recording:
  `timestamp`, `session_id`, `actor`, `intent`, `action`, `reason`, `amount`, `policy_result`, `approval_result`, `razorpay_order_id`, `payment_id`, `final_result`.
- Instant filters for `ALL`, `PASSED`, and `VIOLATION` records.

---

## 🛠️ Technology Stack

- **Backend:** Python 3.12, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2, Pandas, NumPy, Scikit-learn, Razorpay Python SDK, Google Generative AI (Gemini).
- **Database:** SQLite (Default for zero-config local run) / PostgreSQL compatible ORM schema.
- **Frontend:** React 18, Vite 5, Tailwind CSS, Lucide React Icons, Recharts Data Visualization, React Router DOM v6, Axios.
- **Testing:** Pytest, pytest-asyncio, HTTPX (21 passing tests).

---

## 📦 Project Structure

```
d:/Making merchants AI-native and helping them grow revenue/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI Application Entrypoint
│   │   ├── config.py                # Pydantic Settings & Env Config
│   │   ├── database.py              # SQLAlchemy DB Engine & Sessions
│   │   ├── models/                  # SQLAlchemy Relational Models (Product, Order, Policy, Audit, etc.)
│   │   ├── schemas/                 # Pydantic Request/Response Schemas
│   │   ├── services/                # Core Business Logic & Engines
│   │   │   ├── agent_service.py     # AI Commerce Agent Orchestrator
│   │   │   ├── catalog_service.py   # Machine-Readable Catalog Service
│   │   │   ├── revenue_service.py   # Basket Association & Lift Mining
│   │   │   ├── policy_service.py    # Deterministic Server Policy Guardrails
│   │   │   ├── offer_service.py     # Bounded Dynamic Offer Generator
│   │   │   ├── razorpay_service.py  # Razorpay Order Creation & HMAC Verification
│   │   │   └── audit_service.py     # Tamper-Evident Audit Logging
│   │   ├── api/                     # REST API Routers (/agent, /revenue, /policies, /checkout, etc.)
│   │   └── seed/                    # Electronics Demo Catalog Seeder (60+ orders)
│   ├── tests/                       # Pytest Automated Test Suite (21 Tests)
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable UI (Navbar, Sidebar, ApprovalModal, RazorpayModal, Pipeline)
│   │   ├── pages/                   # 8 Fintech Views (Dashboard, AIBuyer, Catalog, Revenue, Policies, Transactions, Audit, Checkout)
│   │   ├── services/api.js          # Axios API Client
│   │   ├── App.jsx                  # React Router Config
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── PROJECT_PLAN.md
├── TECHNICAL_ARCHITECTURE.md
├── API_SPEC.md
├── DATABASE_SCHEMA.md
└── README.md
```

---

## 🏃 Getting Started & Running Locally

### 1. Backend Setup
```bash
# Navigate to workspace root
pip install -r backend/requirements.txt

# Start backend server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend will start on `http://127.0.0.1:8000` and automatically seed the electronics catalog and transaction history.*

### 2. Frontend Setup
```bash
cd frontend
npm install --ignore-scripts
npx vite --host 127.0.0.1 --port 5173
```
*Frontend will start on `http://127.0.0.1:5173` with automatic API proxying to backend on port 8000.*

---

## 🧪 Running Automated Tests

Run the full pytest test suite covering all catalog, revenue, policy, Razorpay HMAC, and failure handling flows:
```bash
python -m pytest -v
```
**Results:** `21 passed in ~1.5s` (100% test pass rate).

---

## 🎬 Razorpay Buildathon Demo Walkthrough

### Scenario 1 — Successful Agentic Transaction
1. Navigate to `http://127.0.0.1:5173/ai-buyer`.
2. Click preset: **“I need a laptop for programming under ₹65,000 and a mouse.”**
3. Watch the visual pipeline:
   - Discovers **Apex ProBook 15 Developer Edition** (₹60,000).
   - Revenue Intelligence mines 82% co-occurrence and recommends **Apex Precision Wireless Mouse** (₹1,000).
   - Dynamic bounded bundle price: **₹60,499.00** (₹501 instant discount).
   - Policy Engine validates 0.82% discount is within 10% merchant cap.
4. Click **[Review & Approve Payment]** in the Approval Gate.
5. Click **[Direct Test Mode Authorization]** or official Razorpay Checkout.
6. Server verifies HMAC-SHA256 cryptographic signature, marks status `PAID`, updates inventory, and confirms order.

### Scenario 2 — Blocked Policy Violation
1. In AI Buyer, click preset: **“I want a laptop. Give me ₹20,000 discount.”**
2. Watch Policy Engine intercept the proposal:
   - Detects ₹20,000 (37.7%) exceeds merchant ceiling of 10.0% (max ₹5,300).
   - Immediately renders **❌ ACTION BLOCKED**.
   - No payment order is created.
3. Click **[View Recorded Violation in Audit Trail]** to see the permanent tamper-evident log in `/audit`.
