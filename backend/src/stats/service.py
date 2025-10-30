import json
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from fastapi_cache.decorator import cache

from ..auth import models as auth_models
from . import models as stats_models
from . import schemas as stats_schemas
from .utils import compute_wpm, compute_accuracy
from ..redis_client import redis_client


async def add_coins(current_user: auth_models.User, amount: int, db: AsyncSession):
    current_user.shilka_coins = (current_user.shilka_coins or 0) + amount
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    await redis_client.invalidate_pattern("fastapi-cache:get_leaderboard*")
    return current_user


async def get_leaderboard(db: AsyncSession):
    result = await db.execute(
        select(auth_models.User)
        .order_by(
            func.coalesce(auth_models.User.shilka_coins, 0).desc(),
            auth_models.User.id.asc(),
        )
    )
    users = result.scalars().all()
    return users


async def create_typing_session(current_user: auth_models.User, payload: stats_schemas.WordHistoryPayload, db: AsyncSession):
    # use stat utility functions instead of methods on the schema
    wpm = compute_wpm(payload.words, payload.history, payload.duration, payload.wpm)
    accuracy = compute_accuracy(payload.history, payload.accuracy)

    words_json = json.dumps(payload.words)
    history_json = json.dumps([
        [{"char": c.char, "correct": c.correct, "time": c.time} for c in word]
        for word in payload.history
    ])

    typing_session = stats_models.TypingSession(
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

    await redis_client.invalidate_pattern(f"fastapi-cache:get_typing_sessions*")
    await redis_client.invalidate_pattern(f"fastapi-cache:get_char_error_stats*")

    return typing_session


async def get_typing_sessions(current_user: auth_models.User, db: AsyncSession, limit: int = 10):
    result = await db.execute(
        select(stats_models.TypingSession)
        .filter(stats_models.TypingSession.user_id == current_user.id)
        .filter(stats_models.TypingSession.wpm > 0)
        .order_by(stats_models.TypingSession.created_at.desc())
        .limit(limit)
    )
    sessions = result.scalars().all()
    return sessions


async def get_char_error_stats(current_user: auth_models.User, db: AsyncSession):
    result = await db.execute(
        select(stats_models.TypingSession)
        .filter(stats_models.TypingSession.user_id == current_user.id)
    )
    sessions = result.scalars().all()

    char_stats = {}
    for session in sessions:
        if not session.history:
            continue
        try:
            history = json.loads(session.history)
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

    result_list = []
    for char, stats in char_stats.items():
        total = stats["total"]
        errors = stats["errors"]
        if total == 0:
            continue
        error_rate = (errors / total * 100)
        if error_rate == 100.0:
            continue
        result_list.append({
            "char": char,
            "error_rate": round(error_rate, 2),
            "total_typed": total,
            "errors": errors,
        })

    result_list.sort(key=lambda x: x["error_rate"], reverse=True)
    return result_list
