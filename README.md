# MerchantPilot AI

> **AI-Powered Commerce and Revenue Intelligence Platform for Small Merchants**  
> *Smarter commerce. Better business decisions.*

**Production URL:** [https://merchantpilot-ai.vercel.app](https://merchantpilot-ai.vercel.app)  
**GitHub Repository:** [https://github.com/krupabt/MerchantPilot-AI](https://github.com/krupabt/MerchantPilot-AI)  
**Demo Store:** Smart Accessories Store (`m_1001`)  
**Credentials:**  
- **Merchant Login:** `merchant@merchantpilot.ai` | `Admin@123456`
- **Customer Login:** `customer@merchantpilot.ai` | `Customer@123456`

---

## 📌 1. Problem Statement

Small retailers and e-commerce merchants struggle with three critical challenges:
1. **Opaque Financial Health:** Most small merchants track top-line sales revenue without understanding true Cost of Goods Sold (COGS) or net Gross Profit margins across physical counter sales and online orders.
2. **Disconnected Inventory & Merchandising:** Reordering is reactive rather than predictive, leading to stockouts of high-velocity accessories while slow-moving products tie up working capital.
3. **Complex Enterprise Tooling:** Enterprise BI software (Tableau, PowerBI, NetSuite) is prohibitively expensive, steep in learning curve, and disconnected from daily shop-floor point-of-sale (POS) workflows and customer discovery.

---

## 💡 2. Proposed Solution

**MerchantPilot AI** is an AI-native commerce and revenue intelligence platform that unifies consumer discovery with merchant back-office decision-making:
- **For Customers:** Natural-language AI product discovery bounded by real-time inventory and merchant discount policies, paired with seamless Razorpay Test Mode checkout.
- **For Merchants:** An operational command center featuring a database-grounded **AI Business Copilot**, **Apriori Market Basket Analysis**, **In-Store POS counter billing**, **CSV data migration**, **Gross Profit tracking**, and **human-in-the-loop Action Approvals**.

---

## ✨ 3. Key Features

### Merchant Operations & Intelligence
- **Executive Dashboard:** Real-time KPI tracking (Total Revenue, Gross Profit, Gross Margin %, Orders Count, Average Order Value, and Low-Stock Attention) with date range filters (Today, 7 Days, 30 Days, All-Time).
- **AI Business Copilot:** Conversational natural-language interface answering complex business questions (*"Which product sold the most today?"*, *"How much gross profit did it generate?"*, *"How many USB cables are remaining?"*, *"Can I afford a 10% discount?"*) using deterministic SQL queries with pronoun/context resolution.
- **Apriori Market Basket Analysis:** Genuine itemset mining calculating Support, Confidence, and Lift from completed transactions to uncover affinity bundles (e.g., USB Cable → Phone Cover).
- **Inventory Intelligence & Runway:** Calculates 30-day sales velocity and project runway in days, flagging stock replenishment alerts.
- **In-Store POS Counter Billing:** Record offline sales via Cash, UPI, or Card, calculate live unit margins, deduct inventory atomically, and generate printable thermal-style receipts.
- **CSV Data Import Pipeline:** Downloadable templates for Products, Inventory, and Sales, featuring SHA-256 duplicate import prevention and transactional validation.
- **Commercial Policy Engine:** Configurable discount ceilings (e.g. 10% maximum discount) preventing price erosion.
- **Action Center:** Actionable AI recommendations (restock directives, cross-sell bundles, excessive discount reviews) requiring explicit merchant approval.
- **Immutable Audit Logging:** Cryptographic traceability of all authentication events, catalog changes, policy evaluations, and payment settlements.

### Customer Commerce Experience
- **Customer Storefront:** Clean catalog browsing with category and price filters, real-time stock badges, and multi-tenant partitioning.
- **AI Shopping Assistant:** Conversational product recommendations that extract budget constraints, query real database items, apply Apriori affinity pairings, evaluate discount policies, and enable 1-click bundle additions to the cart.
- **Shopping Cart & Checkout:** Persistent database cart with server-side price validation, preventing frontend tampering.
- **Razorpay Test Mode Integration:** End-to-end cryptographic payment flow with server-side HMAC-SHA256 signature verification and idempotent order settlement.

---

## 🛠️ 4. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React.js 18, Vite | Component-driven responsive web application |
| **Styling** | Tailwind CSS | Human-centered SaaS design system (Ivory `#F6F5F1`, Forest Green `#234E42`) |
| **Charts** | Recharts | Interactive financial and sales velocity visualizations |
| **Backend** | Python 3.12, FastAPI | High-performance asynchronous RESTful API framework |
| **ORM & Database** | SQLAlchemy 2.0, PostgreSQL | Enterprise relational persistence with Alembic migrations |
| **Data Validation** | Pydantic v2 | Strict request/response schema serialization |
| **Payment Gateway** | Razorpay Test Mode | Online card, netbanking, and UPI mock settlement |
| **Cryptography** | `hmac`, `hashlib` (SHA-256) | Constant-time payment signature verification and CSV deduplication |
| **Data Mining** | Pure Python Apriori Algorithm | Frequent itemset generation, Support, Confidence, and Lift mining |
| **AI LLM** | Google Gemini 1.5 Pro / Flash | Natural language understanding and semantic explanation |
| **Deployment** | Vercel Serverless Functions | Continuous deployment with edge caching and static asset distribution |

---

## 🏛️ 5. System Architecture

```
                                  [ CLIENT LAYER ]
        +-----------------------------+     +-----------------------------+
        |  Customer Storefront &      |     |  Merchant Operations Portal |
        |  AI Shopping Assistant      |     |  & AI Business Copilot      |
        |  (React 18 + Tailwind CSS)  |     |  (Recharts + POS Billing)   |
        +-----------------------------+     +-----------------------------+
                                       |
                                       v HTTPS / JSON REST APIs
                      [ FASTAPI GATEWAY & ROUTING ]
        +-----------------------------------------------------------------+
        |  /api/auth         /api/merchant/sales      /api/dashboard/stats|
        |  /api/agent/chat   /api/agent/catalog       /api/products       |
        |  /api/customer     /api/razorpay/checkout   /api/merchant/copilot|
        +-----------------------------------------------------------------+
                                       |
                       [ CORE BUSINESS ENGINES ]
        +-----------------------------+     +-----------------------------+
        | Commercial Policy Engine    |     | Genuine Apriori Engine      |
        | (Max 10% Discount, Margins) |     | (Support, Confidence, Lift) |
        +-----------------------------+     +-----------------------------+
        +-----------------------------+     +-----------------------------+
        | Merchant AI Copilot Service |     | Razorpay HMAC-SHA256 Engine |
        | (Deterministic SQL ground)  |     | (Paise pricing, Idempotent) |
        +-----------------------------+     +-----------------------------+
                                       | SQLAlchemy ORM
                     [ DATABASE PERSISTENCE LAYER ]
        +-----------------------------------------------------------------+
        | PostgreSQL (Neon) / SQLite (Local Test Fallback)               |
        | Users, Merchants, Products, Orders, OrderItems, Payments, Audit |
        +-----------------------------------------------------------------+
```

---

## 🔄 6. Workflows

### A. Customer AI Shopping & Payment Workflow
```
1. Customer enters inquiry ("Suggest mobile accessories under ₹300").
2. Backend parses category, budget (₹300), and intent.
3. CatalogService queries database for active products within budget.
4. RevenueService checks Apriori rules to find high-affinity accessories.
5. OfferService constructs bundle (e.g. Mobile Stand ₹150 + USB Cable ₹120 = ₹270).
6. PolicyService validates that bundle discount is <= merchant policy limit (10%).
7. Customer confirms cart -> Backend generates pending order and Razorpay order in paise.
8. Customer completes Razorpay Test checkout.
9. Backend verifies HMAC-SHA256 signature using constant-time comparison.
10. Order status set to PAID -> Stock decremented atomically -> Revenue and profit updated.
```

### B. Merchant POS Counter Billing Workflow
```
1. Merchant selects products and quantities at physical counter.
2. Backend computes Subtotal, COGS, and Gross Profit.
3. Merchant confirms payment method (Cash / UPI / Card).
4. Stock decrements atomically with concurrency-safe row locks.
5. Printable thermal receipt is generated with unique receipt number (REC-YYYYMMDD-XXXX).
6. Financial ledger and executive dashboard update instantly.
```

### C. Merchant AI Business Copilot Workflow
```
1. Merchant asks: "Which product sold the most today?"
2. Copilot parses intent -> invokes `_handle_product_profit_query` with timeframe="today".
3. Resolves product "USB Cable" (5 units sold, ₹600 revenue, ₹200 gross profit).
4. Merchant asks follow-up: "How much gross profit did it generate?"
5. Copilot pronoun resolution links "it" -> "USB Cable" from session conversation history.
6. Returns exact gross profit (₹200.00, 33.3% margin) with supporting metrics.
```

---

## 📊 7. Apriori Algorithm Mathematical Formulation

The Market Basket Analysis module processes completed multi-item order transactions:

1. **Support:** Measures the frequency of item combination $\{A, B\}$ in the dataset:
   $$\text{Support}(A \rightarrow B) = \frac{\text{Count}(A \cup B)}{\text{Total Orders}}$$
2. **Confidence:** Measures how often item $B$ is purchased when item $A$ is purchased:
   $$\text{Confidence}(A \rightarrow B) = \frac{\text{Count}(A \cup B)}{\text{Count}(A)}$$
3. **Lift:** Measures the strength of association relative to independent occurrences:
   $$\text{Lift}(A \rightarrow B) = \frac{\text{Confidence}(A \rightarrow B)}{\text{Support}(B)} = \frac{P(A \cap B)}{P(A) \times P(B)}$$
   - $\text{Lift} > 1.0$: Strong positive association (items frequently bought together).
   - $\text{Lift} = 1.0$: Items are completely independent.
   - $\text{Lift} < 1.0$: Negative association (substitute goods).

---

## 🔒 8. Security Implementation

- **Role-Based Access Control (RBAC):** JWT tokens encode merchant tenant IDs (`merchant_id`). New merchants start with an isolated workspace containing 0 data. Cross-tenant leakage is strictly blocked by partitioned queries.
- **Deterministic AI Boundaries:** LLMs cannot invent product prices, alter stock levels, or authorize financial discounts. All numerical data is calculated via verified backend code.
- **Cryptographic Payment Verification:**
  ```python
  expected_sig = hmac.new(
      secret.encode("utf-8"),
      f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8"),
      hashlib.sha256
  ).hexdigest()
  is_valid = hmac.compare_digest(expected_sig, client_signature)
  ```
- **Paise Precision:** Order values are computed as integer paise (`round(amount * 100)`) on the server to eliminate floating-point rounding errors.
- **Payment Idempotency:** Duplicate payment verification calls return the settled order without double-incrementing revenue or double-decrementing stock.

---

## 💻 9. Installation & Local Setup

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ and npm

### 1. Clone Repository
```bash
git clone https://github.com/krupabt/MerchantPilot-AI.git
cd MerchantPilot-AI
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate # macOS/Linux

# Install dependencies
pip install -r backend/requirements.txt

# Seed demonstration data
python -c "import sys; sys.path.insert(0, '.'); from backend.app.seed.seed_data import seed_database; seed_database()"

# Run FastAPI backend
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 10. Environment Variables

Create `.env` in the root and in `backend/`:

```env
# Application
PROJECT_NAME="MerchantPilot AI"
ENVIRONMENT="production"
PORT=8000

# Security & Authentication
SECRET_KEY="your-jwt-secret-key-min-32-chars"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database
DATABASE_URL="postgresql://user:password@host:5432/merchantpilot" # Or sqlite:///./merchantpilot.db for local dev

# Razorpay Test Mode
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"

# Gemini LLM (Optional - Deterministic fallbacks active when omitted)
GEMINI_API_KEY="your-gemini-api-key"
GEMINI_MODEL="gemini-1.5-flash"
```

---

## 🧪 11. Automated Testing & Verification

The project includes both a 59-test Pytest unit suite and an end-to-end 14-step integration test:

```bash
# Run 59 automated backend unit tests
pytest backend/tests/ -v

# Run 14-step end-to-end multi-tenant lifecycle verification
python backend/tests/verify_14_step_e2e.py
```

### Test Suite Summary:
- **59 / 59 passing unit tests (100% pass rate)**
- **14 / 14 passing end-to-end lifecycle steps (100% pass rate)**:
  1. Isolated merchant signup with 0 revenue and 0 orders.
  2. Product management with purchase cost (COGS) and selling price.
  3. POS counter sale with live margin calculation and stock decrement.
  4. AI Copilot gross profit calculation across timeframes.
  5. AI Copilot product stock inquiries.
  6. AI Copilot contextual pronoun follow-ups (*"How much profit did it generate?"*).
  7. AI Copilot discount feasibility against commercial policy.
  8. Inventory adjustment and proactive merchandising actions.
  9. CSV bulk data import with duplicate detection.
  10. Customer online checkout and Razorpay order creation in paise.
  11. HMAC-SHA256 signature verification and order status transition to PAID.
  12. Persistence across user logout, login, and sessions.
  13. Strict multi-tenant data isolation (Merchant 2 cannot see Merchant 1 data).
  14. Business settings and store configuration persistence.

---

## 🌐 12. Deployment

MerchantPilot AI is configured for one-click deployment on **Vercel**:
- Frontend built as a modern Single Page Application (SPA) using Vite.
- Backend API deployed via Vercel Python Serverless Runtime (`api/index.py`).
- Persistent PostgreSQL connection for zero-data-loss multi-tenancy.

---

## ⚠️ 13. Known Limitations

- **Razorpay Production Mode:** The platform is configured in Razorpay Test Mode (`rzp_test_*`). Real bank card charges require activating a registered Razorpay business account and swapping live credentials.
- **Physical Thermal Printers:** The POS receipt generation renders a browser print modal with standard 80mm ESC/POS styling; integration with raw serial or Bluetooth thermal printers requires vendor-specific ESC/POS bridges.
