import json
import logging
from fastapi import APIRouter, Depends, Header, HTTPException, status
import os
from fastapi_cache.decorator import cache
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from src.auth import utils as auth_utils, models as auth_models, schemas as auth_schemas

from src.stats import models, schemas
from src.stats import service as stats_service

from ..database import get_db
from ..redis_client import redis_client


router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/leaderboard", response_model=list[auth_schemas.UserPublic])
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    """Получить таблицу лидеров по монетам (кэшируется на 60 сек)"""
    return await stats_service.get_leaderboard(db)


@router.post("/typing-session", response_model=schemas.TypingSessionResponse)
async def post_typing_session(
    payload: schemas.WordHistoryPayload,
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    
    typing_session = await stats_service.create_typing_session(current_user, payload, db)
    return schemas.TypingSessionResponse(
        id=typing_session.id,
        wpm=typing_session.wpm,
        accuracy=typing_session.accuracy,
        duration=typing_session.duration,
        typing_mode=typing_session.typing_mode,
        language=typing_session.language,
        test_type=typing_session.test_type,
        created_at=typing_session.created_at.isoformat(),
    )


@router.get("/typing-sessions", response_model=list[schemas.TypingSessionResponse])
@cache(expire=30)  # Кэширование на 30 секунд
async def get_typing_sessions(
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 10,
):
    """Получить последние сессии набора текущего пользователя (кэшируется на 30 сек)"""
    sessions = await stats_service.get_typing_sessions(current_user, db, limit)
    return [
        schemas.TypingSessionResponse(
            id=session.id,
            wpm=session.wpm,
            accuracy=session.accuracy,
            duration=session.duration,
            typing_mode=session.typing_mode,
            language=session.language,
            test_type=session.test_type,
            created_at=session.created_at.isoformat(),
        )
        for session in sessions
    ]


@router.get("/char-errors", response_model=list[schemas.CharErrorStat])
@cache(expire=120)  # Кэширование на 120 секунд (2 минуты)
async def get_char_error_stats(
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Получить статистику ошибок по символам (кэшируется на 2 мин)"""
    # Получаем все сессии пользователя
    return await stats_service.get_char_error_stats(current_user, db)