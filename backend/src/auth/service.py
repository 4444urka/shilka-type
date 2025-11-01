from datetime import timedelta
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException, status

from . import models
from . import utils
from .schemas import UserCreate


async def register_user(user: UserCreate, db: AsyncSession):
    """Зарегистрировать нового пользователя. В случае ошибки вызывает HTTPException."""
    # Проверяем существование пользователя
    result = await db.execute(
        select(models.User).filter(models.User.username == user.username)
    )
    db_user = result.scalar_one_or_none()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    try:
        hashed_password = utils.get_password_hash(user.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        shilka_coins=0,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def authenticate_user(username: str, password: str, db: AsyncSession) -> Optional[models.User]:
    """Authenticate user by username and password. Returns user or None."""
    result = await db.execute(
        select(models.User).filter(models.User.username == username)
    )
    user = result.scalar_one_or_none()
    if not user:
        return None
    if not utils.verify_password(password, user.hashed_password):
        return None
    return user


def create_access_token_for_user(user: models.User, expires_minutes: int = utils.ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    expires = timedelta(minutes=expires_minutes)
    return utils.create_access_token(data={"sub": user.username}, expires_delta=expires)
