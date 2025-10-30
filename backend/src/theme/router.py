from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import json

from ..database import get_db
from ..auth import models as auth_models
from .models import Theme
from ..auth import utils as auth_utils
from .schemas import ThemeCreate, ThemePublic, ThemeInDB
from . import service as theme_service

router = APIRouter()


@router.post("/", response_model=ThemePublic)
async def create_theme(
    theme: ThemeCreate,
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Создание новой темы"""
    db_theme = await theme_service.create_theme(current_user, theme, db)
    return ThemePublic(
        id=db_theme.id,
        name=db_theme.name,
        theme_data=json.loads(db_theme.theme_data),
        is_public=db_theme.is_public,
        author_id=db_theme.author_id,
        author_username=current_user.username,
        created_at=db_theme.created_at.isoformat(),
    )


@router.get("/", response_model=List[ThemePublic])
async def get_public_themes(db: AsyncSession = Depends(get_db)):
    """Получение всех публичных тем"""
    rows = await theme_service.get_public_themes(db)
    themes = []
    for theme, author_username in rows:
        themes.append(ThemePublic(
            id=theme.id,
            name=theme.name,
            theme_data=json.loads(theme.theme_data),
            is_public=theme.is_public,
            author_id=theme.author_id,
            author_username=author_username,
            created_at=theme.created_at.isoformat(),
        ))
    return themes


@router.get("/my", response_model=List[ThemePublic])
async def get_my_themes(
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение тем текущего пользователя"""
    themes_rows = await theme_service.get_my_themes(current_user, db)
    themes = []
    for theme in themes_rows:
        themes.append(ThemePublic(
            id=theme.id,
            name=theme.name,
            theme_data=json.loads(theme.theme_data),
            is_public=theme.is_public,
            author_id=theme.author_id,
            author_username=current_user.username,
            created_at=theme.created_at.isoformat(),
        ))
    return themes


@router.put("/select/{theme_id}")
async def select_theme(
    theme_id: int,
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Выбор темы для текущего пользователя"""
    # Проверяем, существует ли тема и доступна ли она
    await theme_service.select_theme(current_user, theme_id, db)
    return {"detail": "Theme selected successfully"}


@router.get("/selected", response_model=ThemePublic | None)
async def get_selected_theme(
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение выбранной темы текущего пользователя"""
    selected = await theme_service.get_selected_theme(current_user, db)
    if not selected:
        return None
    theme, author_username = selected
    return ThemePublic(
        id=theme.id,
        name=theme.name,
        theme_data=json.loads(theme.theme_data),
        is_public=theme.is_public,
        author_id=theme.author_id,
        author_username=author_username,
        created_at=theme.created_at.isoformat(),
    )