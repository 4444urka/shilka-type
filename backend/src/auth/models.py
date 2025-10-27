from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    shilka_coins = Column(Integer, default=0)
    selected_theme_id = Column(Integer, ForeignKey("themes.id"), nullable=True)
    
    # Связь с сессиями набора
    typing_sessions = relationship("TypingSession", back_populates="user")
    # Связь с темами
    themes = relationship("Theme", back_populates="author", foreign_keys="Theme.author_id")
    selected_theme = relationship("Theme", foreign_keys=[selected_theme_id])


class Theme(Base):
    __tablename__ = "themes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    theme_data = Column(Text, nullable=False)  # JSON строка
    is_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Связь с автором
    author = relationship("User", back_populates="themes", foreign_keys=[author_id])
