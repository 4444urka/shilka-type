from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..auth.models import User
from ..auth.utils import get_current_admin
from .schemas import AddCoinsRequest, UserAdminUpdate, UserAdminResponse
from . import service

router = APIRouter(tags=["admin"])


@router.get("/users", response_model=list[UserAdminResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Получить список всех пользователей (только для админов)"""
    users = await service.get_all_users(db, skip, limit)
    return users


@router.get("/users/{user_id}", response_model=UserAdminResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Получить пользователя по ID (только для админов)"""
    user = await service.get_user_by_id(db, user_id)
    return user


@router.patch("/users/{user_id}", response_model=UserAdminResponse)
async def update_user(
    user_id: int,
    update_data: UserAdminUpdate,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Обновить данные пользователя (только для админов)"""
    user = await service.update_user(db, user_id, update_data)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Удалить пользователя (только для админов)"""
    await service.delete_user(db, user_id)


@router.post("/users/{user_id}/coins", response_model=UserAdminResponse)
async def add_coins(
    user_id: int,
    coins_data: AddCoinsRequest,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """
    Добавить или вычесть монеты пользователю (только для админов)
    
    - **amount**: Положительное число для добавления, отрицательное для вычитания
    """
    user = await service.update_user_coins(db, user_id, coins_data.amount)
    return user


@router.get("/sessions")
async def get_all_sessions(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Получить список всех игровых сессий (только для админов)"""
    sessions = await service.get_all_sessions(db, skip, limit)
    return sessions


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Удалить игровую сессию (только для админов)"""
    await service.delete_session(db, session_id)
