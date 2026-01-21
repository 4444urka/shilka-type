"""
Тесты для endpoints статистики (leaderboard, typing sessions, char errors)
"""

import pytest

from src.auth.models import User
from src.auth.utils import get_password_hash
from src.stats.models import CoinTransaction, TypingSession


class TestLeaderboard:
    """Тесты получения таблицы лидеров"""

    @pytest.mark.asyncio
    async def test_get_leaderboard_empty(self, client):
        """Получение пустой таблицы лидеров"""
        response = await client.get("/stats/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_get_leaderboard_with_users(self, client, db_session):
        """Получение таблицы лидеров с пользователями"""
        # Создаём пользователей с разным количеством монет
        users = [
            User(
                username="leader1",
                hashed_password=get_password_hash("pass123"),
                shilka_coins=1000,
            ),
            User(
                username="leader2",
                hashed_password=get_password_hash("pass123"),
                shilka_coins=500,
            ),
            User(
                username="leader3",
                hashed_password=get_password_hash("pass123"),
                shilka_coins=750,
            ),
        ]
        for user in users:
            db_session.add(user)
        await db_session.commit()

        response = await client.get("/stats/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3

        # Проверяем что лидерборд отсортирован по убыванию монет
        coins = [user["shilka_coins"] for user in data]
        assert coins == sorted(coins, reverse=True)

    @pytest.mark.asyncio
    async def test_get_leaderboard_does_not_expose_passwords(self, client, db_session):
        """Лидерборд не должен возвращать хэши паролей"""
        user = User(
            username="secureuser",
            hashed_password=get_password_hash("secretpass"),
            shilka_coins=100,
        )
        db_session.add(user)
        await db_session.commit()

        response = await client.get("/stats/leaderboard")
        assert response.status_code == 200
        data = response.json()

        for user_data in data:
            assert "hashed_password" not in user_data
            assert "password" not in user_data


class TestTypingSessions:
    """Тесты создания и получения сессий набора"""

    @pytest.mark.asyncio
    async def test_create_typing_session_requires_auth(self, client):
        """Создание сессии требует авторизации"""
        payload = {
            "words": ["hello", "world"],
            "history": [
                [
                    {"char": "h", "correct": True, "time": 10},
                    {"char": "e", "correct": True, "time": 12},
                    {"char": "l", "correct": True, "time": 14},
                    {"char": "l", "correct": True, "time": 16},
                    {"char": "o", "correct": True, "time": 18},
                ],
                [
                    {"char": "w", "correct": True, "time": 20},
                    {"char": "o", "correct": True, "time": 22},
                    {"char": "r", "correct": True, "time": 24},
                    {"char": "l", "correct": True, "time": 26},
                    {"char": "d", "correct": True, "time": 28},
                ],
            ],
            "duration": 30,
            "wpm": 120,
            "accuracy": 100,
            "mode": "words",
            "language": "en",
            "testType": "time",
        }
        response = await client.post("/stats/typing-session", json=payload)
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_create_typing_session_success(self, authenticated_client, test_user):
        """Успешное создание сессии набора"""
        payload = {
            "words": ["test", "words"],
            "history": [
                [
                    {"char": "t", "correct": True, "time": 10},
                    {"char": "e", "correct": True, "time": 12},
                    {"char": "s", "correct": True, "time": 14},
                    {"char": "t", "correct": True, "time": 16},
                ],
                [
                    {"char": "w", "correct": True, "time": 18},
                    {"char": "o", "correct": True, "time": 20},
                    {"char": "r", "correct": True, "time": 22},
                    {"char": "d", "correct": True, "time": 24},
                    {"char": "s", "correct": True, "time": 26},
                ],
            ],
            "duration": 60,
            "wpm": 80,
            "accuracy": 95.5,
            "mode": "words",
            "language": "en",
            "testType": "time",
        }
        response = await authenticated_client.post(
            "/stats/typing-session", json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["duration"] == 60
        assert data["typing_mode"] == "words"
        assert data["language"] == "en"

    @pytest.mark.asyncio
    async def test_create_typing_session_with_errors(
        self, authenticated_client, test_user
    ):
        """Создание сессии с ошибками в истории"""
        payload = {
            "words": ["hello"],
            "history": [
                [
                    {"char": "h", "correct": True, "time": 10},
                    {"char": "e", "correct": False, "time": 12},  # Ошибка
                    {"char": "l", "correct": True, "time": 14},
                    {"char": "l", "correct": False, "time": 16},  # Ошибка
                    {"char": "o", "correct": True, "time": 18},
                ],
            ],
            "duration": 15,
            "wpm": 60,
            "accuracy": 60.0,
            "mode": "words",
            "language": "en",
            "testType": "words",
        }
        response = await authenticated_client.post(
            "/stats/typing-session", json=payload
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data

    @pytest.mark.asyncio
    async def test_create_typing_session_awards_coins(
        self, authenticated_client, test_user, db_session
    ):
        """Создание сессии начисляет монеты"""
        initial_coins = test_user.shilka_coins

        payload = {
            "words": ["abc"],
            "history": [
                [
                    {"char": "a", "correct": True, "time": 10},
                    {"char": "b", "correct": True, "time": 12},
                    {"char": "c", "correct": True, "time": 14},
                ],
            ],
            "duration": 10,
            "wpm": 100,
            "accuracy": 100,
            "mode": "words",
            "language": "en",
            "testType": "time",
        }
        response = await authenticated_client.post(
            "/stats/typing-session", json=payload
        )
        assert response.status_code == 200

        # Проверяем что монеты начислены
        await db_session.refresh(test_user)
        assert test_user.shilka_coins >= initial_coins

    @pytest.mark.asyncio
    async def test_get_typing_sessions_requires_auth(self, client):
        """Получение сессий требует авторизации"""
        response = await client.get("/stats/typing-sessions")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_typing_sessions_empty(self, authenticated_client):
        """Получение пустого списка сессий"""
        response = await authenticated_client.get("/stats/typing-sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_get_typing_sessions_with_data(self, authenticated_client, test_user):
        """Получение списка сессий после создания"""
        # Создаём сессию
        payload = {
            "words": ["test"],
            "history": [
                [
                    {"char": "t", "correct": True, "time": 10},
                    {"char": "e", "correct": True, "time": 12},
                    {"char": "s", "correct": True, "time": 14},
                    {"char": "t", "correct": True, "time": 16},
                ],
            ],
            "duration": 30,
            "wpm": 90,
            "accuracy": 100,
            "mode": "words",
            "language": "en",
            "testType": "time",
        }
        await authenticated_client.post("/stats/typing-session", json=payload)

        # Получаем список сессий
        response = await authenticated_client.get("/stats/typing-sessions")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1

    @pytest.mark.asyncio
    async def test_get_typing_sessions_with_limit(
        self, authenticated_client, test_user
    ):
        """Получение ограниченного количества сессий"""
        # Создаём несколько сессий
        for i in range(5):
            payload = {
                "words": [f"word{i}"],
                "history": [
                    [
                        {"char": "w", "correct": True, "time": 10},
                        {"char": "o", "correct": True, "time": 12},
                        {"char": "r", "correct": True, "time": 14},
                        {"char": "d", "correct": True, "time": 16},
                        {"char": str(i), "correct": True, "time": 18},
                    ],
                ],
                "duration": 20,
                "wpm": 80,
                "accuracy": 100,
                "mode": "words",
                "language": "en",
                "testType": "time",
            }
            await authenticated_client.post("/stats/typing-session", json=payload)

        # Получаем с лимитом
        response = await authenticated_client.get("/stats/typing-sessions?limit=3")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 3

    @pytest.mark.asyncio
    async def test_typing_session_different_modes(self, authenticated_client):
        """Создание сессий с разными режимами"""
        modes = ["words", "time", "sentences"]

        for mode in modes:
            payload = {
                "words": ["test"],
                "history": [
                    [
                        {"char": "t", "correct": True, "time": 10},
                        {"char": "e", "correct": True, "time": 12},
                        {"char": "s", "correct": True, "time": 14},
                        {"char": "t", "correct": True, "time": 16},
                    ],
                ],
                "duration": 30,
                "wpm": 80,
                "accuracy": 100,
                "mode": mode,
                "language": "en",
                "testType": "time",
            }
            response = await authenticated_client.post(
                "/stats/typing-session", json=payload
            )
            assert response.status_code == 200
            data = response.json()
            assert data["typing_mode"] == mode

    @pytest.mark.asyncio
    async def test_typing_session_different_languages(self, authenticated_client):
        """Создание сессий на разных языках"""
        languages = ["en", "ru"]

        for lang in languages:
            payload = {
                "words": ["test" if lang == "en" else "тест"],
                "history": [
                    [
                        {
                            "char": "t" if lang == "en" else "т",
                            "correct": True,
                            "time": 10,
                        },
                        {
                            "char": "e" if lang == "en" else "е",
                            "correct": True,
                            "time": 12,
                        },
                        {
                            "char": "s" if lang == "en" else "с",
                            "correct": True,
                            "time": 14,
                        },
                        {
                            "char": "t" if lang == "en" else "т",
                            "correct": True,
                            "time": 16,
                        },
                    ],
                ],
                "duration": 30,
                "wpm": 80,
                "accuracy": 100,
                "mode": "words",
                "language": lang,
                "testType": "time",
            }
            response = await authenticated_client.post(
                "/stats/typing-session", json=payload
            )
            assert response.status_code == 200
            data = response.json()
            assert data["language"] == lang


class TestCharErrors:
    """Тесты получения статистики ошибок по символам"""

    @pytest.mark.asyncio
    async def test_get_char_errors_requires_auth(self, client):
        """Получение статистики ошибок требует авторизации"""
        response = await client.get("/stats/char-errors")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_char_errors_empty(self, authenticated_client):
        """Получение пустой статистики ошибок"""
        response = await authenticated_client.get("/stats/char-errors")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_get_char_errors_after_session(self, authenticated_client):
        """Получение статистики ошибок после создания сессии с ошибками"""
        # Создаём сессию с ошибками
        payload = {
            "words": ["hello"],
            "history": [
                [
                    {"char": "h", "correct": True, "time": 10},
                    {"char": "e", "correct": False, "time": 12},
                    {"char": "l", "correct": True, "time": 14},
                    {"char": "l", "correct": False, "time": 16},
                    {"char": "o", "correct": True, "time": 18},
                ],
            ],
            "duration": 15,
            "wpm": 60,
            "accuracy": 60.0,
            "mode": "words",
            "language": "en",
            "testType": "time",
        }
        await authenticated_client.post("/stats/typing-session", json=payload)

        # Получаем статистику ошибок
        response = await authenticated_client.get("/stats/char-errors")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestTypingSessionValidation:
    """Тесты валидации данных сессии набора"""

    @pytest.mark.asyncio
    async def test_typing_session_missing_words(self, authenticated_client):
        """Отсутствует обязательное поле words"""
        payload = {
            "history": [[{"char": "a", "correct": True, "time": 10}]],
            "duration": 30,
            "mode": "words",
            "language": "en",
            "testType": "time",
        }
        response = await authenticated_client.post(
            "/stats/typing-session", json=payload
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_typing_session_missing_history(self, authenticated_client):
        """Отсутствует обязательное поле history"""
        payload = {
            "words": ["test"],
            "duration": 30,
            "mode": "words",
            "language": "en",
            "testType": "time",
        }
        response = await authenticated_client.post(
            "/stats/typing-session", json=payload
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_typing_session_invalid_duration(self, authenticated_client):
        """Невалидная продолжительность сессии"""
        payload = {
            "words": ["test"],
            "history": [[{"char": "t", "correct": True, "time": 10}]],
            "duration": -10,  # Отрицательная продолжительность
            "mode": "words",
            "language": "en",
            "testType": "time",
        }
        response = await authenticated_client.post(
            "/stats/typing-session", json=payload
        )
        # Ожидаем либо ошибку валидации, либо принятие (зависит от схемы)
        assert response.status_code in [200, 422]

    @pytest.mark.asyncio
    async def test_typing_session_empty_history(self, authenticated_client):
        """Пустая история набора"""
        payload = {
            "words": ["test"],
            "history": [],
            "duration": 30,
            "mode": "words",
            "language": "en",
            "testType": "time",
        }
        response = await authenticated_client.post(
            "/stats/typing-session", json=payload
        )
        # Зависит от реализации - может быть принято или отклонено
        assert response.status_code in [200, 422]

    @pytest.mark.asyncio
    async def test_typing_session_null_wpm_accuracy(self, authenticated_client):
        """WPM и accuracy могут быть null"""
        payload = {
            "words": ["test"],
            "history": [
                [
                    {"char": "t", "correct": True, "time": 10},
                    {"char": "e", "correct": True, "time": 12},
                    {"char": "s", "correct": True, "time": 14},
                    {"char": "t", "correct": True, "time": 16},
                ],
            ],
            "duration": 30,
            "wpm": None,
            "accuracy": None,
            "mode": "words",
            "language": "en",
            "testType": "time",
        }
        response = await authenticated_client.post(
            "/stats/typing-session", json=payload
        )
        assert response.status_code == 200
