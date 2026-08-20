from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin

class Teacher(Base, TimestampMixin):
    __tablename__ = "teachers"

    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    bio = Column(Text)
    phone = Column(String(20))
    expertise = Column(String(255))

    user = relationship("User", back_populates="teacher")
    courses = relationship("Course", back_populates="teacher")