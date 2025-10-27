from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import json

from ..database import get_db
from ..auth import models as auth_models
from ..auth import utils as auth_utils
from ..auth.schemas import ThemeCreate, ThemePublic, ThemeInDB

router = APIRouter()


@router.post("/", response_model=ThemePublic)
async def create_theme(
    theme: ThemeCreate,
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Создание новой темы"""
    # Валидация JSON данных темы
    try:
        theme_data_json = json.dumps(theme.theme_data)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid theme data format")
    
    # Создаем тему
    db_theme = auth_models.Theme(
        name=theme.name,
        author_id=current_user.id,
        theme_data=theme_data_json,
        is_public=theme.is_public,
    )
    db.add(db_theme)
    await db.commit()
    await db.refresh(db_theme)
    
    # Возвращаем публичное представление
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
    result = await db.execute(
        select(auth_models.Theme, auth_models.User.username)
        .join(auth_models.User, auth_models.Theme.author_id == auth_models.User.id)
        .where(auth_models.Theme.is_public == True)
    )
    
    themes = []
    for theme, author_username in result:
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
    result = await db.execute(
        select(auth_models.Theme)
        .where(auth_models.Theme.author_id == current_user.id)
    )
    
    themes = []
    for theme in result.scalars():
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
    result = await db.execute(
        select(auth_models.Theme).where(auth_models.Theme.id == theme_id)
    )
    theme = result.scalar_one_or_none()
    
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    
    if not theme.is_public and theme.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Theme is not accessible")
    
    # Обновляем выбранную тему пользователя
    current_user.selected_theme_id = theme_id
    await db.commit()
    
    return {"detail": "Theme selected successfully"}


@router.get("/selected", response_model=ThemePublic | None)
async def get_selected_theme(
    current_user: auth_models.User = Depends(auth_utils.get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение выбранной темы текущего пользователя"""
    if not current_user.selected_theme_id:
        return None
    
    result = await db.execute(
        select(auth_models.Theme, auth_models.User.username)
        .join(auth_models.User, auth_models.Theme.author_id == auth_models.User.id)
        .where(auth_models.Theme.id == current_user.selected_theme_id)
    )
    
    theme_data = result.first()
    if not theme_data:
        return None
    
    theme, author_username = theme_data
    return ThemePublic(
        id=theme.id,
        name=theme.name,
        theme_data=json.loads(theme.theme_data),
        is_public=theme.is_public,
        author_id=theme.author_id,
        author_username=author_username,
        created_at=theme.created_at.isoformat(),
    )