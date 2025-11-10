from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
import enum

from ..database import Base


class Role(str, enum.Enum):
    USER = "USER"
    MODER = "MODER"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(SAEnum(Role, name="role", create_constraint=True, native_enum=True), default=Role.USER, nullable=False)
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
    
    
