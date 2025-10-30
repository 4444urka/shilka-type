"""
Тесты для endpoints тем (themes)
"""
import pytest
import json

from src.theme.models import Theme
from src.auth.models import User
from src.auth.utils import get_password_hash


@pytest.mark.asyncio
async def test_create_theme_requires_authentication(client):
    payload = {"name": "My Theme", "theme_data": {"colors": {"bg": "#fff"}}, "is_public": True}
    response = await client.post("/themes/", json=payload)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_and_get_public_themes(authenticated_client, client, db_session):
    # Создаём публичную тему
    payload = {"name": "Public Theme", "theme_data": {"colors": {"bg": "#000"}}, "is_public": True}
    response = await authenticated_client.post("/themes/", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Public Theme"
    assert data["is_public"] is True
    assert "id" in data

    # Список публичных тем доступен без авторизации
    response = await client.get("/themes/")
    assert response.status_code == 200
    themes = response.json()
    assert any(t["name"] == "Public Theme" for t in themes)


@pytest.mark.asyncio
async def test_get_my_themes(authenticated_client):
    # По умолчанию authenticated_client имеет тестового пользователя и может создавать тему
    payload = {"name": "My Theme", "theme_data": {"a": 1}, "is_public": False}
    r = await authenticated_client.post("/themes/", json=payload)
    assert r.status_code == 200

    # Получаем темы текущего пользователя
    r2 = await authenticated_client.get("/themes/my")
    assert r2.status_code == 200
    data = r2.json()
    assert any(t["name"] == "My Theme" for t in data)


@pytest.mark.asyncio
async def test_select_and_get_selected(authenticated_client):
    # Создаём публичную тему и выбираем её
    payload = {"name": "Selectable Theme", "theme_data": {"x": 1}, "is_public": True}
    r = await authenticated_client.post("/themes/", json=payload)
    assert r.status_code == 200
    theme = r.json()

    # Выбираем тему
    r2 = await authenticated_client.put(f"/themes/select/{theme['id']}")
    assert r2.status_code == 200

    # Проверяем выбранную тему
    r3 = await authenticated_client.get("/themes/selected")
    assert r3.status_code == 200
    sel = r3.json()
    assert sel is not None
    assert sel["id"] == theme["id"]


@pytest.mark.asyncio
async def test_select_private_theme_forbidden(client, authenticated_client, db_session):
    # Создаём другого пользователя
    other = User(username="otheruser", hashed_password=get_password_hash("otherpass"))
    db_session.add(other)
    await db_session.commit()
    await db_session.refresh(other)

    # Добавляем приватную тему от другого пользователя напрямую в БД
    theme = Theme(name="Private Other", author_id=other.id, theme_data=json.dumps({"a":1}), is_public=False)
    db_session.add(theme)
    await db_session.commit()
    await db_session.refresh(theme)

    # Текущий authenticated_client (testuser) должен получить 403 при попытке выбрать приватную тему другого
    r = await authenticated_client.put(f"/themes/select/{theme.id}")
    assert r.status_code == 403
