from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.database import get_db
from backend.app.schemas.auth import SignUpRequest, SignInRequest, AuthResponse, UserResponse, ProfileUpdateRequest
from backend.app.services.auth_service import AuthService
from backend.app.api.deps import get_current_user, check_rate_limit
from backend.app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication & Profile"])

@router.post("/signup", response_model=AuthResponse, summary="User Registration (Customer or Merchant)")
def sign_up(request: SignUpRequest, req: Request, db: Session = Depends(get_db)):
    check_rate_limit(req)
    try:
        return AuthService.sign_up(db, request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Registration failed. Please try again.")

@router.post("/signin", response_model=AuthResponse, summary="User Authentication & Token Generation")
def sign_in(request: SignInRequest, req: Request, db: Session = Depends(get_db)):
    check_rate_limit(req)
    try:
        return AuthService.sign_in(db, request)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Authentication failed. Please try again.")

@router.get("/me", response_model=UserResponse, summary="Get Current Authenticated User Profile")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return AuthService._build_user_response(db, current_user)

@router.put("/me", response_model=UserResponse, summary="Update Authenticated User Profile")
def update_me(
    update_data: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        return AuthService.update_profile(db, current_user, update_data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/logout", summary="User Logout")
def logout():
    return {"success": True, "message": "Logged out successfully."}
