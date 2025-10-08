"""
Тесты для моделей базы данных
"""
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from src.auth.models import User
from src.auth.utils import get_password_hash


class TestUserModel:
    """Тесты модели User"""
    
    @pytest.mark.asyncio
    async def test_create_user(self, db_session):
        """Создание пользователя в БД"""
        user = User(
            username="testuser",
            hashed_password=get_password_hash("password"),
            shilka_coins=0
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        assert user.id is not None
        assert user.username == "testuser"
        assert user.shilka_coins == 0
    
    @pytest.mark.asyncio
    async def test_user_unique_username(self, db_session):
        """Проверка уникальности username"""
        user1 = User(
            username="duplicate",
            hashed_password=get_password_hash("pass1"),
            shilka_coins=0
        )
        db_session.add(user1)
        await db_session.commit()
        
        user2 = User(
            username="duplicate",
            hashed_password=get_password_hash("pass2"),
            shilka_coins=0
        )
        db_session.add(user2)
        
        # Должна быть ошибка при commit из-за unique constraint
        with pytest.raises(IntegrityError):
            await db_session.commit()
    
    @pytest.mark.asyncio
    async def test_user_default_shilka_coins(self, db_session):
        """Проверка что shilka_coins может быть 0"""
        user = User(
            username="newuser",
            hashed_password=get_password_hash("password"),
            shilka_coins=0
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
        assert user.shilka_coins == 0
    
    @pytest.mark.asyncio
    async def test_update_shilka_coins(self, db_session, test_user):
        """Обновление shilka_coins пользователя"""
        assert test_user.shilka_coins == 100
        
        test_user.shilka_coins = 200
        await db_session.commit()
        await db_session.refresh(test_user)
        
        assert test_user.shilka_coins == 200
    
    @pytest.mark.asyncio
    async def test_query_user_by_username(self, db_session, test_user):
        """Поиск пользователя по username"""
        result = await db_session.execute(
            select(User).filter(User.username == "testuser")
        )
        found_user = result.scalar_one_or_none()
        
        assert found_user is not None
        assert found_user.id == test_user.id
        assert found_user.username == test_user.username
    
    @pytest.mark.asyncio
    async def test_query_nonexistent_user(self, db_session):
        """Поиск несуществующего пользователя"""
        result = await db_session.execute(
            select(User).filter(User.username == "nonexistent")
        )
        found_user = result.scalar_one_or_none()
        
        assert found_user is None
