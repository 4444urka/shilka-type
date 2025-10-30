"""
Unit tests for auth.service
"""
import pytest

from src.auth import service as auth_service
from src.auth import utils as auth_utils
from src.auth.schemas import UserCreate


@pytest.mark.asyncio
async def test_register_user(db_session):
    user_in = UserCreate(username="service_user", password="strongpass123")
    user = await auth_service.register_user(user_in, db_session)
    assert user.username == "service_user"
    assert user.id is not None
    # password must be hashed
    assert user.hashed_password != "strongpass123"
    assert auth_utils.verify_password("strongpass123", user.hashed_password)


@pytest.mark.asyncio
async def test_authenticate_user_success_and_failure(db_session):
    # create a user directly
    from src.auth.models import User

    hashed = auth_utils.get_password_hash("mypassword")
    u = User(username="auth_test", hashed_password=hashed, shilka_coins=0)
    db_session.add(u)
    await db_session.commit()
    await db_session.refresh(u)

    ok = await auth_service.authenticate_user("auth_test", "mypassword", db_session)
    assert ok is not None

    bad = await auth_service.authenticate_user("auth_test", "wrongpass", db_session)
    assert bad is None


@pytest.mark.asyncio
async def test_register_user_duplicate(db_session):
    from src.auth.models import User
    # create existing user
    u = User(username="dup", hashed_password=auth_utils.get_password_hash("p"))
    db_session.add(u)
    await db_session.commit()

    user_in = UserCreate(username="dup", password="anotherpass")
    with pytest.raises(Exception):
        await auth_service.register_user(user_in, db_session)


@pytest.mark.asyncio
async def test_register_user_hash_error(monkeypatch, db_session):
    # simulate get_password_hash raising ValueError
    def raise_val(s):
        raise ValueError("bad")

    monkeypatch.setattr(auth_utils, "get_password_hash", raise_val)
    user_in = UserCreate(username="testerr", password="password123")
    with pytest.raises(Exception):
        await auth_service.register_user(user_in, db_session)
