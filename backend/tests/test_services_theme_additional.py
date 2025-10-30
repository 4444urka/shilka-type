"""
Additional unit tests for theme.service to improve coverage
"""
import pytest
import json
from fastapi import HTTPException

from src.theme import service as theme_service
from src.theme.schemas import ThemeCreate


@pytest.mark.asyncio
async def test_create_theme_invalid_data(db_session, test_user):
    # theme_data contains non-serializable object (set) -> should raise 400
    payload = ThemeCreate(name="Bad", theme_data={"bad": {1,2}}, is_public=True)
    with pytest.raises(HTTPException) as exc:
        await theme_service.create_theme(test_user, payload, db_session)
    assert exc.value.status_code == 400


@pytest.mark.asyncio
async def test_select_theme_not_found(db_session, test_user):
    # choose a large id that doesn't exist
    with pytest.raises(HTTPException) as exc:
        await theme_service.select_theme(test_user, 999999, db_session)
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_get_selected_theme_none(db_session, test_user):
    test_user.selected_theme_id = None
    res = await theme_service.get_selected_theme(test_user, db_session)
    assert res is None
