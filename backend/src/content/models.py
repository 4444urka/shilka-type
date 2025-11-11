"""
SQLAlchemy модели для хранения слов и предложений
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Index

from ..database import Base


class Word(Base):
    """Модель для хранения отдельных слов"""
    __tablename__ = "words"

    id = Column(Integer, primary_key=True, index=True)
    language = Column(String(10), nullable=False, index=True)  # 'ru', 'en', etc.
    text = Column(String(100), nullable=False)  # Очищенное слово
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Составной индекс для быстрого выбора случайных активных слов по языку
    __table_args__ = (
        Index('ix_words_language_active', 'language', 'is_active'),
    )


class Sentence(Base):
    """Модель для хранения предложений"""
    __tablename__ = "sentences"

    id = Column(Integer, primary_key=True, index=True)
    language = Column(String(10), nullable=False, index=True)  # 'ru', 'en', etc.
    text = Column(Text, nullable=False)  # Очищенное предложение
    word_count = Column(Integer, nullable=False)  # Количество слов в предложении
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Составной индекс для быстрого выбора случайных активных предложений по языку
    __table_args__ = (
        Index('ix_sentences_language_active', 'language', 'is_active'),
    )
