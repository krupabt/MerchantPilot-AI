# MerchantPilot AI 2.0 🚀
### *AI-Native Autonomous Commerce & Revenue Intelligence Platform*

**Production URL:** [https://merchantpilot-ai.vercel.app](https://merchantpilot-ai.vercel.app)  
**Razorpay Buildathon — Track 01: AI Growth & Agentic Commerce**

---

## 🌟 Executive Summary

**MerchantPilot AI 2.0** transforms standard e-commerce into an autonomous, AI-native commerce and revenue engine. Built for both customers and merchants, it bridges the gap between natural language agentic shoppers and strict commercial safety boundaries.

1. **Dual-Portal Full-Stack Experience:**
   - **Customer Commerce Portal**: Live hardware storefront, persistent database-backed shopping cart, order history with delivery tracking, and personal profile management.
   - **Merchant Operations Portal**: Real-time database-derived metrics, 7-day SQL revenue trends, low-stock alerts, product CRUD with tenant isolation, and order fulfillment management.
2. **AI Shopping Assistant & Agent Negotiation:**
   - Interprets natural language shopping inquiries with budget, category, and spec filtering.
   - Queries authentic database catalog records with zero product or price hallucinations.
   - Provides explainable recommendation pitches and direct cart/checkout links.
3. **Merchant AI Business Assistant:**
   - Answers merchant operational questions (*"Which items are low in stock?"*, *"Which products sold the most?"*, *"What is our average order value?"*) using real SQL aggregations.
4. **Genuine Apriori Market Basket Analysis:**
   - Mines real completed order baskets for Support, Confidence, and Lift.
   - Dynamically constructs commercial bundles with policy-compliant discounts.
   - Handles sparse transaction history with clear empty-state messaging.
5. **Deterministic Policy Guardrails (Non-Trust AI Boundary):**
   - Pure Python deterministic enforcement ensuring discounts never exceed merchant boundaries (`<= 10%`, cap `₹3,000`, ceiling `₹150,000`).
   - Whitelists agent capabilities to prevent unauthorized financial actions.
6. **Cryptographic Razorpay Test Mode Settlement:**
   - Server-side price calculation in paise (eliminates client-side price tampering).
   - HMAC-SHA256 signature verification and raw-body asynchronous webhook listener (`x-razorpay-signature`).
   - Idempotent concurrency-safe inventory deduction preventing double-decrementing.
7. **Comprehensive Automated Test Suite:**
   - **48 automated tests** across 11 test suites with **100% pass rate**.

---

## 🏗️ System Architecture

```
                                [ CLIENT LAYER ]
      +-----------------------------+     +-----------------------------+
      |  Customer Storefront &      |     |  Merchant Operations Portal |
      |  Persistent Cart (React 18) |     |  & AI Business Assistant    |
      +-----------------------------+     +-----------------------------+
                                     |
                                     v HTTPS / JSON REST
                    [ FASTAPI ROUTING & AUTHENTICATION ]
      +-----------------------------------------------------------------+
      |  /api/auth     /api/customer    /api/merchant    /api/razorpay  |
      |  /api/agent    /api/revenue     /api/policies    /api/audit     |
      +-----------------------------------------------------------------+
                                     |
                     [ CORE BUSINESS LOGIC ENGINES ]
      +-----------------------------+     +-----------------------------+
      | Deterministic Policy Engine |     | Genuine Apriori Rule Mining |
      | (Max 10% Discount, Caps)    |     | (Support, Confidence, Lift) |
      +-----------------------------+     +-----------------------------+
      +-----------------------------+     +-----------------------------+
      | Merchant AI Assistant       |     | Cryptographic Razorpay HMAC |
      | (SQL Grounded Insights)     |     | (Raw Webhooks, Idempotency) |
      +-----------------------------+     +-----------------------------+
                                     | SQLAlchemy ORM
                   [ DATABASE PERSISTENCE (Alembic) ]
      +-----------------------------------------------------------------+
      | PostgreSQL (Neon/Supabase) / SQLite Development Fallback        |
      | Users, Merchants, Products, Carts, Orders, Payments, AuditLogs  |
      +-----------------------------------------------------------------+
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Razorpay Test Mode API Keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)

### 2. Local Setup
```bash
# Clone repository
git clone https://github.com/your-username/merchantpilot-ai.git
cd merchantpilot-ai

# Backend Setup
python -m venv venv
venv\Scripts\activate          # Windows: venv\Scripts\activate | Unix: source venv/bin/activate
pip install -r requirements.txt

# Apply Alembic Migrations & Seed Baseline Data
alembic upgrade head
python -c "from backend.app.database import SessionLocal; from backend.app.seed.seed_data import seed_initial_data; db=SessionLocal(); seed_initial_data(db)"

# Frontend Setup
cd frontend
npm install
cd ..
```

### 3. Environment Variables (`backend/.env`)
```ini
ENVIRONMENT=development
DATABASE_URL=sqlite:///./merchantpilot.db
AUTH_SECRET_KEY=merchantpilot-auth-secret-key-prod-secure-token
TOKEN_EXPIRE_HOURS=24
RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
RAZORPAY_KEY_SECRET=YourKeySecretHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere
GEMINI_API_KEY=YourGeminiKeyHere  # Optional
```

### 4. Running Locally
```bash
# Terminal 1: Backend Server (FastAPI)
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2: Frontend Dev Server (Vite)
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing

Run the full automated test suite (48 tests):
```bash
# Backend pytest suite (48 passed)
python -m pytest backend/tests -v

# Frontend Vite build check
npm --prefix frontend run build
```

---

## 📂 Documentation Sitemap

- [Architecture & System Design](file:///d:/Making%20merchants%20AI-native%20and%20helping%20them%20grow%20revenue/docs/ARCHITECTURE.md)
- [Relational Database Schema & Migrations](file:///d:/Making%20merchants%20AI-native%20and%20helping%20them%20grow%20revenue/docs/DATABASE_SCHEMA.md)
- [REST API Reference](file:///d:/Making%20merchants%20AI-native%20and%20helping%20them%20grow%20revenue/docs/API_DOCUMENTATION.md)
- [Feature Deep Dive](file:///d:/Making%20merchants%20AI-native%20and%20helping%20them%20grow%20revenue/docs/FEATURES.md)
- [Testing & Quality Assurance](file:///d:/Making%20merchants%20AI-native%20and%20helping%20them%20grow%20revenue/docs/TESTING.md)
- [Production Deployment Guide (Vercel & Neon)](file:///d:/Making%20merchants%20AI-native%20and%20helping%20them%20grow%20revenue/docs/DEPLOYMENT.md)
- [Interview & Portfolio Guide (Resume Bullets)](file:///d:/Making%20merchants%20AI-native%20and%20helping%20them%20grow%20revenue/docs/INTERVIEW_GUIDE.md)
- [Project Audit (Phase 1 Baseline)](file:///d:/Making%20merchants%20AI-native%20and%20helping%20them%20grow%20revenue/docs/PROJECT_AUDIT.md)

---

## 🛡️ Razorpay Test Mode Credentials & Safe Testing

- **Key Format**: Must begin with `rzp_test_`. Live keys (`rzp_live_`) are strictly blocked by the server.
- **Test Cards**: `4000 0000 0000 1004` (Any future expiry, CVV: `123`, OTP: `123456`).
- **Test UPI**: `success@razorpay` (Instant simulated authorization).
- **HMAC Verification**: Orders are settled only when HMAC-SHA256 signature validates against `RAZORPAY_KEY_SECRET`.
