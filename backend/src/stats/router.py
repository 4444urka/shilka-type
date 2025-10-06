import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.auth import utils as auth_utils, models as auth_models, schemas as auth_schemas

from src.stats import models, schemas, utils

from ..database import get_db


router = APIRouter()

@router.post("/add-coins", response_model=auth_schemas.UserPublic)
def add_coins(
    payload: schemas.AddCoinsRequest,
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    current_user.shilka_coins = (current_user.shilka_coins or 0) + payload.amount
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/leaderboard", response_model=list[auth_schemas.UserPublic])
def get_leaderboard(db: Session = Depends(get_db)):
    users = (
        db.query(auth_models.User)
        .order_by(
            func.coalesce(auth_models.User.shilka_coins, 0).desc(),
            auth_models.User.id.asc(),
        )
        .all()
    )
    return users


@router.post("/typing-session", response_model=schemas.TypingSessionResponse)
def post_typing_session(
    payload: schemas.WordHistoryPayload,
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    
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
    )
    
    db.add(typing_session)
    db.commit()
    db.refresh(typing_session)
    
    return schemas.TypingSessionResponse(
        id=typing_session.id,
        wpm=typing_session.wpm,
        accuracy=typing_session.accuracy,
        duration=typing_session.duration,
        typing_mode=typing_session.typing_mode,
        language=typing_session.language,
        created_at=typing_session.created_at.isoformat(),
    )


@router.get("/typing-sessions", response_model=list[schemas.TypingSessionResponse])
def get_typing_sessions(
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10,
):
    """Получить последние сессии набора текущего пользователя."""
    sessions = (
        db.query(models.TypingSession)
        .filter(models.TypingSession.user_id == current_user.id)
        .filter(models.TypingSession.wpm > 0)
        .order_by(models.TypingSession.created_at.desc())
        .limit(limit)
        .all()
    )
    
    return [
        schemas.TypingSessionResponse(
            id=session.id,
            wpm=session.wpm,
            accuracy=session.accuracy,
            duration=session.duration,
            typing_mode=session.typing_mode,
            language=session.language,
            created_at=session.created_at.isoformat(),
        )
        for session in sessions
    ]


@router.get("/char-errors", response_model=list[schemas.CharErrorStat])
def get_char_error_stats(
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    """Получить статистику ошибок по символам, отсортированную по % ошибок (убывание)."""
    # Получаем все сессии пользователя
    sessions = (
        db.query(models.TypingSession)
        .filter(models.TypingSession.user_id == current_user.id)
        .all()
    )
    
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