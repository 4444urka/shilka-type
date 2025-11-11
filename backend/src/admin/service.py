from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from fastapi import HTTPException, status

from ..auth.models import User
from ..stats.models import TypingSession, CoinTransaction
from ..theme.models import Theme
from ..stats.service import broadcast_leaderboard_update
from ..redis_client import redis_client
from .schemas import UserAdminUpdate


async def get_user_by_id(db: AsyncSession, user_id: int) -> User:
    """Получить пользователя по ID"""
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    return user


async def update_user_coins(db: AsyncSession, user_id: int, amount: int) -> User:
    """Добавить или вычесть монеты пользователю"""
    user = await get_user_by_id(db, user_id)
    if getattr(user, "shilka_coins", None) is None:
        user.shilka_coins = 0
    user.shilka_coins += amount
    if user.shilka_coins < 0:
        user.shilka_coins = 0  # Не допускаем отрицательный баланс
    await db.commit()
    await db.refresh(user)
    
    # Инвалидируем кэш лидерборда
    await redis_client.invalidate_pattern("fastapi-cache:get_leaderboard*")
    
    # Отправляем обновление через WebSocket
    await broadcast_leaderboard_update(db)
    
    return user


async def update_user(db: AsyncSession, user_id: int, update_data: UserAdminUpdate) -> User:
    """Обновить данные пользователя"""
    user = await get_user_by_id(db, user_id)
    
    update_dict = update_data.model_dump(exclude_unset=True)
    
    # Проверка уникальности username
    if "username" in update_dict and update_dict["username"] != user.username:
        result = await db.execute(
            select(User).filter(User.username == update_dict["username"])
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
    
    # Проверка уникальности email — только если поле email есть в модели
    if "email" in update_dict:
        if hasattr(user, "email"):
            if update_dict["email"] != getattr(user, "email", None):
                result = await db.execute(
                    select(User).filter(getattr(User, "email") == update_dict["email"])
                )
                if result.scalar_one_or_none():
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Email already exists"
                    )
        else:
            # Модель пользователя не поддерживает email — игнорируем обновление
            update_dict.pop("email", None)
    
    # Map `coins` update to `shilka_coins` ORM field if present
    if "coins" in update_dict:
        user.shilka_coins = update_dict.pop("coins")

    for key, value in update_dict.items():
        # Only set attributes that exist on the model
        if hasattr(user, key):
            setattr(user, key, value)
    
    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: int) -> None:
    """Удалить пользователя"""
    user = await get_user_by_id(db, user_id)
    # Удаляем зависимые записи вручную, чтобы не попытаться обнулить обязательные FK
    # Сначала транзакции монет, затем сессии набора
    await db.execute(delete(CoinTransaction).where(CoinTransaction.user_id == user_id))
    await db.execute(delete(TypingSession).where(TypingSession.user_id == user_id))

    # Удаляем/обнуляем связанные темы: сначала снимаем ссылку selected_theme_id у пользователей,
    # у которых выбрана тема, принадлежащая удаляемому пользователю, затем удаляем сами темы.
    try:
        result = await db.execute(select(Theme.id).where(Theme.author_id == user_id))
        theme_ids = result.scalars().all()
        if theme_ids:
            # Обнуляем selected_theme_id у пользователей, которые ссылаются на эти темы
            await db.execute(
                update(User)
                .where(User.selected_theme_id.in_(theme_ids))
                .values({"selected_theme_id": None})
            )
            # Удаляем сами темы
            await db.execute(delete(Theme).where(Theme.author_id == user_id))
    except Exception:
        # Не критично — продолжим и вернём понятную ошибку ниже, если коммит упадёт
        pass

    await db.delete(user)
    try:
        await db.commit()
        
        # Инвалидируем кэш лидерборда
        await redis_client.invalidate_pattern("fastapi-cache:get_leaderboard*")
        
        # Отправляем обновление через WebSocket
        await broadcast_leaderboard_update(db)
        
    except Exception as e:
        # Возвращаем понятную ошибку вместо 500 с сырым стектрейсом
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


async def get_all_users(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Получить список всех пользователей"""
    result = await db.execute(
        select(User)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


async def delete_session(db: AsyncSession, session_id: int) -> None:
    """Удалить игровую сессию"""
    result = await db.execute(
        select(TypingSession).filter(TypingSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found"
        )
    await db.delete(session)
    await db.commit()


async def get_all_sessions(db: AsyncSession, skip: int = 0, limit: int = 100):
    """Получить список всех сессий"""
    result = await db.execute(
        select(TypingSession)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
