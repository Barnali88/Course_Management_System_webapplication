from sqlalchemy import Column, Integer, ForeignKey, Float, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin

class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    enrollment_id = Column(Integer, ForeignKey("enrollments.id"), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="pending")  # pending, completed, failed
    method = Column(String(50))  # cash, card, online
    transaction_id = Column(String(100), nullable=True)

    enrollment = relationship("Enrollment", back_populates="payment")