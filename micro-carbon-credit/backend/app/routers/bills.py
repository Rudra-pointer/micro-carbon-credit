import os
import shutil
from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.bill import Bill
from app.schemas.bill import BillResponse, DiscomInitResponse
from app.utils.auth import get_current_user
from app.config import get_settings

from app.services.discom_service import DISCOMService
from app.services.calculation_engine import CarbonCreditEngine
from app.services.ocr_service import BillOCRService, validate_extracted_data

router = APIRouter()
settings = get_settings()

UPLOAD_DIR = "uploads/bills"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── Background Task: Calculate Credits & Notify ───────────────
def process_new_bill_background(user_id: int, bill_id: int, db: Session):
    """Background task triggered after a new bill is saved."""
    user = db.query(User).filter(User.id == user_id).first()
    bill = db.query(Bill).filter(Bill.id == bill_id).first()
    
    if user and bill:
        # Calculate credits for this specific bill
        result = CarbonCreditEngine.calculate_monthly_credits(user_id, bill, db)
        
        # In a real app, integrate an Email or Push Notification service here
        if result.credits_earned > 0:
            print(f"[NOTIFICATION to {user.email}]: Your {bill.billing_month} bill is processed! You earned {result.credits_earned} credits.")
        else:
            print(f"[NOTIFICATION to {user.email}]: Your {bill.billing_month} bill is processed. Keep trying to reduce consumption to earn credits!")


# ── POST /bills/initialize-from-discom ────────────────────────
@router.post("/initialize-from-discom", response_model=DiscomInitResponse)
async def initialize_from_discom(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.consumer_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a consumer number configured."
        )

    discom = DISCOMService(
        discom_name=current_user.discom_name or "",
        api_key=settings.DISCOM_API_KEY or ""
    )

    bill_history = await discom.fetch_12_month_history(current_user.consumer_number)

    saved_bills = 0
    for bd in bill_history:
        existing = db.query(Bill).filter(
            Bill.user_id == current_user.id,
            Bill.billing_period_start == bd.billing_period_start,
            Bill.billing_period_end == bd.billing_period_end
        ).first()

        if not existing:
            new_bill = Bill(
                user_id=current_user.id,
                amount=bd.total_amount_billed,
                energy_consumed=bd.units_consumed,
                billing_period_start=bd.billing_period_start,
                billing_period_end=bd.billing_period_end,
                sanctioned_load=bd.sanctioned_load,
                has_solar_netmetering=bd.has_solar_netmetering,
                source="discom",
                billing_month=bd.billing_period_start.strftime("%Y-%m") if bd.billing_period_start else None
            )
            db.add(new_bill)
            saved_bills += 1
    
    db.commit()

    # Recalculate baseline after historical load
    CarbonCreditEngine.calculate_baseline(current_user.id, db)

    return DiscomInitResponse(
        status="success",
        message="Successfully fetched and saved DISCOM history.",
        bills_imported=saved_bills
    )


# ── POST /bills/fetch-latest ──────────────────────────────────
@router.post("/fetch-latest")
async def fetch_latest_bill(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.consumer_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a consumer number configured."
        )

    discom = DISCOMService(
        discom_name=current_user.discom_name or "",
        api_key=settings.DISCOM_API_KEY or ""
    )

    bd = await discom.fetch_latest_bill(current_user.consumer_number)

    existing = db.query(Bill).filter(
        Bill.user_id == current_user.id,
        Bill.billing_period_start == bd.billing_period_start,
        Bill.billing_period_end == bd.billing_period_end
    ).first()

    if existing:
        return {
            "status": "already_up_to_date",
            "message": "The latest bill is already recorded."
        }

    new_bill = Bill(
        user_id=current_user.id,
        amount=bd.total_amount_billed,
        energy_consumed=bd.units_consumed,
        billing_period_start=bd.billing_period_start,
        billing_period_end=bd.billing_period_end,
        sanctioned_load=bd.sanctioned_load,
        has_solar_netmetering=bd.has_solar_netmetering,
        source="discom",
        billing_month=bd.billing_period_start.strftime("%Y-%m") if bd.billing_period_start else None
    )
    db.add(new_bill)
    db.commit()
    db.refresh(new_bill)

    # Queue credit calculation and notification
    background_tasks.add_task(process_new_bill_background, current_user.id, new_bill.id, db)

    return {
        "status": "success",
        "message": "Latest bill fetched. Credits will be calculated shortly.",
        "bill_id": new_bill.id
    }


# ── POST /bills/upload-image ──────────────────────────────────
@router.post("/upload-image", response_model=BillResponse)
async def upload_image(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Run OCR Service
    ocr_data = await BillOCRService.extract_bill_data(file_path, current_user.discom_name)
    
    # Check for manual review flags
    is_valid, issues = validate_extracted_data(ocr_data)
    if not is_valid:
        print(f"OCR Manual Review required for bill from user {current_user.id}. Issues: {issues}")

    start_date_str = ocr_data.get("billing_period_start")
    start_date = date.fromisoformat(start_date_str) if start_date_str else date.today().replace(day=1)
    
    end_date_str = ocr_data.get("billing_period_end")
    end_date = date.fromisoformat(end_date_str) if end_date_str else date.today()

    new_bill = Bill(
        user_id=current_user.id,
        amount=ocr_data.get("amount", 0.0),
        energy_consumed=ocr_data.get("energy_consumed", 0.0),
        billing_period_start=start_date,
        billing_period_end=end_date,
        sanctioned_load=ocr_data.get("sanctioned_load", 0.0),
        ocr_raw_text=ocr_data.get("ocr_raw_text", ""),
        source="user_upload",
        image_url=file_path,
        billing_month=start_date.strftime("%Y-%m")
    )
    
    db.add(new_bill)
    db.commit()
    db.refresh(new_bill)

    # Auto-trigger credit calculation via background task
    background_tasks.add_task(process_new_bill_background, current_user.id, new_bill.id, db)

    return new_bill

# ── GET /bills/history ─────────────────────────────────────────
@router.get("/history", response_model=List[BillResponse])
def get_bills_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all bills for the authenticated user."""
    bills = db.query(Bill).filter(Bill.user_id == current_user.id).order_by(Bill.billing_period_start.desc()).all()
    return bills

# ── GET /bills/{bill_id} ──────────────────────────────────────
@router.get("/{bill_id}", response_model=BillResponse)
def get_bill(
    bill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve a single bill's details."""
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == current_user.id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return bill

# ── PUT /bills/{bill_id}/correct ──────────────────────────────
class BillCorrectionRequest(BaseModel):
    amount: float
    energy_consumed: float

@router.put("/{bill_id}/correct", response_model=BillResponse)
def correct_bill(
    bill_id: int,
    payload: BillCorrectionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Manually correct OCR errors on a specific bill."""
    bill = db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == current_user.id).first()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
        
    bill.amount = payload.amount
    bill.energy_consumed = payload.energy_consumed
    db.commit()
    db.refresh(bill)
    
    return bill
