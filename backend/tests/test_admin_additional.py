"""
Дополнительные тесты для admin endpoints
"""

import json

import pytest

from src.auth.models import User
from src.auth.utils import get_password_hash
from src.stats.models import TypingSession


class TestAdminGetUsers:
    """Тесты получения списка пользователей"""

    @pytest.mark.asyncio
    async def test_get_all_users_requires_admin(self, authenticated_client):
        """Получение списка пользователей требует прав администратора"""
        response = await authenticated_client.get("/admin/users")
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_get_all_users_unauthenticated(self, client):
        """Получение списка пользователей без авторизации"""
        response = await client.get("/admin/users")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_all_users_as_admin(self, admin_client, db_session):
        """Успешное получение списка пользователей администратором"""
        # Создаём дополнительных пользователей
        users = [
            User(
                username=f"user{i}",
                hashed_password=get_password_hash("pass123"),
                shilka_coins=i * 10,
            )
            for i in range(5)
        ]
        for user in users:
            db_session.add(user)
        await db_session.commit()

        response = await admin_client.get("/admin/users")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Должны быть минимум 5 созданных + admin
        assert len(data) >= 5

    @pytest.mark.asyncio
    async def test_get_all_users_with_pagination(self, admin_client, db_session):
        """Получение пользователей с пагинацией"""
        # Создаём пользователей
        users = [
            User(
                username=f"paguser{i}",
                hashed_password=get_password_hash("pass123"),
                shilka_coins=100,
            )
            for i in range(10)
        ]
        for user in users:
            db_session.add(user)
        await db_session.commit()

        response = await admin_client.get("/admin/users?skip=0&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5

    @pytest.mark.asyncio
    async def test_get_all_users_skip(self, admin_client, db_session):
        """Получение пользователей с пропуском"""
        response = await admin_client.get("/admin/users?skip=1000")
        assert response.status_code == 200
        data = response.json()
        # При большом skip список будет пустым или очень маленьким
        assert isinstance(data, list)


class TestAdminGetUser:
    """Тесты получения пользователя по ID"""

    @pytest.mark.asyncio
    async def test_get_user_by_id_requires_admin(self, authenticated_client, test_user):
        """Получение пользователя по ID требует прав администратора"""
        response = await authenticated_client.get(f"/admin/users/{test_user.id}")
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_get_user_by_id_unauthenticated(self, client):
        """Получение пользователя без авторизации"""
        response = await client.get("/admin/users/1")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_user_by_id_as_admin(self, admin_client, db_session):
        """Успешное получение пользователя по ID администратором"""
        user = User(
            username="targetuser",
            hashed_password=get_password_hash("pass123"),
            shilka_coins=500,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        response = await admin_client.get(f"/admin/users/{user.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "targetuser"
        assert data["shilka_coins"] == 500

    @pytest.mark.asyncio
    async def test_get_user_by_id_not_found(self, admin_client):
        """Получение несуществующего пользователя"""
        response = await admin_client.get("/admin/users/999999")
        assert response.status_code == 404


class TestAdminUpdateUser:
    """Тесты обновления пользователя"""

    @pytest.mark.asyncio
    async def test_update_user_requires_admin(self, authenticated_client, test_user):
        """Обновление пользователя требует прав администратора"""
        response = await authenticated_client.patch(
            f"/admin/users/{test_user.id}", json={"username": "newname"}
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_update_user_unauthenticated(self, client):
        """Обновление пользователя без авторизации"""
        response = await client.patch("/admin/users/1", json={"username": "newname"})
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_update_user_username_as_admin(self, admin_client, db_session):
        """Успешное обновление username администратором"""
        user = User(
            username="oldname",
            hashed_password=get_password_hash("pass123"),
            shilka_coins=100,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        response = await admin_client.patch(
            f"/admin/users/{user.id}", json={"username": "newname"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "newname"

    @pytest.mark.asyncio
    async def test_update_user_coins_as_admin(self, admin_client, db_session):
        """Успешное обновление монет администратором через endpoint /coins"""
        user = User(
            username="coinuser",
            hashed_password=get_password_hash("pass123"),
            shilka_coins=100,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Используем специальный endpoint для добавления монет
        response = await admin_client.post(
            f"/admin/users/{user.id}/coins", json={"amount": 899}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["shilka_coins"] == 999

    @pytest.mark.asyncio
    async def test_update_user_role_as_admin(self, admin_client, db_session):
        """Успешное обновление роли пользователя администратором"""
        user = User(
            username="roleuser",
            hashed_password=get_password_hash("pass123"),
            shilka_coins=100,
            role="user",
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        response = await admin_client.patch(
            f"/admin/users/{user.id}", json={"role": "moder"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "moder"

    @pytest.mark.asyncio
    async def test_update_user_not_found(self, admin_client):
        """Обновление несуществующего пользователя"""
        response = await admin_client.patch(
            "/admin/users/999999", json={"username": "newname"}
        )
        assert response.status_code == 404


class TestAdminDeleteUser:
    """Тесты удаления пользователя"""

    @pytest.mark.asyncio
    async def test_delete_user_requires_admin(self, authenticated_client, db_session):
        """Удаление пользователя требует прав администратора"""
        user = User(
            username="todelete",
            hashed_password=get_password_hash("pass123"),
            shilka_coins=100,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        response = await authenticated_client.delete(f"/admin/users/{user.id}")
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_delete_user_unauthenticated(self, client):
        """Удаление пользователя без авторизации"""
        response = await client.delete("/admin/users/1")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_delete_user_as_admin(self, admin_client, db_session):
        """Успешное удаление пользователя администратором"""
        user = User(
            username="willbedeleted",
            hashed_password=get_password_hash("pass123"),
            shilka_coins=100,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        user_id = user.id

        response = await admin_client.delete(f"/admin/users/{user_id}")
        assert response.status_code == 204

        # Проверяем что пользователь удалён
        response = await admin_client.get(f"/admin/users/{user_id}")
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_user_not_found(self, admin_client):
        """Удаление несуществующего пользователя"""
        response = await admin_client.delete("/admin/users/999999")
        assert response.status_code == 404


class TestAdminAddCoins:
    """Тесты добавления/вычитания монет"""

    @pytest.mark.asyncio
    async def test_add_coins_requires_admin(self, authenticated_client, test_user):
        """Добавление монет требует прав администратора"""
        response = await authenticated_client.post(
            f"/admin/users/{test_user.id}/coins", json={"amount": 100}
        )
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_add_coins_unauthenticated(self, client):
        """Добавление монет без авторизации"""
        response = await client.post("/admin/users/1/coins", json={"amount": 100})
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_add_coins_positive(self, admin_client, db_session):
        """Успешное добавление монет"""
        user = User(
            username="coinreceiver",
            hashed_password=get_password_hash("pass123"),
            shilka_coins=100,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        response = await admin_client.post(
            f"/admin/users/{user.id}/coins", json={"amount": 50}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["shilka_coins"] == 150

    @pytest.mark.asyncio
    async def test_add_coins_negative(self, admin_client, db_session):
        """Успешное вычитание монет"""
        user = User(
            username="coinloser",
            hashed_password=get_password_hash("pass123"),
            shilka_coins=100,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        response = await admin_client.post(
            f"/admin/users/{user.id}/coins", json={"amount": -30}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["shilka_coins"] == 70

    @pytest.mark.asyncio
    async def test_add_coins_user_not_found(self, admin_client):
        """Добавление монет несуществующему пользователю"""
        response = await admin_client.post(
            "/admin/users/999999/coins", json={"amount": 100}
        )
        assert response.status_code == 404


class TestAdminSessions:
    """Тесты управления игровыми сессиями"""

    @pytest.mark.asyncio
    async def test_get_all_sessions_requires_admin(self, authenticated_client):
        """Получение всех сессий требует прав администратора"""
        response = await authenticated_client.get("/admin/sessions")
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_get_all_sessions_unauthenticated(self, client):
        """Получение всех сессий без авторизации"""
        response = await client.get("/admin/sessions")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_all_sessions_as_admin(
        self, admin_client, db_session, admin_user
    ):
        """Успешное получение всех сессий администратором"""
        # Создаём тестовую сессию
        session = TypingSession(
            user_id=admin_user.id,
            words=json.dumps(["test", "words"]),
            history=json.dumps([[{"char": "t", "correct": True, "time": 10}]]),
            duration=30,
            wpm=80,
            accuracy=95.0,
            typing_mode="words",
            language="en",
            test_type="time",
        )
        db_session.add(session)
        await db_session.commit()

        response = await admin_client.get("/admin/sessions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_get_all_sessions_with_pagination(self, admin_client):
        """Получение сессий с пагинацией"""
        response = await admin_client.get("/admin/sessions?skip=0&limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 10

    @pytest.mark.asyncio
    async def test_delete_session_requires_admin(self, authenticated_client):
        """Удаление сессии требует прав администратора"""
        response = await authenticated_client.delete("/admin/sessions/1")
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_delete_session_unauthenticated(self, client):
        """Удаление сессии без авторизации"""
        response = await client.delete("/admin/sessions/1")
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_delete_session_as_admin(self, admin_client, db_session, admin_user):
        """Успешное удаление сессии администратором"""
        session = TypingSession(
            user_id=admin_user.id,
            words=json.dumps(["delete", "me"]),
            history=json.dumps([[{"char": "d", "correct": True, "time": 10}]]),
            duration=20,
            wpm=70,
            accuracy=90.0,
            typing_mode="words",
            language="en",
            test_type="time",
        )
        db_session.add(session)
        await db_session.commit()
        await db_session.refresh(session)
        session_id = session.id

        response = await admin_client.delete(f"/admin/sessions/{session_id}")
        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_delete_session_not_found(self, admin_client):
        """Удаление несуществующей сессии"""
        response = await admin_client.delete("/admin/sessions/999999")
        assert response.status_code == 404


class TestAdminRoleEscalation:
    """Тесты защиты от повышения привилегий"""

    @pytest.mark.asyncio
    async def test_moder_cannot_access_admin_endpoints(self, client, db_session):
        """Модератор не может использовать admin endpoints"""
        moder = User(
            username="moder",
            hashed_password=get_password_hash("moderpass123"),
            shilka_coins=100,
            role="moder",
        )
        db_session.add(moder)
        await db_session.commit()

        # Логинимся как модератор
        response = await client.post(
            "/auth/login", data={"username": "moder", "password": "moderpass123"}
        )
        assert response.status_code == 200

        # Пытаемся получить список пользователей
        response = await client.get("/admin/users")
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_regular_user_cannot_make_themselves_admin(
        self, authenticated_client, test_user
    ):
        """Обычный пользователь не может сделать себя администратором"""
        # Пытаемся обновить свою роль через admin endpoint
        response = await authenticated_client.patch(
            f"/admin/users/{test_user.id}", json={"role": "admin"}
        )
        assert response.status_code == 403
