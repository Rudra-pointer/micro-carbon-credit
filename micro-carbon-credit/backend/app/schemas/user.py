"""
Pydantic schemas for User-related request / response payloads.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


# ── Base ──────────────────────────────────────────────────────
class UserBase(BaseModel):
    email: str


# ── Registration ──────────────────────────────────────────────
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    consumer_number: Optional[str] = None
    household_size: int = Field(default=1, ge=1)
    discom_name: Optional[str] = None


# ── Login ─────────────────────────────────────────────────────
class UserLogin(BaseModel):
    email: str
    password: str


# ── Token payloads ────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ── Response ──────────────────────────────────────────────────
class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    consumer_number: Optional[str] = None
    household_size: int
    discom_name: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
