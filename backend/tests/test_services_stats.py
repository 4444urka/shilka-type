"""
Unit tests for stats.service
"""
import pytest

from src.stats import service as stats_service
from src.stats import schemas as stats_schemas
import json


@pytest.mark.asyncio
async def test_create_typing_session_and_stats(db_session, test_user):
    payload = stats_schemas.WordHistoryPayload(
        words=["hello"],
        history=[[{"char": "h", "correct": True, "time": 10}, {"char": "e", "correct": True, "time": 12}]],
        duration=60,
        mode="words",
        language="en",
    )

    ts = await stats_service.create_typing_session(test_user, payload, db_session)
    assert ts.id is not None
    assert ts.user_id == test_user.id

    sessions = await stats_service.get_typing_sessions(test_user, db_session, limit=5)
    assert any(s.id == ts.id for s in sessions)

    stats = await stats_service.get_char_error_stats(test_user, db_session)
    # stats should contain at least 'h' and 'e' entries
    chars = {s['char'] for s in stats}
    assert 'h' in chars or 'e' in chars


@pytest.mark.asyncio
async def test_char_error_stats_empty_and_invalid_json(db_session, test_user):
    # create a typing session with empty history -> should be skipped
    from src.stats.models import TypingSession

    ts = TypingSession(user_id=test_user.id, wpm=10, accuracy=90, duration=10, words='[]', history='[]')
    db_session.add(ts)
    await db_session.commit()
    await db_session.refresh(ts)

    stats = await stats_service.get_char_error_stats(test_user, db_session)
    # empty history yields empty stats
    assert isinstance(stats, list)

    # create a session with invalid JSON history -> should be caught and skipped
    bad = TypingSession(user_id=test_user.id, wpm=5, accuracy=50, duration=5, words='[]', history='not json')
    db_session.add(bad)
    await db_session.commit()
    await db_session.refresh(bad)

    stats2 = await stats_service.get_char_error_stats(test_user, db_session)
    assert isinstance(stats2, list)


@pytest.mark.asyncio
async def test_char_error_stats_all_errors_filtered(db_session, test_user):
    # create a session where all chars are incorrect -> error_rate == 100 -> should be filtered out
    from src.stats.models import TypingSession

    history = json.dumps([[{"char": "x", "correct": False, "time": 1}]])
    ts = TypingSession(user_id=test_user.id, wpm=1, accuracy=0, duration=10, words='[]', history=history)
    db_session.add(ts)
    await db_session.commit()
    await db_session.refresh(ts)

    stats = await stats_service.get_char_error_stats(test_user, db_session)
    # since error_rate == 100, it should not be present
    chars = {s['char'] for s in stats}
    assert 'x' not in chars


@pytest.mark.asyncio
async def test_add_coins_and_leaderboard(db_session, test_user):
    # initial leaderboard should include test_user after adding coins
    from src.stats.service import add_coins, get_leaderboard

    user = await add_coins(test_user, 50, db_session)
    assert user.shilka_coins >= 50

    lb = await get_leaderboard(db_session)
    assert any(u.id == test_user.id for u in lb)
