"""
Tests for auth.utils.get_current_user via HTTP requests to /auth/me using cookies
"""
import pytest

from src.auth import utils as auth_utils


@pytest.mark.asyncio
async def test_get_current_user_no_token(client):
    # no cookie set -> should return 401 when calling /auth/me
    r = await client.get("/auth/me")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_invalid_jwt(client):
    # set an invalid token
    client.cookies.set("access_token", "not-a-jwt")
    r = await client.get("/auth/me")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_no_sub_in_jwt(client):
    # create a token without 'sub' claim
    token = auth_utils.create_access_token({"foo": "bar"})
    client.cookies.set("access_token", token)
    r = await client.get("/auth/me")
    assert r.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_user_not_found(client):
    # create token with sub of non-existent user
    token = auth_utils.create_access_token({"sub": "ghost_user"})
    client.cookies.set("access_token", token)
    r = await client.get("/auth/me")
    assert r.status_code == 401
