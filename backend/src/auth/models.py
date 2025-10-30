from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    shilka_coins = Column(Integer, default=0)
    selected_theme_id = Column(Integer, ForeignKey("themes.id", use_alter=True), nullable=True)
    
    # Связь с сессиями набора
    typing_sessions = relationship("TypingSession", back_populates="user")
    # Связь с темами
    themes = relationship("Theme", back_populates="author", foreign_keys="Theme.author_id")
    selected_theme = relationship("Theme", foreign_keys=[selected_theme_id])
