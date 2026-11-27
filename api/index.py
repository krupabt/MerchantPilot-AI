import sys
import os
from pathlib import Path

# Add project root to sys.path so 'backend' is importable by Vercel
root_dir = str(Path(__file__).parent.parent.resolve())
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from backend.app.main import app
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

class VercelPathMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Restore real original path if Vercel internal rewrite passed /api/index.py
        matched_path = request.headers.get("x-matched-path") or request.headers.get("x-invoke-path")
        current_path = request.scope.get("path", "")
        if matched_path and current_path in ("/api/index.py", "/api/index", "/index.py", "/api"):
            clean_path = matched_path.split("?")[0]
            if clean_path == "/mcp":
                clean_path = "/mcp/"
            request.scope["path"] = clean_path
        response = await call_next(request)
        return response

app.add_middleware(VercelPathMiddleware)

__all__ = ["app"]
