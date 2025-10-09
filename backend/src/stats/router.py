import json
from fastapi import APIRouter, Depends
from fastapi_cache.decorator import cache
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from src.auth import utils as auth_utils, models as auth_models, schemas as auth_schemas

from src.stats import models, schemas

from ..database import get_db
from ..redis_client import redis_client


router = APIRouter()


@router.post("/add-coins", response_model=auth_schemas.UserPublic)
async def add_coins(
    payload: schemas.AddCoinsRequest,
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Добавить монеты пользователю"""
    current_user.shilka_coins = (current_user.shilka_coins or 0) + payload.amount
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    
    # Инвалидация кэша leaderboard при изменении монет
    await redis_client.invalidate_pattern("fastapi-cache:get_leaderboard*")
    
    return current_user


@router.get("/leaderboard", response_model=list[auth_schemas.UserPublic])
@cache(expire=60)  # Кэширование на 60 секунд
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    """Получить таблицу лидеров по монетам (кэшируется на 60 сек)"""
    result = await db.execute(
        select(auth_models.User)
        .order_by(
            func.coalesce(auth_models.User.shilka_coins, 0).desc(),
            auth_models.User.id.asc(),
        )
    )
    users = result.scalars().all()
    return users


@router.post("/typing-session", response_model=schemas.TypingSessionResponse)
async def post_typing_session(
    payload: schemas.WordHistoryPayload,
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    
    # Логируем полученные данные для отладки
    print(f"Received payload: mode={payload.mode}, language={payload.language}, test_type={payload.test_type}")
    
    # Получаем метрики (приоритет у значений с фронтенда)
    wpm = payload.calculate_wpm()
    accuracy = payload.calculate_accuracy()
    
    # Логируем источник данных для отладки
    if payload.wpm is not None:
        print(f"Using WPM from frontend: {payload.wpm}")
    else:
        print(f"Calculated WPM on backend: {wpm}")
        
    if payload.accuracy is not None:
        print(f"Using accuracy from frontend: {payload.accuracy}")
    else:
        print(f"Calculated accuracy on backend: {accuracy}")
    
    # Сериализуем данные для хранения
    words_json = json.dumps(payload.words)
    history_json = json.dumps([
        [{"char": c.char, "correct": c.correct, "time": c.time} for c in word]
        for word in payload.history
    ])
    
    # Создаём запись сессии
    typing_session = models.TypingSession(
        user_id=current_user.id,
        wpm=wpm,
        accuracy=accuracy,
        duration=payload.duration,
        words=words_json,
        history=history_json,
        typing_mode=payload.mode,
        language=payload.language,
        test_type=payload.test_type,
    )
    
    db.add(typing_session)
    await db.commit()
    await db.refresh(typing_session)
    
    # Инвалидация кэша при добавлении новой сессии
    await redis_client.invalidate_pattern(f"fastapi-cache:get_typing_sessions*")
    await redis_client.invalidate_pattern(f"fastapi-cache:get_char_error_stats*")
    
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
    result = await db.execute(
        select(models.TypingSession)
        .filter(models.TypingSession.user_id == current_user.id)
        .filter(models.TypingSession.wpm > 0)
        .order_by(models.TypingSession.created_at.desc())
        .limit(limit)
    )
    sessions = result.scalars().all()
    
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
    result = await db.execute(
        select(models.TypingSession)
        .filter(models.TypingSession.user_id == current_user.id)
    )
    sessions = result.scalars().all()
    
    # Словарь для подсчёта статистики по каждому символу
    # char -> {"total": int, "errors": int}
    char_stats = {}
    
    for session in sessions:
        if not session.history:
            continue
        
        try:
            history = json.loads(session.history)
            
            # Проходим по каждому слову в истории
            for word in history:
                for char_data in word:
                    char = char_data.get("char", "")
                    correct = char_data.get("correct", True)
                    
                    if not char:
                        continue
                    
                    if char not in char_stats:
                        char_stats[char] = {"total": 0, "errors": 0}
                    
                    char_stats[char]["total"] += 1
                    if not correct:
                        char_stats[char]["errors"] += 1
        except (json.JSONDecodeError, KeyError, TypeError):
            continue
    
    # Формируем результат со статистикой
    result = []
    for char, stats in char_stats.items():
        total = stats["total"]
        errors = stats["errors"]
        
        # Пропускаем символы, которые не были напечатаны
        if total == 0:
            continue
        
        error_rate = (errors / total * 100)
        
        if error_rate == 100.0:
            continue
        
        result.append(
            schemas.CharErrorStat(
                char=char,
                error_rate=round(error_rate, 2),
                total_typed=total,
                errors=errors,
            )
        )
    
    # Сортируем по проценту ошибок (убывание)
    result.sort(key=lambda x: x.error_rate, reverse=True)
    
    return result