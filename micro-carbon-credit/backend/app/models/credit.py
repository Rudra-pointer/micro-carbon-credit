"""
SQLAlchemy models for carbon credits and redemptions.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Credit(Base):
    """Each row = one monthly credit calculation event."""
    __tablename__ = "credits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Core credit data
    amount = Column(Float, nullable=False, comment="Final credits earned this period")
    source = Column(String(100), nullable=True, comment="bill_reduction, solar, trade")
    description = Column(String(500), nullable=True)
    billing_month = Column(String(20), nullable=True, comment="e.g. 2025-03")

    # Intermediate calculation values (stored for transparency)
    units_saved = Column(Float, default=0, comment="kWh saved vs same month last year")
    saving_pct = Column(Float, default=0, comment="Percentage saved")
    base_credits = Column(Float, default=0)
    bonus_credits = Column(Float, default=0)
    consistency_months = Column(Integer, default=0, comment="Consecutive saving months streak")
    consistency_multiplier = Column(Float, default=1.0)

    # Tangible equivalents
    equivalent_fan_hours = Column(Float, default=0)
    equivalent_smartphone_charges = Column(Float, default=0)
    equivalent_kg_co2_offset = Column(Float, default=0)

    # Efficiency grade
    efficiency_grade = Column(String(5), nullable=True, comment="A+, A, B, C, D")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="credits")

    def __repr__(self) -> str:
        return f"<Credit id={self.id} user={self.user_id} amount={self.amount} grade={self.efficiency_grade}>"


class Redemption(Base):
    """Tracks credit-to-cash redemption requests."""
    __tablename__ = "redemptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    credits_redeemed = Column(Float, nullable=False)
    amount_inr = Column(Float, nullable=False, comment="Rs. payout (100 credits = Rs.10)")
    upi_id = Column(String(255), nullable=False)
    status = Column(String(50), default="pending", comment="pending, processing, completed, failed")

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="redemptions")

    def __repr__(self) -> str:
        return f"<Redemption id={self.id} user={self.user_id} credits={self.credits_redeemed}>"
