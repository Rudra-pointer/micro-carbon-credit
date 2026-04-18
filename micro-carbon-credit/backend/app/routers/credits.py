"""
Credits router — summary, history, and redemption endpoints.
"""

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.credit import Credit, Redemption
from app.schemas.credit import (
    CreditSummary,
    CreditHistoryItem,
    CreditResponse,
    RedeemRequest,
    RedemptionResponse,
)
from app.utils.auth import get_current_user

router = APIRouter()


# ── GET /credits/summary ──────────────────────────────────────
@router.get("/summary", response_model=CreditSummary)
def get_credit_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns: total credits, credits this month, current grade,
    streak, baseline, and total redeemed.
    """
    # Total credits earned ever
    total_credits = (
        db.query(func.coalesce(func.sum(Credit.amount), 0))
        .filter(Credit.user_id == current_user.id)
        .scalar()
    )

    # Total redeemed
    total_redeemed = (
        db.query(func.coalesce(func.sum(Redemption.credits_redeemed), 0))
        .filter(Redemption.user_id == current_user.id)
        .scalar()
    )

    # This month
    now = datetime.utcnow()
    current_month_str = f"{now.year:04d}-{now.month:02d}"
    credits_this_month = (
        db.query(func.coalesce(func.sum(Credit.amount), 0))
        .filter(Credit.user_id == current_user.id, Credit.billing_month == current_month_str)
        .scalar()
    )

    # Latest grade and streak
    latest_credit = (
        db.query(Credit)
        .filter(Credit.user_id == current_user.id)
        .order_by(Credit.created_at.desc())
        .first()
    )

    return CreditSummary(
        total_credits=round(float(total_credits), 2),
        credits_this_month=round(float(credits_this_month), 2),
        current_grade=latest_credit.efficiency_grade if latest_credit else None,
        streak_months=latest_credit.consistency_months if latest_credit else 0,
        baseline_monthly_avg=current_user.baseline_monthly_avg,
        total_redeemed=round(float(total_redeemed), 2),
    )


# ── GET /credits/history ──────────────────────────────────────
@router.get("/history", response_model=List[CreditHistoryItem])
def get_credit_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Month-by-month credit history for the authenticated user."""
    records = (
        db.query(Credit)
        .filter(Credit.user_id == current_user.id)
        .order_by(Credit.created_at.desc())
        .all()
    )

    return [
        CreditHistoryItem(
            billing_month=r.billing_month,
            credits_earned=r.amount,
            units_saved=r.units_saved,
            saving_pct=r.saving_pct,
            efficiency_grade=r.efficiency_grade,
            created_at=r.created_at,
        )
        for r in records
    ]


# ── POST /credits/redeem ──────────────────────────────────────
@router.post("/redeem", response_model=RedemptionResponse)
def redeem_credits(
    payload: RedeemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Redeem carbon credits for cash.
    Rate: 100 credits = Rs. 10.
    Minimum: 100 credits.
    """
    # ── Calculate available balance ───────────────────────────
    total_earned = float(
        db.query(func.coalesce(func.sum(Credit.amount), 0))
        .filter(Credit.user_id == current_user.id)
        .scalar()
    )
    total_redeemed = float(
        db.query(func.coalesce(func.sum(Redemption.credits_redeemed), 0))
        .filter(Redemption.user_id == current_user.id)
        .scalar()
    )
    available = round(total_earned - total_redeemed, 2)

    # ── Validations ───────────────────────────────────────────
    if payload.credits_to_redeem < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum 100 credits required for redemption.",
        )

    if payload.credits_to_redeem > available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient credits. Available: {available}",
        )

    # ── Calculate payout ──────────────────────────────────────
    amount_inr = round(payload.credits_to_redeem / 100 * 10, 2)

    # ── Create redemption record ──────────────────────────────
    redemption = Redemption(
        user_id=current_user.id,
        credits_redeemed=payload.credits_to_redeem,
        amount_inr=amount_inr,
        upi_id=payload.upi_id,
        status="pending",
    )
    db.add(redemption)
    db.commit()
    db.refresh(redemption)

    return redemption
