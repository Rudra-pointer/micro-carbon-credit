"""
SQLAlchemy User model — includes registration-specific fields.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # Profile / registration fields
    consumer_number = Column(String(100), nullable=True)
    household_size = Column(Integer, default=1)
    discom_name = Column(String(150), nullable=True)

    # Baseline (set by calculation engine)
    baseline_monthly_avg = Column(Float, nullable=True, comment="Average monthly kWh from historical data")

    # Flags
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    bills = relationship("Bill", back_populates="owner", lazy="selectin")
    credits = relationship("Credit", back_populates="owner", lazy="selectin")
    redemptions = relationship("Redemption", back_populates="owner", lazy="selectin")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"
