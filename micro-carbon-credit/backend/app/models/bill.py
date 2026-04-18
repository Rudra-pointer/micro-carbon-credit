"""
SQLAlchemy Bill model — represents a utility bill uploaded by a user or fetched via DISCOM.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean, Date
from sqlalchemy.orm import relationship
from app.database import Base


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Core Bill Data
    amount = Column(Float, nullable=False, comment="Total amount billed in local currency")
    energy_consumed = Column(Float, nullable=False, comment="Units consumed (kWh)")
    
    # Advanced DISCOM / OCR Data
    billing_period_start = Column(Date, nullable=True)
    billing_period_end = Column(Date, nullable=True)
    sanctioned_load = Column(Float, nullable=True, comment="Sanctioned load in kW")
    has_solar_netmetering = Column(Boolean, default=False)
    
    source = Column(String(50), nullable=True, comment="discom, user_upload, etc.")
    billing_month = Column(String(20), nullable=True, comment="e.g. 2025-03")
    image_url = Column(String(500), nullable=True, comment="Path or URL of uploaded bill image")
    ocr_raw_text = Column(Text, nullable=True, comment="Raw text extracted via OCR")

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="bills")

    def __repr__(self) -> str:
        return f"<Bill id={self.id} user_id={self.user_id} amount={self.amount}>"
