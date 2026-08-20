from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class StaffCreate(BaseModel):
    user_id: int
    phone: Optional[str] = None
    department: Optional[str] = None

class StaffOut(BaseModel):
    id: int
    user_id: int
    phone: Optional[str]
    department: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True