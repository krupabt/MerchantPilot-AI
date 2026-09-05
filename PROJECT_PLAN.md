# MerchantPilot AI — Project Plan
**Razorpay AI Buildathon — Track 01: AI Growth & Agentic Commerce**
**Tagline:** *Making merchants AI-native and helping them grow revenue.*

---

## 1. Executive Summary & Value Proposition

MerchantPilot AI addresses the fundamental barrier preventing traditional e-commerce merchants from participating in agentic commerce:
1. **Making Merchants AI-Readable & Transactable:** Legacy storefronts are built for human eyes (HTML/CSS) requiring unreliable visual scraping. MerchantPilot AI provides structured, agent-first endpoints exposing inventory, dynamic variants, compatibility graphs, and machine-verifiable purchasing policies.
2. **Growing Merchant Revenue with AI:** MerchantPilot AI transforms the merchant agent from a passive FAQ bot into an active revenue engine. Using historical transaction basket intelligence, it autonomously discovers high-affinity cross-sells/upsells, constructs high-converting bounded bundles, and validates dynamic offers.
3. **Enterprise Guardrails & Policy Enforcement:** LLMs are strictly decoupled from direct financial execution. Every AI-proposed offer traverses a deterministic, server-side Policy Engine before entering an Approval Gate, strictly preventing unauthorized discounts, money transfers, or arbitrary price overrides.
4. **Razorpay Integration:** Seamless checkout via official Razorpay Test Mode APIs with cryptographic server-side HMAC-SHA256 signature verification, idempotent webhook handling, and comprehensive audit trail logging.

---

## 2. Project Phases & Deliverables

| Phase | Description | Deliverables |
|---|---|---|
| **Phase 1: Architecture & Design** | System design, database schemas, API specs, security protocols | `PROJECT_PLAN.md`, `TECHNICAL_ARCHITECTURE.md`, `API_SPEC.md`, `DATABASE_SCHEMA.md` |
| **Phase 2: Database & Seed Intelligence** | Relational data models, SQLite/PostgreSQL compatibility, electronics demo catalog & basket history | SQLAlchemy models, seed script with 10+ products & 60+ transaction patterns |
| **Phase 3: Core Engines** | AI-readable catalog, ML market basket revenue intelligence, Policy Engine guardrails, Bounded Offer service | `catalog_service.py`, `revenue_service.py`, `policy_service.py`, `offer_service.py` |
| **Phase 4: Agent & Razorpay Integration** | AI merchant agent with tool calling, Razorpay order creation, HMAC signature verification, Audit Logger | `agent_service.py`, `razorpay_service.py`, `audit_service.py` |
| **Phase 5: Automated Testing Suite** | Comprehensive unit & integration tests covering all flows and edge cases | Pytest test suite (Catalog, Revenue, Policy, Razorpay, Failure handling) |
| **Phase 6: Modern React UI** | Fintech-grade merchant dashboard, interactive AI buyer agent, approval modal, audit timeline | Vite + React + Tailwind + Recharts + Lucide UI with 8 complete views |
| **Phase 7: End-to-End Verification** | Multi-scenario validation (Happy path bundle purchase & Blocked policy violation) | `walkthrough.md`, verified running local services |

---

## 3. Key Milestone Checklist

- [x] Workspace environment inspection (Python 3.12, Node 22, npm 10)
- [ ] Backend FastAPI application with SQLAlchemy ORM & Pydantic validation
- [ ] Agent-readable catalog APIs (`/api/agent/catalog`, `/api/agent/products/{id}`, `/api/agent/availability`, `/api/agent/policies`)
- [ ] Market basket revenue intelligence with explainable cross-sell/upsell discovery
- [ ] Deterministic Policy Engine (max discount %, max transaction limits, role restrictions)
- [ ] Merchant Commerce AI Agent with Gemini tool calling + resilient deterministic fallback
- [ ] Approval Gate UX requiring explicit buyer confirmation prior to financial settlement
- [ ] Razorpay Test Mode checkout, order generation, and backend HMAC verification
- [ ] Real-time immutable audit trail recording every actor, intent, decision, and payment
- [ ] Deliberate policy failure scenario (e.g. ₹20,000 unauthorized discount blocked)
- [ ] 8-view React dashboard with live Recharts metrics and interactive AI Buyer
- [ ] 100% passing automated test suite with pytest
