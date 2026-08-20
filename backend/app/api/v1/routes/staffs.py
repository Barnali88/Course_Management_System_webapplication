from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import require_role
from app.models.staff import Staff
from app.schemas.staff import StaffCreate, StaffOut

router = APIRouter(prefix="/staffs", tags=["Staffs"])

@router.post("/", response_model=StaffOut)
def create_staff(data: StaffCreate, db: Session = Depends(get_db), _=Depends(require_role("admin"))):
    staff = Staff(**data.model_dump())
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff

@router.get("/", response_model=List[StaffOut])
def get_staffs(db: Session = Depends(get_db), _=Depends(require_role("admin"))):
    return db.query(Staff).all()

@router.delete("/{staff_id}")
def delete_staff(staff_id: int, db: Session = Depends(get_db), _=Depends(require_role("admin"))):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    db.delete(staff)
    db.commit()
    return {"message": "Staff deleted"}