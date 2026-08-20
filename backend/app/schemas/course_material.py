from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CourseMaterialCreate(BaseModel):
    title: str

class CourseMaterialUpdate(BaseModel):
    title: Optional[str] = None

class CourseMaterialOut(BaseModel):
    id: int
    course_id: int
    title: str
    file_path: str
    file_type: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True