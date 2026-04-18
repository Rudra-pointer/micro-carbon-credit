"""
Carbon Credit Calculation Engine.

Implements the full 7-step credit formula:
  1. Find same-month-last-year bill
  2. Compute raw saving
  3. Per-capita normalisation
  4. Saving percentage
  5. Consistency streak bonus
  6. Final credit formula
  7. Persist GreenCredit record
"""

from dataclasses import dataclass
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.bill import Bill
from app.models.credit import Credit
from app.models.user import User


# ── Result dataclass ──────────────────────────────────────────
@dataclass
class CreditResultData:
    credits_earned: float
    saving_pct: float
    units_saved: float
    consistency_months: int
    running_total: float
    equivalent_fan_hours: float
    equivalent_smartphone_charges: float
    equivalent_kg_co2_offset: float
    efficiency_grade: str


# ── Tangible equivalents ──────────────────────────────────────
def calculate_tangible_equivalents(units_saved: float) -> dict:
    """
    Convert kWh saved into relatable real-world equivalents.
    - fan_hours:            kWh * 1000 / 75     (75 W ceiling fan)
    - smartphone_charges:   kWh * 1000 / 20     (20 Wh per phone charge)
    - co2_kg:               kWh * 0.82          (India grid emission factor)
    """
    fan_hours = (units_saved / 0.075) if units_saved > 0 else 0          # 0.075 kW = 75 W
    smartphone_charges = (units_saved * 1000 / 20) if units_saved > 0 else 0
    co2_kg = units_saved * 0.82 if units_saved > 0 else 0
    return {
        "fan_hours": round(fan_hours, 1),
        "smartphone_charges": round(smartphone_charges, 1),
        "co2_kg": round(co2_kg, 2),
    }


# ── Efficiency grade ──────────────────────────────────────────
def get_efficiency_grade(saving_pct: float) -> str:
    """
    A+: >= 20 %
    A : 15–20 %
    B :  8–15 %
    C :  3–8 %
    D : < 3 %
    """
    if saving_pct >= 20:
        return "A+"
    elif saving_pct >= 15:
        return "A"
    elif saving_pct >= 8:
        return "B"
    elif saving_pct >= 3:
        return "C"
    else:
        return "D"


# ── Helper: billing_month arithmetic ─────────────────────────
def _month_subtract(billing_month: str, months: int) -> str:
    """
    Given '2025-06' and months=12, return '2024-06'.
    Simple year/month arithmetic without dateutil dependency.
    """
    year, month = map(int, billing_month.split("-"))
    total_months = year * 12 + (month - 1) - months
    new_year = total_months // 12
    new_month = (total_months % 12) + 1
    return f"{new_year:04d}-{new_month:02d}"


# ── Consistency streak counter ────────────────────────────────
def _count_consecutive_saving_months(user_id: int, current_billing_month: str, db: Session) -> int:
    """
    Walk backwards from the month *before* current_billing_month and count
    how many consecutive months the user saved energy vs the same month
    in the prior year.
    """
    streak = 0
    check_month = _month_subtract(current_billing_month, 1)

    for _ in range(12):
        current_bill = (
            db.query(Bill)
            .filter(Bill.user_id == user_id, Bill.billing_month == check_month)
            .first()
        )
        last_year_month = _month_subtract(check_month, 12)
        last_year_bill = (
            db.query(Bill)
            .filter(Bill.user_id == user_id, Bill.billing_month == last_year_month)
            .first()
        )

        if current_bill and last_year_bill and current_bill.energy_consumed < last_year_bill.energy_consumed:
            streak += 1
            check_month = _month_subtract(check_month, 1)
        else:
            break

    return streak


