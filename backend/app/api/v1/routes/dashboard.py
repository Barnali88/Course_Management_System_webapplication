from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.deps import require_role
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.models.payment import Payment

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _=Depends(require_role("admin", "staff"))):
    total_students = db.query(Student).count()
    total_teachers = db.query(Teacher).count()
    total_courses = db.query(Course).count()
    total_enrollments = db.query(Enrollment).count()
    total_revenue = db.query(func.sum(Payment.amount)).filter(Payment.status == "completed").scalar() or 0

    recent_enrollments = db.query(Enrollment).order_by(Enrollment.enrolled_at.desc()).limit(5).all()

    popular_courses = (
        db.query(Course.title, func.count(Enrollment.id).label("count"))
        .join(Enrollment, Course.id == Enrollment.course_id)
        .group_by(Course.id)
        .order_by(func.count(Enrollment.id).desc())
        .limit(5)
        .all()
    )

    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_courses": total_courses,
        "total_enrollments": total_enrollments,
        "total_revenue": total_revenue,
        "recent_enrollments": [
            {
                "id": e.id,
                "student_id": e.student_id,
                "course_id": e.course_id,
                "status": e.status,
                "enrolled_at": e.enrolled_at
            } for e in recent_enrollments
        ],
        "popular_courses": [
            {"title": title, "enrollments": count}
            for title, count in popular_courses
        ]
    }