from fastapi import APIRouter
from app.api.v1.routes import auth, users, roles, categories
from app.api.v1.routes import courses, students, teachers
from app.api.v1.routes import staffs, payments, dashboard, enrollment

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(users.router)
router.include_router(roles.router)
router.include_router(categories.router)
router.include_router(courses.router)
router.include_router(students.router)
router.include_router(teachers.router)
router.include_router(staffs.router)
router.include_router(enrollment.router)
router.include_router(payments.router)
router.include_router(dashboard.router)