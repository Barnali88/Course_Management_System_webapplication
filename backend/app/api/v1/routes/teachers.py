from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.core.database import get_db
from app.core.deps import require_role, get_current_user
from app.models.teacher import Teacher
from app.models.user import User
from app.schemas.teacher import TeacherCreate, TeacherSelfCreate, TeacherUpdate, TeacherOut

router = APIRouter(prefix="/teachers", tags=["Teachers"])


def _is_teacher_user(user: User) -> bool:
    role_name = ""
    if hasattr(user, "role") and user.role:
        role_name = (user.role.name or "").lower()

    if role_name == "teacher":
        return True

    if getattr(user, "role_id", None) == 2:
        return True

    return False


@router.post("/", response_model=TeacherOut)
def create_teacher(
    data: TeacherCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin"))
):
    existing = db.query(Teacher).filter(Teacher.user_id == data.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Teacher profile already exists for this user")

    teacher = Teacher(**data.model_dump())
    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    teacher = (
        db.query(Teacher)
        .options(joinedload(Teacher.user))
        .filter(Teacher.id == teacher.id)
        .first()
    )
    return teacher


@router.get("/", response_model=List[TeacherOut])
def get_teachers(db: Session = Depends(get_db)):
    return db.query(Teacher).options(joinedload(Teacher.user)).all()


@router.get("/me", response_model=TeacherOut)
def get_my_teacher_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not _is_teacher_user(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teacher accounts can access teacher profile"
        )

    teacher = (
        db.query(Teacher)
        .options(joinedload(Teacher.user))
        .filter(Teacher.user_id == current_user.id)
        .first()
    )
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    return teacher


@router.post("/me", response_model=TeacherOut)
def create_my_teacher_profile(
    data: TeacherSelfCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not _is_teacher_user(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teacher accounts can create teacher profile"
        )

    existing = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Teacher profile already exists")

    teacher = Teacher(
        user_id=current_user.id,
        bio=data.bio,
        phone=data.phone,
        expertise=data.expertise,
    )

    db.add(teacher)
    db.commit()
    db.refresh(teacher)

    teacher = (
        db.query(Teacher)
        .options(joinedload(Teacher.user))
        .filter(Teacher.id == teacher.id)
        .first()
    )
    return teacher


@router.put("/me", response_model=TeacherOut)
def update_my_teacher_profile(
    data: TeacherUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not _is_teacher_user(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teacher accounts can update teacher profile"
        )

    teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")

    for key, value in data.model_dump(exclude_none=True).items():
        setattr(teacher, key, value)

    db.commit()
    db.refresh(teacher)

    teacher = (
        db.query(Teacher)
        .options(joinedload(Teacher.user))
        .filter(Teacher.id == teacher.id)
        .first()
    )
    return teacher


@router.get("/{teacher_id}", response_model=TeacherOut)
def get_teacher(teacher_id: int, db: Session = Depends(get_db)):
    teacher = (
        db.query(Teacher)
        .options(joinedload(Teacher.user))
        .filter(Teacher.id == teacher_id)
        .first()
    )
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher


@router.delete("/{teacher_id}")
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin"))
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    db.delete(teacher)
    db.commit()
    return {"message": "Teacher deleted"}