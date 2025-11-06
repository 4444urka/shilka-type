import pytest

from src.auth.models import User
from src.auth.utils import get_password_hash
from src.stats.models import TypingSession, CoinTransaction


@pytest.mark.asyncio
async def test_admin_can_list_users_and_user_cannot(client, db_session, test_user):
    # create admin user
    admin = User(
        username="admin",
        hashed_password=get_password_hash("adminpass123"),
        role="admin",
        shilka_coins=0,
    )
    db_session.add(admin)
    await db_session.commit()
    await db_session.refresh(admin)

    # set admin cookie token (bypass login endpoint to avoid flaky form auth in tests)
    from src.auth.service import create_access_token_for_user
    token = create_access_token_for_user(admin)
    client.cookies.set("access_token", token, path="/")

    # as admin should be able to list users
    # client base_url includes /api, router mounts admin under /api/admin
    resp = await client.get("/admin/users")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    # ensure admin present in list
    assert any(u["username"] == "admin" for u in data)

    # now login as normal test user (created by fixture in conftest)
    from src.auth.service import create_access_token_for_user
    token = create_access_token_for_user(test_user)
    client.cookies.set("access_token", token, path="/")

    # normal user should be forbidden
    resp = await client.get("/admin/users")
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_admin_delete_user_and_cleanup_relations(client, db_session):
    # create admin and a target user with related sessions and transactions
    admin = User(
        username="admin2",
        hashed_password=get_password_hash("admin2pass"),
        role="admin",
        shilka_coins=0,
    )
    target = User(
        username="victim",
        hashed_password=get_password_hash("victimpass"),
        role="user",
        shilka_coins=10,
    )
    db_session.add_all([admin, target])
    await db_session.commit()
    await db_session.refresh(target)
    await db_session.refresh(admin)

    # create a typing session for target
    ts = TypingSession(
        user_id=target.id,
        wpm=50.0,
        accuracy=95.0,
        duration=30,
        words="[]",
        history="[]",
        typing_mode="words",
        language="en",
        test_type="time",
    )
    db_session.add(ts)
    await db_session.commit()
    await db_session.refresh(ts)

    # create coin transaction
    ct = CoinTransaction(
        user_id=target.id,
        typing_session_id=None,
        amount=5,
    )
    db_session.add(ct)
    await db_session.commit()

    # login as admin2 by setting cookie token
    from src.auth.service import create_access_token_for_user
    token = create_access_token_for_user(admin)
    client.cookies.set("access_token", token, path="/")

    # delete target user
    resp = await client.delete(f"/admin/users/{target.id}")
    assert resp.status_code in (200, 204)

    # ensure user is gone
    resp = await client.get(f"/admin/users/{target.id}")
    assert resp.status_code == 404

    # ensure no typing sessions or coin transactions remain for that user
    sessions = await db_session.execute(
        TypingSession.__table__.select().where(TypingSession.user_id == target.id)
    )
    assert sessions.first() is None

    trans = await db_session.execute(
        CoinTransaction.__table__.select().where(CoinTransaction.user_id == target.id)
    )
    assert trans.first() is None
