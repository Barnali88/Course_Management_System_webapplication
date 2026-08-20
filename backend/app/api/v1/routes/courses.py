from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.models.teacher import Teacher
from app.core.database import get_db
from app.core.deps import require_role, get_current_user
from app.models.course import Course
from app.models.course_material import CourseMaterial
from app.models.student import Student
from app.models.enrollment import Enrollment
from app.models.user import User
from app.schemas.course import CourseCreate, CourseOut
from app.schemas.course_material import CourseMaterialOut
from app.services.file_service import save_file

router = APIRouter(prefix="/courses", tags=["Courses"])


def get_role_name(user):
    if getattr(user, "role", None) and getattr(user.role, "name", None):
        return user.role.name.lower()
    return ""


def can_manage_course(user, course, db):
    role = get_role_name(user)

    if role in ["admin", "staff"]:
        return True

    if role == "teacher":
        teacher = db.query(Teacher).filter(Teacher.user_id == user.id).first()
        if teacher and teacher.id == course.teacher_id:
            return True

    return False


def student_has_access(user, course_id, db):
    role = get_role_name(user)

    if role in ["admin", "staff", "teacher"]:
        return True

    if role != "student":
        return False

    student = db.query(Student).filter(Student.user_id == user.id).first()
    if not student:
        return False

    enrollment = (
        db.query(Enrollment)
        .filter(
            Enrollment.student_id == student.id,
            Enrollment.course_id == course_id,
            Enrollment.status == "confirmed"
        )
        .first()
    )

    return enrollment is not None


@router.post("/", response_model=CourseOut)
def create_course(
    data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    role = get_role_name(current_user)

    course_data = data.model_dump()

    if role == "teacher":
        teacher_profile = getattr(current_user, "teacher_profile", None)
        if not teacher_profile:
            raise HTTPException(status_code=403, detail="Teacher profile not found")
        course_data["teacher_id"] = teacher_profile.id

    elif role not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Not allowed to create course")

    course = Course(**course_data)
    db.add(course)
    db.commit()
    db.refresh(course)

    course = (
        db.query(Course)
        .options(joinedload(Course.materials))
        .filter(Course.id == course.id)
        .first()
    )
    return course


@router.get("/", response_model=List[CourseOut])
def get_courses(db: Session = Depends(get_db)):
    return (
        db.query(Course)
        .options(joinedload(Course.materials))
        .filter(Course.is_active == True)
        .all()
    )


@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = (
        db.query(Course)
        .options(joinedload(Course.materials))
        .filter(Course.id == course_id)
        .first()
    )
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.put("/{course_id}", response_model=CourseOut)
def update_course(
    course_id: int,
    data: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if not can_manage_course(current_user, course, db):
        raise HTTPException(status_code=403, detail="Not allowed to update this course")

    update_data = data.model_dump()

    if get_role_name(current_user) == "teacher":
        update_data["teacher_id"] = course.teacher_id

    for key, value in update_data.items():
        setattr(course, key, value)

    db.commit()
    db.refresh(course)

    course = (
        db.query(Course)
        .options(joinedload(Course.materials))
        .filter(Course.id == course.id)
        .first()
    )
    return course


@router.delete("/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    db.delete(course)
    db.commit()
    return {"message": "Course deleted"}


@router.post("/{course_id}/upload-thumbnail", response_model=CourseOut)
def upload_thumbnail(
    course_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    role = get_role_name(current_user)
    if role not in ["admin", "staff"]:
        raise HTTPException(status_code=403, detail="Only admin or staff can update thumbnail")

    course.thumbnail = save_file(file, "thumbnails")
    db.commit()
    db.refresh(course)

    course = (
        db.query(Course)
        .options(joinedload(Course.materials))
        .filter(Course.id == course.id)
        .first()
    )
    return course


@router.post("/{course_id}/materials", response_model=CourseMaterialOut)
def upload_course_material(
    course_id: int,
    title: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if not can_manage_course(current_user, course, db):
        raise HTTPException(status_code=403, detail="Not allowed to upload material for this course")

    saved_path = save_file(file, "materials")
    content_type = file.content_type or ""

    if content_type.startswith("image/"):
        file_type = "image"
    elif content_type.startswith("video/"):
        file_type = "video"
    else:
        file_type = "file"

    material = CourseMaterial(
        course_id=course.id,
        title=title,
        file_path=saved_path,
        file_type=file_type,
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material


@router.put("/{course_id}/materials/{material_id}", response_model=CourseMaterialOut)
def update_course_material(
    course_id: int,
    material_id: int,
    title: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if not can_manage_course(current_user, course, db):
        raise HTTPException(status_code=403, detail="Not allowed to edit material")

    material = (
        db.query(CourseMaterial)
        .filter(CourseMaterial.id == material_id, CourseMaterial.course_id == course_id)
        .first()
    )
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    material.title = title
    db.commit()
    db.refresh(material)
    return material


@router.delete("/{course_id}/materials/{material_id}")
def delete_course_material(
    course_id: int,
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    if not can_manage_course(current_user, course, db):
        raise HTTPException(status_code=403, detail="Not allowed to delete material")

    material = (
        db.query(CourseMaterial)
        .filter(CourseMaterial.id == material_id, CourseMaterial.course_id == course_id)
        .first()
    )
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    db.delete(material)
    db.commit()
    return {"message": "Material deleted"}


@router.get("/{course_id}/materials/{material_id}/access", response_model=CourseMaterialOut)
def get_material_with_access_check(
    course_id: int,
    material_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not student_has_access(current_user, course_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must purchase this course before viewing materials"
        )

    material = (
        db.query(CourseMaterial)
        .filter(CourseMaterial.id == material_id, CourseMaterial.course_id == course_id)
        .first()
    )
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")

    return material