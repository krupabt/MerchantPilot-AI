from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.api import api_router
from backend.app.seed.seed_data import seed_database
from backend.app.models.product import Product

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables exist and seed demo catalog
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        product_count = db.query(Product).count()
        if product_count == 0:
            print("Seeding initial demo catalog and historical transactions...")
            seed_database(db)
        else:
            print(f"Database already initialized with {product_count} products.")
    finally:
        db.close()
    yield
    # Shutdown logic if any

app = FastAPI(
    title=settings.APP_NAME,
    description="MerchantPilot AI: Making merchants AI-native and helping them grow revenue. (Razorpay AI Buildathon Track 01)",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development (Vite @ 5173, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include All API Routers under /api
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "tagline": "Making merchants AI-native and helping them grow revenue.",
        "track": "Razorpay AI Buildathon — Track 01: AI Growth & Agentic Commerce",
        "version": "1.0.0",
        "status": "operational",
        "docs_url": "/docs",
        "endpoints": {
            "agent_catalog": "/api/agent/catalog",
            "agent_chat": "/api/agent/chat",
            "revenue_insights": "/api/revenue/insights",
            "policies": "/api/policies",
            "checkout": "/api/checkout/create-order",
            "audit_trail": "/api/audit/logs",
            "dashboard_stats": "/api/dashboard/stats"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "MerchantPilot AI Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
