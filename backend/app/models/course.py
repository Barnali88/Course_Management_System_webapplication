from sqlalchemy import Column, String, Text, Integer, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin

class Course(Base, TimestampMixin):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Float, default=0.0)
    thumbnail = Column(String(255), nullable=True)
    material = Column(String(255), nullable=True)  # old field, can stay for compatibility
    is_active = Column(Boolean, default=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=False)

    category = relationship("Category", back_populates="courses")
    teacher = relationship("Teacher", back_populates="courses")
    enrollments = relationship("Enrollment", back_populates="course")
    materials = relationship(
        "CourseMaterial",
        back_populates="course",
        cascade="all, delete-orphan"
    )
