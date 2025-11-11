"""
API роутер для управления контентом (слова и предложения)
"""
from typing import Literal
from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..auth.models import User
from ..auth.utils import get_current_admin
from .schemas import (
    TextUploadRequest,
    TextUploadResponse,
    WordResponse,
    SentenceResponse
)
from . import service

router = APIRouter(tags=["content"])


@router.post("/upload", response_model=TextUploadResponse)
async def upload_content(
    payload: TextUploadRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Загрузить сырой текст для обработки и сохранения (только для админов)
    
    Текст будет автоматически:
    - Очищен от лишних символов
    - Нормализован (множественные пробелы -> один пробел)
    - Разбит на слова И предложения одновременно
    - Сохранён в БД (дубликаты игнорируются)
    """
    words_created, sentences_created = await service.upload_text_content(
        db=db,
        raw_text=payload.raw_text,
        language=payload.language
    )
    
    return TextUploadResponse(
        message=f"Successfully processed: {words_created} words, {sentences_created} sentences",
        words_created=words_created,
        sentences_created=sentences_created,
        language=payload.language
    )


@router.get("/words", response_model=list[WordResponse])
async def get_random_words(
    language: Literal["ru", "en"] = Query("en", description="Язык слов"),
    count: int = Query(25, ge=1, le=1000, description="Количество слов"),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить случайные слова для печати
    
    - **language**: Язык слов ('ru' или 'en')
    - **count**: Количество слов (от 1 до 1000, по умолчанию 25)
    """
    words = await service.get_random_words(db, language, count)
    return words


@router.get("/sentences", response_model=list[SentenceResponse])
async def get_random_sentences(
    language: Literal["ru", "en"] = Query("en", description="Язык предложений"),
    count: int = Query(10, ge=1, le=100, description="Количество предложений"),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить случайные предложения для печати
    
    - **language**: Язык предложений ('ru' или 'en')
    - **count**: Количество предложений (от 1 до 100, по умолчанию 10)
    """
    sentences = await service.get_random_sentences(db, language, count)
    return sentences
