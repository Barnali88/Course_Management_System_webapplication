from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.schemas.course_material import CourseMaterialOut

class CourseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float = 0.0
    category_id: int
    teacher_id: int

class CourseOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    price: float
    thumbnail: Optional[str] = None
    material: Optional[str] = None
    is_active: bool
    category_id: int
    teacher_id: int
    created_at: datetime
    materials: List[CourseMaterialOut] = []

    class Config:
        from_attributes = True