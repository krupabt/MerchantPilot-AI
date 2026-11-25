from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
import re

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"

class SignUpRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)
    role: Optional[str] = "customer"  # Default to customer, can be "merchant"
    store_name: Optional[str] = None  # If registering as a merchant
    store_slug: Optional[str] = None
    store_description: Optional[str] = None
    business_category: Optional[str] = "General Retail"  # e.g., Electronics, Clothing, Grocery, Stationery
    business_phone: Optional[str] = None
    business_address: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(EMAIL_REGEX, clean):
            raise ValueError("Invalid email format.")
        return clean

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: Optional[str]) -> str:
        if v and v.lower() not in ("merchant", "customer", "buyer"):
            raise ValueError("Role must be 'customer' or 'merchant'.")
        # Normalize "buyer" to "customer"
        return "customer" if (v and v.lower() in ("buyer", "customer")) else "merchant"

class SignInRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=1)

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        clean = v.strip().lower()
        if not re.match(EMAIL_REGEX, clean):
            raise ValueError("Invalid email format.")
        return clean

class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    current_password: Optional[str] = None
    new_password: Optional[str] = Field(None, min_length=6, max_length=100)

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    merchant_id: Optional[str] = None
    store_name: Optional[str] = None
    store_slug: Optional[str] = None
    store_description: Optional[str] = None
    store_logo: Optional[str] = None
    business_category: Optional[str] = None
    business_phone: Optional[str] = None
    business_address: Optional[str] = None
    onboarding_completed: Optional[bool] = False
    is_published: Optional[bool] = True
    is_demo: Optional[bool] = False
    created_at: Optional[datetime] = None

class AuthResponse(BaseModel):
    success: bool
    message: str
    token: str
    user: UserResponse
