from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.database import get_db
from backend.app.schemas.auth import SignUpRequest, SignInRequest, AuthResponse, UserResponse
from backend.app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=AuthResponse, summary="User Registration")
def sign_up(request: SignUpRequest, db: Session = Depends(get_db)):
    try:
        return AuthService.sign_up(db, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Registration failed. Please try again.")

@router.post("/signin", response_model=AuthResponse, summary="User Authentication")
def sign_in(request: SignInRequest, db: Session = Depends(get_db)):
    try:
        return AuthService.sign_in(db, request)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Authentication failed. Please try again.")

@router.get("/me", response_model=UserResponse, summary="Current User Profile")
def get_me(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication token required.")
    token = authorization.split(" ")[1]
    user = AuthService.get_current_user_from_token(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Session expired or invalid token.")
    return user

@router.post("/logout", summary="User Logout")
def logout():
    return {"success": True, "message": "Logged out successfully."}
