"""
Сервисный слой для работы с контентом
"""
import logging
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from .models import Word, Sentence
from .utils import clean_text, extract_words, extract_sentences, count_words_in_text

logger = logging.getLogger(__name__)


async def upload_text_content(
    db: AsyncSession,
    raw_text: str,
    language: str
) -> tuple[int, int]:
    """
    Обрабатывает и сохраняет текст в БД как слова И предложения
    
    Args:
        db: Async сессия БД
        raw_text: Сырой текст от пользователя
        language: Язык ('ru' или 'en')
    
    Returns:
        Кортеж (количество созданных слов, количество созданных предложений)
    """
    # Очищаем текст
    cleaned = clean_text(raw_text, language)
    
    if not cleaned:
        return (0, 0)
    
    words_created = 0
    sentences_created = 0
    
    # Извлекаем и сохраняем слова
    words = extract_words(cleaned, language)
    
    for word_text in words:
        # Пропускаем слишком длинные токены, чтобы избежать ошибок вставки в БД
        if len(word_text) > 100:
            logger.warning("Skipping word because it exceeds 100 chars: %s", word_text)
            continue
        # Проверяем, нет ли уже такого слова
        result = await db.execute(
            select(Word).where(
                Word.language == language,
                Word.text == word_text
            )
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            word = Word(
                language=language,
                text=word_text,
                is_active=True
            )
            db.add(word)
            words_created += 1
    
    # Извлекаем и сохраняем предложения
    sentences = extract_sentences(cleaned, language)
    
    for sentence_text in sentences:
        # Проверяем, нет ли уже такого предложения
        result = await db.execute(
            select(Sentence).where(
                Sentence.language == language,
                Sentence.text == sentence_text
            )
        )
        existing = result.scalar_one_or_none()
        
        if not existing:
            word_count = count_words_in_text(sentence_text)
            sentence = Sentence(
                language=language,
                text=sentence_text,
                word_count=word_count,
                is_active=True
            )
            db.add(sentence)
            sentences_created += 1
    
    await db.commit()
    logger.info(f"Created {words_created} words and {sentences_created} sentences for language {language}")
    
    return (words_created, sentences_created)


async def get_random_words(
    db: AsyncSession,
    language: str,
    count: int = 25
) -> List[Word]:
    """
    Получает случайные слова из БД
    
    Args:
        db: Async сессия БД
        language: Язык слов
        count: Количество слов
    
    Returns:
        Список случайных слов
    """
    # SQLite использует RANDOM(), PostgreSQL - RANDOM()
    # SQLAlchemy автоматически переводит func.random()
    result = await db.execute(
        select(Word)
        .where(Word.language == language, Word.is_active == True)
        .order_by(func.random())
        .limit(count)
    )
    words = result.scalars().all()
    return list(words)


async def get_random_sentences(
    db: AsyncSession,
    language: str,
    count: int = 10
) -> List[Sentence]:
    """
    Получает случайные предложения из БД
    
    Args:
        db: Async сессия БД
        language: Язык предложений
        count: Количество предложений
    
    Returns:
        Список случайных предложений
    """
    result = await db.execute(
        select(Sentence)
        .where(Sentence.language == language, Sentence.is_active == True)
        .order_by(func.random())
        .limit(count)
    )
    sentences = result.scalars().all()
    return list(sentences)
