from sqlalchemy import Column, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin

class Category(Base, TimestampMixin):
    __tablename__ = "categories"

    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    image = Column(String(255))

    courses = relationship("Course", back_populates="category")