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
        .limit(10)
        .all()
    )
    return users


@router.post("/typing-session", response_model=schemas.TypingSessionResponse)
def post_typing_session(
    payload: schemas.WordHistoryPayload,
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: Session = Depends(get_db),
):
    
    # Вычисляем метрики
    wpm = payload.calculate_wpm()
    accuracy = payload.calculate_accuracy()
    
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
    )
    
    db.add(typing_session)
    db.commit()
    db.refresh(typing_session)
    
    return schemas.TypingSessionResponse(
        id=typing_session.id,
        wpm=typing_session.wpm,
        accuracy=typing_session.accuracy,
        duration=typing_session.duration,
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
            created_at=session.created_at.isoformat(),
        )
        for session in sessions
    ]