from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.types import ASGIApp, Scope, Receive, Send
from contextlib import asynccontextmanager
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app.api import api_router, root_api_router
from backend.app.seed.seed_data import seed_database
from backend.app.models.product import Product
from backend.app.mcp import mcp, get_mcp_app

# Instantiate the MCP app so session_manager is ready
mcp_asgi_app = get_mcp_app()

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
    
    # Run official MCP session manager for Streamable HTTP transport
    if hasattr(mcp.session_manager, "_has_started"):
        mcp.session_manager._has_started = False
    async with mcp.session_manager.run():
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

# Include All API Routers under /api and root fallback
app.include_router(api_router)
app.include_router(root_api_router)

# Class to route /mcp and /mcp/ directly to MCP ASGI app with zero redirects
class McpPathMiddleware:
    """
    Ensures both /mcp and /mcp/ (and subpaths) route directly to the
    MCP ASGI app with path='/' without Starlette Mount 307 temporary redirects.
    """
    def __init__(self, app: ASGIApp, mcp_app: ASGIApp):
        self.app = app
        self.mcp_app = mcp_app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope["type"] == "http":
            path = scope.get("path", "")
            if path in ("/mcp", "/mcp/"):
                sc = dict(scope)
                sc["path"] = "/"
                sc["raw_path"] = b"/"
                await self.mcp_app(sc, receive, send)
                return
            elif path.startswith("/mcp/"):
                sc = dict(scope)
                sc["path"] = path[4:]  # e.g. /sse or /messages
                sc["raw_path"] = sc["path"].encode("utf-8")
                await self.mcp_app(sc, receive, send)
                return

        await self.app(scope, receive, send)

# Mount MCP Server endpoint and intercept /mcp routes without 307 redirects
app.add_middleware(McpPathMiddleware, mcp_app=mcp_asgi_app)
app.mount("/mcp", mcp_asgi_app)

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
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "MerchantPilot AI Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
