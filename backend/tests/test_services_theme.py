"""
Unit tests for theme.service
"""
import pytest
import json
from fastapi import HTTPException

from src.theme import service as theme_service
from src.theme.schemas import ThemeCreate
from src.auth.models import User


@pytest.mark.asyncio
async def test_create_and_list_themes(db_session, test_user):
    # create public theme via service
    payload = ThemeCreate(name="PublicSvc", theme_data={"a": 1}, is_public=True)
    db_theme = await theme_service.create_theme(test_user, payload, db_session)
    assert db_theme.id is not None

    rows = await theme_service.get_public_themes(db_session)
    assert any(t.id == db_theme.id for t, _ in rows)

    my = await theme_service.get_my_themes(test_user, db_session)
    assert any(t.id == db_theme.id for t in my)


@pytest.mark.asyncio
async def test_select_private_theme_forbidden(db_session, test_user):
    # create another user
    other = User(username="other_svc")
    db_session.add(other)
    await db_session.commit()
    await db_session.refresh(other)

    # add private theme for other
    payload = ThemeCreate(name="PrivOther", theme_data={"b": 2}, is_public=False)
    other_theme = await theme_service.create_theme(other, payload, db_session)

    # test_user should not be able to select it
    with pytest.raises(HTTPException) as exc:
        await theme_service.select_theme(test_user, other_theme.id, db_session)
    assert exc.value.status_code == 403
