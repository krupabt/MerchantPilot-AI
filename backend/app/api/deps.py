from fastapi import Depends, HTTPException, Header, status, Request
from sqlalchemy.orm import Session
from typing import Optional, List
import time
from collections import defaultdict

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import AuthService

# In-memory sliding window rate limiter
_request_records = defaultdict(list)

def check_rate_limit(request: Request, max_requests: int = 15, window_seconds: int = 60):
    """Enforces rate limiting on authentication and sensitive endpoints."""
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    
    # Filter out requests older than the sliding window
    _request_records[client_ip] = [t for t in _request_records[client_ip] if now - t < window_seconds]
    
    if len(_request_records[client_ip]) >= max_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication requests. Please try again in 1 minute."
        )
    _request_records[client_ip].append(now)

def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Extracts and validates JWT Bearer token, returning the authenticated User."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.split(" ")[1].strip()
    user = AuthService.get_current_user_from_token(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Returns the authenticated User if valid Bearer token provided, otherwise None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1].strip()
    return AuthService.get_current_user_from_token(db, token)

def require_role(allowed_roles: List[str]):
    """Dependency factory enforcing role-based authorization."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: User role '{current_user.role}' does not have required permissions."
            )
        return current_user
    return role_checker

def get_current_merchant(
    current_user: User = Depends(require_role(["merchant", "admin"]))
) -> User:
    """Ensures current user is an authenticated merchant with an assigned merchant ID."""
    if not current_user.merchant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Merchant profile not linked to an active merchant store."
        )
    return current_user

def get_current_customer(
    current_user: User = Depends(require_role(["customer", "merchant", "admin"]))
) -> User:
    """Returns the authenticated customer (merchants are also permitted to shop as customers)."""
    return current_user
