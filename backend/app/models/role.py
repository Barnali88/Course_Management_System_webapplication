from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import TimestampMixin

class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    name = Column(String(50), unique=True, nullable=False)  # admin, teacher, student, staff
    description = Column(String(200))

    users = relationship("User", back_populates="role")