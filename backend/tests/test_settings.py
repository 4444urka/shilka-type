import pytest


from src.auth.models import User


@pytest.mark.asyncio
async def test_update_settings_authenticated(authenticated_client, db_session, test_user):
    """Авторизованный пользователь может обновлять свои настройки"""
    response = await authenticated_client.patch(
        "/auth/settings",
        json={"default_time": 60, "default_language": "ru"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["default_time"] == 60
    assert data["default_language"] == "ru"

    # Проверим напрямую в БД
    refreshed = await db_session.get(User, test_user.id)
    assert refreshed.default_time == 60
    assert refreshed.default_language == "ru"


@pytest.mark.asyncio
async def test_update_settings_unauthenticated(client):
    """Неавторизованный запрос должен получить 401"""
    response = await client.patch("/auth/settings", json={"default_time": 45})
    assert response.status_code == 401
