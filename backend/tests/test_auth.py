"""
Тесты для endpoints аутентификации
"""
import pytest


class TestRegister:
    """Тесты регистрации пользователей"""
    
    def test_register_success(self, client):
        """Успешная регистрация нового пользователя"""
        response = client.post(
            "/auth/register",
            json={"username": "newuser", "password": "newpass123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "newuser"
        assert "id" in data
        assert "shilka_coins" in data
        # hashed_password НЕ должен возвращаться (security!)
        assert "hashed_password" not in data
    
    def test_register_duplicate_username(self, client, test_user):
        """Регистрация с уже существующим username"""
        response = client.post(
            "/auth/register",
            json={"username": "testuser", "password": "validpass123"}
        )
        # API должен вернуть 400, но если пароль слишком короткий - будет 422
        # Поэтому используем валидный пароль (>=8 символов)
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_register_invalid_data(self, client):
        """Регистрация с невалидными данными"""
        response = client.post(
            "/auth/register",
            json={"username": "", "password": ""}
        )
        assert response.status_code == 422


class TestLogin:
    """Тесты входа пользователей"""
    
    def test_login_success(self, client, test_user):
        """Успешный вход существующего пользователя"""
        response = client.post(
            "/auth/login",
            data={"username": "testuser", "password": "testpass123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        # Проверяем что установлена cookie
        assert "access_token" in response.cookies
    
    def test_login_wrong_password(self, client, test_user):
        """Вход с неправильным паролем"""
        response = client.post(
            "/auth/login",
            data={"username": "testuser", "password": "wrongpass"}
        )
        assert response.status_code == 401
        assert "incorrect" in response.json()["detail"].lower()
    
    def test_login_nonexistent_user(self, client):
        """Вход несуществующего пользователя"""
        response = client.post(
            "/auth/login",
            data={"username": "nonexistent", "password": "anypass"}
        )
        assert response.status_code == 401
    
    def test_login_missing_credentials(self, client):
        """Вход без учётных данных"""
        response = client.post("/auth/login", data={})
        assert response.status_code == 422


class TestMe:
    """Тесты получения информации о текущем пользователе"""
    
    def test_me_authenticated(self, authenticated_client, test_user):
        """Получение данных авторизованного пользователя"""
        response = authenticated_client.get("/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testuser"
        assert data["id"] == test_user.id
        assert data["shilka_coins"] == 100
    
    def test_me_unauthenticated(self, client):
        """Получение данных без авторизации"""
        response = client.get("/auth/me")
        assert response.status_code == 401


class TestLogout:
    """Тесты выхода из системы"""
    
    def test_logout_success(self, authenticated_client):
        """Успешный выход из системы"""
        response = authenticated_client.post("/auth/logout")
        assert response.status_code == 200
        assert "logged out" in response.json()["detail"].lower()
        
        # Проверяем что после logout нельзя получить /me
        response = authenticated_client.get("/auth/me")
        assert response.status_code == 401
    
    def test_logout_unauthenticated(self, client):
        """Выход без авторизации (должен работать)"""
        response = client.post("/auth/logout")
        assert response.status_code == 200
