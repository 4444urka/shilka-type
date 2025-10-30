"""
Tests for RedisClient when redis backend is not configured (redis is None)
"""
import pytest

from src.redis_client import RedisClient, redis_client


def test_redis_client_methods_no_redis_do_not_raise():
    client = RedisClient()
    # ensure redis is None
    client.redis = None

    # these should not raise and should return None where applicable
    import asyncio

    async def run_checks():
        assert await client.get("no:key") is None
        # set/delete should not raise
        await client.set("k", "v")
        await client.delete("k")
        # invalidate pattern should not raise
        await client.invalidate_pattern("pattern*")

    asyncio.get_event_loop().run_until_complete(run_checks())


def test_global_redis_client_is_instance():
    assert isinstance(redis_client, RedisClient)
