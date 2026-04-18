"""
Pydantic schemas for credit and redemption payloads.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


# ── Credit Result (returned by calculation engine) ────────────
class CreditResult(BaseModel):
    credits_earned: float
    saving_pct: float
    units_saved: float
    consistency_months: int
    running_total: float
    equivalent_fan_hours: float
    equivalent_smartphone_charges: float
    equivalent_kg_co2_offset: float
    efficiency_grade: str


# ── Credit DB Response ────────────────────────────────────────
class CreditResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    source: Optional[str] = None
    billing_month: Optional[str] = None
    units_saved: float
    saving_pct: float
    base_credits: float
    bonus_credits: float
    consistency_months: int
    consistency_multiplier: float
    equivalent_fan_hours: float
    equivalent_smartphone_charges: float
    equivalent_kg_co2_offset: float
    efficiency_grade: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Summary (GET /credits/summary) ───────────────────────────
class CreditSummary(BaseModel):
    total_credits: float
    credits_this_month: float
    current_grade: Optional[str] = None
    streak_months: int
    baseline_monthly_avg: Optional[float] = None
    total_redeemed: float


# ── History item ──────────────────────────────────────────────
class CreditHistoryItem(BaseModel):
    billing_month: Optional[str] = None
    credits_earned: float
    units_saved: float
    saving_pct: float
    efficiency_grade: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Redemption ────────────────────────────────────────────────
class RedeemRequest(BaseModel):
    credits_to_redeem: float = Field(..., ge=100, description="Minimum 100 credits")
    upi_id: str = Field(..., min_length=5)


class RedemptionResponse(BaseModel):
    id: int
    credits_redeemed: float
    amount_inr: float
    upi_id: str
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
