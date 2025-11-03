
from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from src.database import Base
from sqlalchemy.orm import relationship


class Theme(Base):
    __tablename__ = "themes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    theme_data = Column(Text, nullable=False)  # JSON строка
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Связь с автором (без back_populates чтобы избежать циклической зависимости)
    author = relationship("User", foreign_keys=[author_id])