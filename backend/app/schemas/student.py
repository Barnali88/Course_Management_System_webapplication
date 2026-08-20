from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class StudentCreate(BaseModel):
    user_id: int
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None


class StudentUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None


class StudentUserOut(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True


class StudentOut(BaseModel):
    id: int
    user_id: int
    phone: Optional[str] = None
    address: Optional[str] = None
    date_of_birth: Optional[date] = None
    created_at: datetime
    user: Optional[StudentUserOut] = None

    class Config:
        from_attributes = True