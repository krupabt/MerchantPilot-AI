# MerchantPilot AI 2.0 — Production Deployment Guide

MerchantPilot AI 2.0 is configured for continuous zero-downtime deployment on Vercel with PostgreSQL persistence (Neon, Supabase, or AWS RDS).

---

## 1. Vercel Configuration Architecture

The deployment architecture uses:
- **Frontend SPA**: React 18 + Vite 5 built into `frontend/dist/`.
- **Backend API**: FastAPI serverless function deployed at `api/index.py` handling `/api/(.*)` routes.
- **Routing**: `vercel.json` maps API requests to Python serverless functions and serves client-side routes via `/index.html`.

### `vercel.json` Specification
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.py"
    },
    {
      "source": "/api",
      "destination": "/api/index.py"
    },
    {
      "source": "/((?!assets/).*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 2. Environment Variables Checklist

Configure these variables in your Vercel Project Dashboard (**Settings** → **Environment Variables**):

| Variable | Description | Required | Example |
|---|---|:---:|---|
| `DATABASE_URL` | PostgreSQL connection string for persistent records | **Yes** (Prod) | `postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require` |
| `RAZORPAY_KEY_ID` | Official Razorpay Test Key ID | **Yes** | `rzp_test_51AbCdEfGhIjKl` |
| `RAZORPAY_KEY_SECRET` | Official Razorpay Test Key Secret | **Yes** | `SecretValueFromDashboard12` |
| `RAZORPAY_WEBHOOK_SECRET` | Secret configured in Razorpay Webhooks | Optional | `webhook_secret_key_123` |
| `AUTH_SECRET_KEY` | Cryptographic secret for signing JWT tokens | **Yes** | `super-secure-production-random-token-key-256` |
| `TOKEN_EXPIRE_HOURS` | Token validity window | No | `24` (Defaults to 24) |
| `GEMINI_API_KEY` | Google Gemini API key for enhanced NLU | Optional | `AIzaSy...` |
| `ENVIRONMENT` | Deployment environment flag | No | `production` |

---

## 3. Database Migration & Provisioning

When connecting to a new PostgreSQL instance (e.g. Neon or Supabase):
1. Copy the connection string into your environment:
   ```bash
   export DATABASE_URL="postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require"
   ```
2. Run Alembic migrations:
   ```bash
   alembic upgrade head
   ```
3. Run the idempotent database seeder to initialize the catalog, demo merchant, and baseline order baskets:
   ```bash
   python -c "from backend.app.database import SessionLocal; from backend.app.seed.seed_data import seed_initial_data; db=SessionLocal(); seed_initial_data(db)"
   ```

---

## 4. Post-Deployment Smoke Verification

Run these HTTP requests against your live Vercel URL to verify health:

```bash
# 1. Check API Health
curl https://merchantpilot-ai.vercel.app/api/health

# 2. Check Agent Catalog
curl https://merchantpilot-ai.vercel.app/api/agent/catalog

# 3. Check Policy Engine
curl https://merchantpilot-ai.vercel.app/api/policies

# 4. Check Storefront
curl -I https://merchantpilot-ai.vercel.app/store
```
All endpoints should return HTTP 200.
