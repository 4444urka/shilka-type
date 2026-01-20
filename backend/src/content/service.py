"""
Сервисный слой для работы с контентом
"""

import logging
from typing import List

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import Sentence, Word
from .utils import clean_text, count_words_in_text, extract_sentences, extract_words

logger = logging.getLogger(__name__)


async def upload_text_content(
    db: AsyncSession, raw_text: str, language: str
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
            select(Word).where(Word.language == language, Word.text == word_text)
        )
        existing = result.scalar_one_or_none()

        if not existing:
            word = Word(language=language, text=word_text, is_active=True)
            db.add(word)
            words_created += 1

    # Извлекаем и сохраняем предложения
    sentences = extract_sentences(cleaned, language)

    for sentence_text in sentences:
        # Проверяем, нет ли уже такого предложения
        result = await db.execute(
            select(Sentence).where(
                Sentence.language == language, Sentence.text == sentence_text
            )
        )
        existing = result.scalar_one_or_none()

        if not existing:
            word_count = count_words_in_text(sentence_text)
            sentence = Sentence(
                language=language,
                text=sentence_text,
                word_count=word_count,
                is_active=True,
            )
            db.add(sentence)
            sentences_created += 1

    await db.commit()
    logger.info(
        f"Created {words_created} words and {sentences_created} sentences for language {language}"
    )

    return (words_created, sentences_created)


async def get_random_words(
    db: AsyncSession, language: str, count: int = 25
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
    db: AsyncSession, language: str, count: int = 10
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


async def get_words_with_chars(
    db: AsyncSession, language: str, chars: List[str], count: int = 25
) -> List[Word]:
    """
    Получает случайные слова, содержащие указанные символы

    Полезно для практики проблемных символов - возвращает слова,
    которые содержат хотя бы один из указанных символов.

    Args:
        db: Async сессия БД
        language: Язык слов
        chars: Список символов для поиска
        count: Количество слов

    Returns:
        Список слов, содержащих указанные символы
    """
    if not chars:
        # Если символы не указаны, возвращаем обычные случайные слова
        return await get_random_words(db, language, count)

    # Создаём фильтры для каждого символа (ILIKE для case-insensitive)
    char_filters = [Word.text.ilike(f"%{char}%") for char in chars]

    result = await db.execute(
        select(Word)
        .where(
            Word.language == language,
            Word.is_active == True,
            or_(*char_filters),  # Слово должно содержать хотя бы один из символов
        )
        .order_by(func.random())
        .limit(count)
    )
    words = result.scalars().all()

    # Если найдено мало слов, дополняем обычными случайными словами
    if len(words) < count:
        remaining = count - len(words)
        existing_ids = {w.id for w in words}

        additional_result = await db.execute(
            select(Word)
            .where(
                Word.language == language,
                Word.is_active == True,
                Word.id.not_in(existing_ids) if existing_ids else True,
            )
            .order_by(func.random())
            .limit(remaining)
        )
        additional_words = additional_result.scalars().all()
        words = list(words) + list(additional_words)

    return list(words)
