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
