"""
Тесты для утилит аутентификации
"""
import pytest
from datetime import timedelta
from jose import jwt

from src.auth.utils import (
    verify_password,
    get_password_hash,
    create_access_token,
    SECRET_KEY,
    ALGORITHM,
)


class TestPasswordHashing:
    """Тесты хеширования паролей"""
    
    def test_password_hash_and_verify(self):
        """Проверка хеширования и верификации пароля"""
        password = "testpassword123"
        hashed = get_password_hash(password)
        
        # Хеш не должен совпадать с оригинальным паролем
        assert hashed != password
        # Верификация должна пройти успешно
        assert verify_password(password, hashed) is True
    
    def test_wrong_password_verification(self):
        """Проверка что неправильный пароль не проходит верификацию"""
        password = "correct"
        hashed = get_password_hash(password)
        
        assert verify_password("wrong", hashed) is False
    
    def test_different_hashes_for_same_password(self):
        """Проверка что одинаковые пароли дают разные хеши (salt)"""
        password = "samepassword"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        assert hash1 != hash2
        # Но оба должны проходить верификацию
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestTokenCreation:
    """Тесты создания JWT токенов"""
    
    def test_create_access_token(self):
        """Создание access token"""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        # Токен должен быть строкой
        assert isinstance(token, str)
        # Токен должен декодироваться
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert decoded["sub"] == "testuser"
        assert "exp" in decoded
    
    def test_create_token_with_custom_expiry(self):
        """Создание токена с кастомным временем истечения"""
        data = {"sub": "testuser"}
        expires_delta = timedelta(minutes=15)
        token = create_access_token(data, expires_delta)
        
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert decoded["sub"] == "testuser"
    
    def test_token_contains_expiry(self):
        """Проверка что токен содержит время истечения"""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert "exp" in decoded
        # exp должно быть числом (timestamp)
        assert isinstance(decoded["exp"], (int, float))
