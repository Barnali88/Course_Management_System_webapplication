from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.deps import require_role, get_current_user
from app.models.payment import Payment
from app.models.enrollment import Enrollment
from app.models.student import Student
from app.models.user import User
from app.schemas.payment import PaymentCreate, PaymentOut
from app.services.email_service import send_enrollment_confirmation

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.post("/", response_model=PaymentOut)
def create_payment(
    data: PaymentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    enrollment = db.query(Enrollment).filter(Enrollment.id == data.enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    if db.query(Payment).filter(Payment.enrollment_id == data.enrollment_id).first():
        raise HTTPException(status_code=400, detail="Payment already exists for this enrollment")

    payment = Payment(**data.model_dump(), status="completed")
    db.add(payment)

    # Auto confirm enrollment after payment
    enrollment.status = "confirmed"
    db.commit()
    db.refresh(payment)

    # Send confirmation email
    student = db.query(Student).filter(Student.id == enrollment.student_id).first()
    user = db.query(User).filter(User.id == student.user_id).first()
    if user:
        background_tasks.add_task(
            send_enrollment_confirmation,
            user.email,
            user.name,
            enrollment.course.title
        )

    return payment

@router.get("/", response_model=List[PaymentOut])
def get_payments(db: Session = Depends(get_db), _=Depends(require_role("admin", "staff"))):
    return db.query(Payment).all()

@router.get("/{payment_id}", response_model=PaymentOut)
def get_payment(payment_id: int, db: Session = Depends(get_db), _=Depends(require_role("admin", "staff"))):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment