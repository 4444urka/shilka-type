from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="user")  # "user" или "admin"
    shilka_coins = Column(Integer, default=0)
    # Настройки пользователя по умолчанию
    default_time = Column(Integer, default=30)
    default_words = Column(Integer, default=25)
    default_language = Column(String, default="en")
    default_mode = Column(String, default="words")
    default_test_type = Column(String, default="time")
    selected_theme_id = Column(Integer, ForeignKey("themes.id"), nullable=True)
    
    # Связь с сессиями набора
    typing_sessions = relationship("TypingSession", back_populates="user", lazy="select")
    
    
