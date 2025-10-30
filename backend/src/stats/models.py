from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from src.database import Base


class TypingSession(Base):
    __tablename__ = "typing_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    wpm = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=False)
    duration = Column(Integer, nullable=True)  # секунды
    words = Column(Text, nullable=False)  # JSON строка списка слов
    history = Column(Text, nullable=False)  # JSON строка истории
    typing_mode = Column(Text, nullable=True)  # режим набора (words, sentences, etc.)
    language = Column(Text, nullable=True)  # язык (ru, en, etc.)
    test_type = Column(Text, nullable=True)  # тип теста (time, words)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Связь с пользователем
    user = relationship("User", back_populates="typing_sessions")
    