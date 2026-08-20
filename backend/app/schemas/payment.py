from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PaymentCreate(BaseModel):
    enrollment_id: int
    amount: float
    method: str
    transaction_id: Optional[str] = None

class PaymentOut(BaseModel):
    id: int
    enrollment_id: int
    amount: float
    status: str
    method: str
    transaction_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True