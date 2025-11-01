from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from src.database import Base
from sqlalchemy import Column, DateTime
from datetime import datetime


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
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Связь с пользователем
    user = relationship("User", back_populates="typing_sessions")
    

class CoinTransaction(Base):
    __tablename__ = "coin_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    typing_session_id = Column(Integer, ForeignKey("typing_sessions.id"), nullable=True, unique=True)
    amount = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Связи (опционально)
    user = relationship("User")
    typing_session = relationship("TypingSession")