# ══════════════════════════════════════════════════════════════
#  CarbonCreditEngine
# ══════════════════════════════════════════════════════════════
class CarbonCreditEngine:

    # ── Baseline ──────────────────────────────────────────────
    @staticmethod
    def calculate_baseline(user_id: int, db: Session) -> Optional[float]:
        """
        Fetch every BillRecord for the user, compute average monthly
        consumption, and persist it to user.baseline_monthly_avg.
        """
        bills = db.query(Bill).filter(Bill.user_id == user_id).all()
        if not bills:
            return None

        avg = sum(b.energy_consumed for b in bills) / len(bills)
        avg = round(avg, 2)

        user = db.query(User).filter(User.id == user_id).first()
        if user:
            user.baseline_monthly_avg = avg
            db.commit()

        return avg

    # ── Monthly credit calculation (7 steps) ──────────────────
    @staticmethod
    def calculate_monthly_credits(
        user_id: int,
        current_bill: Bill,
        db: Session,
    ) -> CreditResultData:
        """
        Full 7-step credit formula.
        """
        user = db.query(User).filter(User.id == user_id).first()
        household_size = user.household_size if (user and user.household_size and user.household_size > 0) else 1

        # ── STEP 1: Find same-month-last-year bill ───────────
        if not current_bill.billing_month:
            return CreditResultData(
                credits_earned=0, saving_pct=0, units_saved=0,
                consistency_months=0, running_total=0,
                equivalent_fan_hours=0, equivalent_smartphone_charges=0,
                equivalent_kg_co2_offset=0, efficiency_grade="D",
            )

        last_year_month = _month_subtract(current_bill.billing_month, 12)
        last_year_bill = (
            db.query(Bill)
            .filter(Bill.user_id == user_id, Bill.billing_month == last_year_month)
            .first()
        )

        if not last_year_bill:
            # No baseline comparison available
            return CreditResultData(
                credits_earned=0, saving_pct=0, units_saved=0,
                consistency_months=0, running_total=0,
                equivalent_fan_hours=0, equivalent_smartphone_charges=0,
                equivalent_kg_co2_offset=0, efficiency_grade="D",
            )

        last_year_units = last_year_bill.energy_consumed
        current_units = current_bill.energy_consumed

        # ── STEP 2: Raw saving ────────────────────────────────
        raw_saving = last_year_units - current_units
        if raw_saving <= 0:
            # No reward for increased consumption
            tangible = calculate_tangible_equivalents(0)
            return CreditResultData(
                credits_earned=0, saving_pct=0, units_saved=0,
                consistency_months=0,
                running_total=_running_total(user_id, db),
                equivalent_fan_hours=tangible["fan_hours"],
                equivalent_smartphone_charges=tangible["smartphone_charges"],
                equivalent_kg_co2_offset=tangible["co2_kg"],
                efficiency_grade="D",
            )

        # ── STEP 3: Per-capita normalisation ──────────────────
        per_capita_saving = raw_saving / household_size

        # ── STEP 4: Saving percentage ─────────────────────────
        saving_pct = (raw_saving / last_year_units) * 100 if last_year_units > 0 else 0

        # ── STEP 5: Consistency bonus ─────────────────────────
        consistency_months = _count_consecutive_saving_months(
            user_id, current_bill.billing_month, db
        )
        if consistency_months >= 12:
            multiplier = 1.75
        elif consistency_months >= 6:
            multiplier = 1.4
        elif consistency_months >= 3:
            multiplier = 1.2
        else:
            multiplier = 1.0

        # ── STEP 6: Final credit formula ──────────────────────
        base_credits = per_capita_saving * 0.5          # 0.5 credits per per-capita kWh
        bonus_credits = (saving_pct / 100) * 50         # max 50 bonus at 100 % saving
        final_credits = (base_credits + bonus_credits) * multiplier
        final_credits = round(final_credits, 2)

        # Tangible equivalents & grade
        tangible = calculate_tangible_equivalents(raw_saving)
        grade = get_efficiency_grade(saving_pct)

        # ── STEP 7: Persist GreenCredit record ────────────────
        credit_record = Credit(
            user_id=user_id,
            amount=final_credits,
            source="bill_reduction",
            billing_month=current_bill.billing_month,
            units_saved=round(raw_saving, 2),
            saving_pct=round(saving_pct, 2),
            base_credits=round(base_credits, 2),
            bonus_credits=round(bonus_credits, 2),
            consistency_months=consistency_months,
            consistency_multiplier=multiplier,
            equivalent_fan_hours=tangible["fan_hours"],
            equivalent_smartphone_charges=tangible["smartphone_charges"],
            equivalent_kg_co2_offset=tangible["co2_kg"],
            efficiency_grade=grade,
        )
        db.add(credit_record)
        db.commit()
        db.refresh(credit_record)

        running = _running_total(user_id, db)

        return CreditResultData(
            credits_earned=final_credits,
            saving_pct=round(saving_pct, 2),
            units_saved=round(raw_saving, 2),
            consistency_months=consistency_months,
            running_total=running,
            equivalent_fan_hours=tangible["fan_hours"],
            equivalent_smartphone_charges=tangible["smartphone_charges"],
            equivalent_kg_co2_offset=tangible["co2_kg"],
            efficiency_grade=grade,
        )


# ── Helpers ───────────────────────────────────────────────────
def _running_total(user_id: int, db: Session) -> float:
    """Sum of all credits ever earned by this user."""
    total = (
        db.query(func.coalesce(func.sum(Credit.amount), 0))
        .filter(Credit.user_id == user_id)
        .scalar()
    )
    return round(float(total), 2)


# ── Backward-compat convenience wrapper (used by bills router) ─
def calculate_credits(energy_saved: float) -> float:
    """Quick standalone estimate (no DB, no user context)."""
    return round(energy_saved * 0.5, 2)
