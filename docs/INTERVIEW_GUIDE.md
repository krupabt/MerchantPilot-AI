# MerchantPilot AI 2.0 — Engineering Portfolio & Interview Guide

A comprehensive architectural walkthrough for engineering interviews, technical discussions, and portfolio reviews.

---

## 1. Executive Summary & Problem Solved
Traditional e-commerce is built for human eyeballs: visual storefronts, bloated HTML rendering, unconstrained conversational chatbots prone to hallucination, and vulnerable client-side discount calculations.

**MerchantPilot AI 2.0** solves this by engineering an **AI-Native Commerce Platform** that:
1. Exposes machine-readable, schema-defined catalogs for autonomous procurement agents.
2. Interposes a **deterministic policy engine** that intercepts every agent negotiation, preventing rogue discounts and unauthorized financial actions.
3. Implements **genuine Apriori market basket analysis** on completed transactions to uncover affinity bundles.
4. Executes **cryptographically verified Razorpay settlements** with server-side pricing, raw-body HMAC signature validation, and idempotent inventory updates.

---

## 2. Key Architecture Decisions & Trade-Offs

### Decision 1: Non-Trust AI Architecture for Commercial Guardrails
- **Problem**: Large Language Models cannot be trusted with financial boundaries (jailbreaks, prompt injections, hallucinated discounts).
- **Decision**: Separated intent recognition (LLM) from policy evaluation (pure Python deterministic engine).
- **Impact**: Zero possibility of agentic over-discounting. If an AI proposes a 20% discount on a policy allowing at most 10%, the deterministic rule engine intercepts the action, records an audit violation, and halts order creation.

### Decision 2: Genuine Apriori Algorithm vs. Hardcoded Recommendations
- **Problem**: Many demo applications hardcode high-margin bundles and static conversion rates.
- **Decision**: Implemented mathematical Apriori association rule mining directly on completed database order baskets, computing true support, confidence, and lift.
- **Impact**: Merchants gain explainable, data-backed bundle suggestions derived from actual buyer purchasing patterns with a clear empty-state fallback when fewer than 5 orders exist.

### Decision 3: Idempotent Raw-Body Webhooks & Stock Management
- **Problem**: Payment webhooks and client callbacks often arrive concurrently or get retried, risking double-decrementing inventory or duplicate fulfillment records.
- **Decision**: Implemented idempotent state transitions and atomic stock checks using `max(0, stock - qty)` guarded by `order.status == 'PAID'`.
- **Impact**: Zero inventory discrepancies during concurrent checkouts or webhook retries.

---

## 3. Resume Bullet Points

- **Architected and developed MerchantPilot AI 2.0**, an AI-native autonomous commerce platform using **FastAPI, React 18, SQLAlchemy, PostgreSQL, and Razorpay Test Mode**, supporting machine-readable catalogs, multi-tenant isolation, and persistent customer carts.
- **Engineered a deterministic commercial policy engine** and action whitelisting layer that eliminated LLM discount hallucinations, intercepting non-compliant transactions and enforcing merchant-configured financial guardrails (`<= 10%` discount ceiling).
- **Implemented genuine Apriori market basket analysis** from historical database transactions, calculating Support, Confidence, and Lift metrics to dynamically generate high-conversion cross-sell bundles.
- **Built cryptographic payment verification & raw-body webhook pipelines** using HMAC-SHA256 signatures, server-calculated paise amounts, and idempotent concurrency-safe inventory deduction.
- **Developed a 48-test automated pytest and Vite test suite** with 100% pass rate, covering JWT authentication, product CRUD, market basket mining, policy gates, and failure scenarios.
