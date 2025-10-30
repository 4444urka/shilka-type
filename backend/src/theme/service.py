import json
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from .models import Theme
from .schemas import ThemeCreate
from ..auth import models as auth_models


async def create_theme(current_user: auth_models.User, theme: ThemeCreate, db: AsyncSession):
    try:
        theme_data_json = json.dumps(theme.theme_data)
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid theme data format")

    db_theme = Theme(
        name=theme.name,
        author_id=current_user.id,
        theme_data=theme_data_json,
        is_public=theme.is_public,
    )
    db.add(db_theme)
    await db.commit()
    await db.refresh(db_theme)

    return db_theme


async def get_public_themes(db: AsyncSession) -> List[Theme]:
    result = await db.execute(
        select(Theme, auth_models.User.username)
        .join(auth_models.User, Theme.author_id == auth_models.User.id)
        .where(Theme.is_public == True)
    )
    themes = []
    for theme, author_username in result:
        themes.append((theme, author_username))
    return themes


async def get_my_themes(current_user: auth_models.User, db: AsyncSession) -> List[Theme]:
    result = await db.execute(
        select(Theme).where(Theme.author_id == current_user.id)
    )
    return result.scalars().all()


async def select_theme(current_user: auth_models.User, theme_id: int, db: AsyncSession):
    result = await db.execute(select(Theme).where(Theme.id == theme_id))
    theme = result.scalar_one_or_none()
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    if not theme.is_public and theme.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Theme is not accessible")

    current_user.selected_theme_id = theme_id
    db.add(current_user)
    await db.commit()
    return theme


async def get_selected_theme(current_user: auth_models.User, db: AsyncSession) -> Optional[tuple]:
    if not current_user.selected_theme_id:
        return None
    result = await db.execute(
        select(Theme, auth_models.User.username)
        .join(auth_models.User, Theme.author_id == auth_models.User.id)
        .where(Theme.id == current_user.selected_theme_id)
    )
    theme_data = result.first()
    if not theme_data:
        return None
    theme, author_username = theme_data
    return theme, author_username
