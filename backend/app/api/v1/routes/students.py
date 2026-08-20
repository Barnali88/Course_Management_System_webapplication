from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.core.deps import require_role, get_current_user
from app.models.student import Student
from app.models.user import User
from app.schemas.student import StudentCreate, StudentUpdate, StudentOut

router = APIRouter(prefix="/students", tags=["Students"])


def _is_student_user(user: User) -> bool:
    role_name = ""
    if hasattr(user, "role") and user.role:
        role_name = (user.role.name or "").lower()

    if role_name == "student":
        return True

    if getattr(user, "role_id", None) == 3:
        return True

    return False


@router.post("/", response_model=StudentOut)
def create_student(
    data: StudentCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin"))
):
    existing = db.query(Student).filter(Student.user_id == data.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student profile already exists for this user")

    student = Student(**data.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)

    student = (
        db.query(Student)
        .options(joinedload(Student.user))
        .filter(Student.id == student.id)
        .first()
    )
    return student


@router.get("/", response_model=List[StudentOut])
def get_students(db: Session = Depends(get_db)):
    return db.query(Student).options(joinedload(Student.user)).all()


@router.get("/me", response_model=StudentOut)
def get_my_student_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not _is_student_user(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only student accounts can access student profile"
        )

    student = (
        db.query(Student)
        .options(joinedload(Student.user))
        .filter(Student.user_id == current_user.id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return student


@router.post("/me", response_model=StudentOut)
def create_my_student_profile(
    data: StudentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not _is_student_user(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only student accounts can create student profile"
        )

    existing = db.query(Student).filter(Student.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Student profile already exists")

    student = Student(
        user_id=current_user.id,
        phone=data.phone,
        address=data.address,
        date_of_birth=data.date_of_birth,
    )

    db.add(student)
    db.commit()
    db.refresh(student)

    student = (
        db.query(Student)
        .options(joinedload(Student.user))
        .filter(Student.id == student.id)
        .first()
    )
    return student


@router.put("/me", response_model=StudentOut)
def update_my_student_profile(
    data: StudentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not _is_student_user(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only student accounts can update student profile"
        )

    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    for key, value in data.model_dump(exclude_none=True).items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)

    student = (
        db.query(Student)
        .options(joinedload(Student.user))
        .filter(Student.id == student.id)
        .first()
    )
    return student


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = (
        db.query(Student)
        .options(joinedload(Student.user))
        .filter(Student.id == student_id)
        .first()
    )
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.delete("/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin"))
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(student)
    db.commit()
    return {"message": "Student deleted"}