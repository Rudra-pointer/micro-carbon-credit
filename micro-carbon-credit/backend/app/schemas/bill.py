from datetime import date, datetime
from pydantic import BaseModel
from typing import Optional

class BillBase(BaseModel):
    amount: float
    energy_consumed: float
    billing_period_start: Optional[date] = None
    billing_period_end: Optional[date] = None
    sanctioned_load: Optional[float] = None
    has_solar_netmetering: bool = False
    source: Optional[str] = None
    billing_month: Optional[str] = None
    image_url: Optional[str] = None
    ocr_raw_text: Optional[str] = None

class BillCreate(BillBase):
    pass

class BillResponse(BillBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DiscomInitResponse(BaseModel):
    status: str
    message: str
    bills_imported: int
