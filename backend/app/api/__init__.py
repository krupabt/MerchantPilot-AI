from fastapi import APIRouter
from backend.app.api.agent import router as agent_router
from backend.app.api.products import router as products_router
from backend.app.api.revenue import router as revenue_router
from backend.app.api.policies import router as policies_router
from backend.app.api.checkout import router as checkout_router
from backend.app.api.razorpay import router as razorpay_router
from backend.app.api.audit import router as audit_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.auth import router as auth_router
from backend.app.api.merchant import router as merchant_router
from backend.app.api.customer import router as customer_router
from backend.app.api.merchant_ai import router as merchant_ai_router
from backend.app.api.sales import router as sales_router
from backend.app.api.import_data import router as import_router
from backend.app.api.store import router as store_router
from backend.app.api.mcp_routes import router as mcp_router
from backend.app.api.oauth_routes import oauth_router

# Router with explicit /api prefix
api_router = APIRouter(prefix="/api")
api_router.include_router(agent_router)
api_router.include_router(products_router)
api_router.include_router(revenue_router)
api_router.include_router(policies_router)
api_router.include_router(checkout_router)
api_router.include_router(razorpay_router)
api_router.include_router(audit_router)
api_router.include_router(dashboard_router)
api_router.include_router(auth_router)
api_router.include_router(merchant_router)
api_router.include_router(customer_router)
api_router.include_router(merchant_ai_router)
api_router.include_router(sales_router)
api_router.include_router(import_router)
api_router.include_router(store_router)
api_router.include_router(mcp_router)
api_router.include_router(oauth_router)

# Also expose root router (without /api prefix) in case proxy or rewrite strips /api
root_api_router = APIRouter()
root_api_router.include_router(agent_router)
root_api_router.include_router(products_router)
root_api_router.include_router(revenue_router)
root_api_router.include_router(policies_router)
root_api_router.include_router(checkout_router)
root_api_router.include_router(razorpay_router)
root_api_router.include_router(audit_router)
root_api_router.include_router(dashboard_router)
root_api_router.include_router(auth_router)
root_api_router.include_router(merchant_router)
root_api_router.include_router(customer_router)
root_api_router.include_router(merchant_ai_router)
root_api_router.include_router(sales_router)
root_api_router.include_router(import_router)
root_api_router.include_router(store_router)
root_api_router.include_router(mcp_router)
root_api_router.include_router(oauth_router)
