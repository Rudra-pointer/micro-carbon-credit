"""
Admin-only routes for platform management.
Every endpoint requires the authenticated user to have is_admin=True.
"""
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.bill import Bill
from app.models.credit import Credit, Redemption
from app.utils.auth import get_current_user

router = APIRouter()

def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user

class PlatformStats(BaseModel):
    total_users: int
    credits_issued_this_month: float
    redemptions_pending: int
    redemptions_completed: int
    total_kwh_saved: float
    top_savers: list

class UserListItem(BaseModel):
    id: int
    email: str
    consumer_number: Optional[str] = None
    discom_name: Optional[str] = None
    is_active: bool
    is_admin: bool
    total_credits: float
    last_bill_date: Optional[str] = None
    class Config:
        from_attributes = True

class PaginatedUsers(BaseModel):
    users: List[UserListItem]
    total: int
    page: int
    pages: int

class IssueCreditRequest(BaseModel):
    user_id: int
    amount: float
    reason: str

class FailRedemptionRequest(BaseModel):
    reason: str

@router.get("/stats", response_model=PlatformStats)
def get_platform_stats(admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar() or 0
    month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    credits_this_month = db.query(func.coalesce(func.sum(Credit.amount), 0)).filter(Credit.created_at >= month_start).scalar()
    pending = db.query(func.count(Redemption.id)).filter(Redemption.status == "pending").scalar() or 0
    completed = db.query(func.count(Redemption.id)).filter(Redemption.status == "completed").scalar() or 0
    total_kwh = db.query(func.coalesce(func.sum(Credit.units_saved), 0)).scalar()
    top_q = (db.query(User.email, func.sum(Credit.amount).label("total")).join(Credit, Credit.user_id == User.id)
        .filter(Credit.created_at >= month_start).group_by(User.id, User.email)
        .order_by(func.sum(Credit.amount).desc()).limit(10).all())
    top_savers = [{"email": r[0], "credits": float(r[1])} for r in top_q]
    return PlatformStats(total_users=total_users, credits_issued_this_month=float(credits_this_month),
        redemptions_pending=pending, redemptions_completed=completed, total_kwh_saved=float(total_kwh), top_savers=top_savers)

@router.get("/users", response_model=PaginatedUsers)
def list_users(page: int = Query(1, ge=1), limit: int = Query(20, ge=1, le=100),
    search: str = Query(""), admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    query = db.query(User)
    if search:
        p = f"%{search}%"
        query = query.filter((User.email.ilike(p)) | (User.consumer_number.ilike(p)))
    total = query.count()
    users_raw = query.order_by(User.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    items = []
    for u in users_raw:
        tc = sum(c.amount for c in u.credits) if u.credits else 0
        lb = max((b.created_at for b in u.bills), default=None) if u.bills else None
        items.append(UserListItem(id=u.id, email=u.email, consumer_number=u.consumer_number,
            discom_name=u.discom_name, is_active=u.is_active, is_admin=u.is_admin,
            total_credits=tc, last_bill_date=lb.isoformat() if lb else None))
    return PaginatedUsers(users=items, total=total, page=page, pages=max(1, -(-total // limit)))

@router.get("/users/{user_id}/bills")
def get_user_bills(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    bills = db.query(Bill).filter(Bill.user_id == user_id).order_by(Bill.created_at.desc()).all()
    return [{"id": b.id, "amount": b.amount, "energy_consumed": b.energy_consumed,
        "billing_month": b.billing_month, "source": b.source,
        "created_at": b.created_at.isoformat() if b.created_at else None} for b in bills]

@router.post("/users/{user_id}/verify")
def verify_user(user_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    return {"status": "success", "message": f"User {user.email} verified."}

@router.post("/credits/issue")
def issue_credits(payload: IssueCreditRequest, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    credit = Credit(user_id=payload.user_id, amount=payload.amount, source="admin_manual",
        description=f"Manual issue: {payload.reason}", billing_month=datetime.utcnow().strftime("%Y-%m"))
    db.add(credit)
    db.commit()
    return {"status": "success", "message": f"{payload.amount} credits issued to {user.email}."}

@router.get("/redemptions")
def list_redemptions(status_filter: str = Query("pending", alias="status"),
    admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    query = db.query(Redemption).join(User, Redemption.user_id == User.id)
    if status_filter != "all":
        query = query.filter(Redemption.status == status_filter)
    results = query.order_by(Redemption.created_at.desc()).all()
    return [{"id": r.id, "user_email": r.owner.email if r.owner else "N/A",
        "credits_redeemed": r.credits_redeemed, "amount_inr": r.amount_inr,
        "upi_id": r.upi_id, "status": r.status,
        "created_at": r.created_at.isoformat() if r.created_at else None} for r in results]

@router.post("/redemptions/{redemption_id}/complete")
def complete_redemption(redemption_id: int, admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    r = db.query(Redemption).filter(Redemption.id == redemption_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Redemption not found")
    r.status = "completed"
    db.commit()
    return {"status": "success", "message": f"Redemption #{r.id} marked completed."}

@router.post("/redemptions/{redemption_id}/fail")
def fail_redemption(redemption_id: int, payload: FailRedemptionRequest,
    admin: User = Depends(get_admin_user), db: Session = Depends(get_db)):
    r = db.query(Redemption).filter(Redemption.id == redemption_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Redemption not found")
    r.status = "failed"
    db.commit()
    return {"status": "success", "message": f"Redemption #{r.id} failed. Reason: {payload.reason}"}
