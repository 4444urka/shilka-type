import json
import pytest

from src.stats import utils as stats_utils
from src.stats import models as stats_models
from src.auth import models as auth_models


def test_compute_reward_from_history_simple():
    # 3 правильных, 1 неправильный => дельта = 2
    history = [
        [
            {"char": "a", "correct": True, "time": 10},
            {"char": "b", "correct": True, "time": 12},
        ],
        [
            {"char": "c", "correct": True, "time": 5},
            {"char": "d", "correct": False, "time": 6},
        ],
    ]

    delta = stats_utils.compute_reward_from_history(history)
    assert delta == 2


@pytest.mark.asyncio
async def test_create_typing_session_awards_coins(client, db_session, authenticated_client, test_user):
    # начальный баланс задаётся в фикстуре как 100
    payload = {
        "words": ["ab", "cd"],
        "history": [
            [{"char": "a", "correct": True, "time": 10}, {"char": "b", "correct": True, "time": 12}],
            [{"char": "c", "correct": True, "time": 5}, {"char": "d", "correct": False, "time": 6}],
        ],
        "duration": 60,
        "wpm": None,
        "accuracy": None,
        "mode": "words",
        "language": "en",
        "testType": "time",
    }

    resp = await client.post("/stats/typing-session", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert "id" in body

    # Проверяем, что запись typing_session создана
    session_id = int(body["id"]) if isinstance(body["id"], str) else body["id"]
    result = await db_session.execute(
        stats_models.TypingSession.__table__.select().where(stats_models.TypingSession.id == session_id)
    )
    row = result.first()
    assert row is not None

    # вычисляем ожидаемую дельту: 3 правильных, 1 неправильный => +2
    expected_delta = 2

    # Проверяем, что создана транзакция начисления монет
    result_tx = await db_session.execute(
        stats_models.CoinTransaction.__table__.select().where(stats_models.CoinTransaction.typing_session_id == session_id)
    )
    tx = result_tx.first()
    assert tx is not None
    # сохранённая сумма соответствует применённой дельте
    assert tx._mapping["amount"] == expected_delta

    # Проверяем, что баланс пользователя обновлён
    result_user = await db_session.execute(
        auth_models.User.__table__.select().where(auth_models.User.id == test_user.id)
    )
    user_row = result_user.first()
    assert user_row is not None
    new_balance = user_row._mapping["shilka_coins"]
    assert new_balance == 100 + expected_delta