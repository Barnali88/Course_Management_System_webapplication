from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TeacherCreate(BaseModel):
    user_id: int
    bio: Optional[str] = None
    phone: Optional[str] = None
    expertise: Optional[str] = None


class TeacherSelfCreate(BaseModel):
    bio: Optional[str] = None
    phone: Optional[str] = None
    expertise: Optional[str] = None


class TeacherUpdate(BaseModel):
    bio: Optional[str] = None
    phone: Optional[str] = None
    expertise: Optional[str] = None


class TeacherUserOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class TeacherOut(BaseModel):
    id: int
    user_id: int
    bio: Optional[str] = None
    phone: Optional[str] = None
    expertise: Optional[str] = None
    created_at: datetime
    user: Optional[TeacherUserOut] = None

    class Config:
        from_attributes = True