from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.core.database import get_db
from app.core.deps import require_role, get_current_user
from app.models.enrollment import Enrollment
from app.models.student import Student
from app.models.course import Course
from app.models.user import User
from app.schemas.enrollment import EnrollmentCreate, EnrollmentOut
from app.services.email_service import send_enrollment_confirmation

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])

@router.post("/", response_model=EnrollmentOut)
def create_enrollment(
    data: EnrollmentCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _=Depends(get_current_user)
):
    # Check duplicate
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == data.student_id,
        Enrollment.course_id == data.course_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled in this course")

    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    course = db.query(Course).filter(Course.id == data.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment = Enrollment(**data.model_dump())
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    # Send confirmation email in background
    user = db.query(User).filter(User.id == student.user_id).first()
    if user:
        background_tasks.add_task(
            send_enrollment_confirmation,
            user.email,
            user.name,
            course.title
        )

    return enrollment

@router.get("/", response_model=List[EnrollmentOut])
def get_enrollments(db: Session = Depends(get_db), _=Depends(require_role("admin", "staff"))):
    return db.query(Enrollment).all()

@router.get("/me", response_model=List[EnrollmentOut])
def get_my_enrollments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    enrollments: object = (
        db.query(Enrollment)
        .options(joinedload(Enrollment.course))
        .filter(Enrollment.student_id == student.id)
        .all()
    )

    return enrollments

@router.get("/{enrollment_id}", response_model=EnrollmentOut)
def get_enrollment(enrollment_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    return enrollment

@router.patch("/{enrollment_id}/confirm", response_model=EnrollmentOut)
def confirm_enrollment(enrollment_id: int, db: Session = Depends(get_db), _=Depends(require_role("admin", "staff"))):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrollment.status = "confirmed"
    db.commit()
    db.refresh(enrollment)
    return enrollment

@router.patch("/{enrollment_id}/cancel", response_model=EnrollmentOut)
def cancel_enrollment(enrollment_id: int, db: Session = Depends(get_db), _=Depends(require_role("admin", "staff"))):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    enrollment.status = "cancelled"
    db.commit()
    db.refresh(enrollment)
    return enrollment