from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse
import uuid
import time
from backend.app.database import SessionLocal
from backend.app.models.merchant import Merchant
from backend.app.services.mcp_service import generate_mcp_token

oauth_router = APIRouter(tags=["OAuth 2.1 Metadata & Discovery"])

BASE_URL = "https://merchantpilot-ai.vercel.app"

@oauth_router.get("/.well-known/oauth-protected-resource")
async def oauth_protected_resource():
    """
    RFC 9728: OAuth 2.0 Protected Resource Metadata
    Enables Claude Web and MCP clients to discover authorization servers
    and supported scopes for the /mcp endpoint.
    """
    return JSONResponse(
        {
            "resource": f"{BASE_URL}/mcp",
            "authorization_servers": [
                BASE_URL
            ],
            "scopes_supported": [
                "mcp:tools"
            ],
            "bearer_methods_supported": [
                "header"
            ]
        },
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    )

@oauth_router.get("/.well-known/oauth-authorization-server")
async def oauth_authorization_server():
    """
    RFC 8414: OAuth 2.0 Authorization Server Metadata
    Exposes authorization, token, and registration endpoints for MCP clients.
    """
    return JSONResponse(
        {
            "issuer": BASE_URL,
            "authorization_endpoint": f"{BASE_URL}/api/oauth/authorize",
            "token_endpoint": f"{BASE_URL}/api/oauth/token",
            "registration_endpoint": f"{BASE_URL}/api/oauth/register",
            "response_types_supported": ["code"],
            "grant_types_supported": ["authorization_code", "client_credentials"],
            "code_challenge_methods_supported": ["S256"],
            "token_endpoint_auth_methods_supported": ["client_secret_post", "none"],
            "scopes_supported": ["mcp:tools"]
        },
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "*"
        }
    )

@oauth_router.post("/api/oauth/register")
@oauth_router.options("/api/oauth/register")
async def oauth_dynamic_client_registration(request: Request):
    """
    RFC 7591: Dynamic Client Registration for Claude Web
    """
    if request.method == "OPTIONS":
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        )

    client_id = f"claude_client_{uuid.uuid4().hex[:12]}"
    client_secret = f"cs_{uuid.uuid4().hex}"
    return JSONResponse(
        {
            "client_id": client_id,
            "client_secret": client_secret,
            "client_id_issued_at": int(time.time()),
            "client_secret_expires_at": 0,
            "redirect_uris": ["https://claude.ai/api/mcp/auth_callback"],
            "grant_types": ["authorization_code", "client_credentials"],
            "response_types": ["code"],
            "scope": "mcp:tools",
            "token_endpoint_auth_method": "none"
        },
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        }
    )

@oauth_router.post("/api/oauth/token")
@oauth_router.options("/api/oauth/token")
async def oauth_token_endpoint(request: Request):
    """
    RFC 6749 Token Endpoint: Exchanges authorization code or credentials for an MCP Bearer token.
    """
    if request.method == "OPTIONS":
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "*"
            }
        )

    # Issue an active merchant MCP token
    db = SessionLocal()
    try:
        merchant = db.query(Merchant).first()
        if not merchant:
            return JSONResponse({"error": "invalid_request", "error_description": "No active merchant"}, status_code=400)
        
        token_info = generate_mcp_token(db, merchant.id, "Claude Web OAuth Connector")
        return JSONResponse(
            {
                "access_token": token_info["token"],
                "token_type": "Bearer",
                "expires_in": 2592000,
                "scope": "mcp:tools"
            },
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            }
        )
    finally:
        db.close()
