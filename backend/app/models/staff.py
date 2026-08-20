from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin

class Staff(Base, TimestampMixin):
    __tablename__ = "staffs"

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    phone = Column(String(20))
    department = Column(String(100))

    user = relationship("User", back_populates="staff")