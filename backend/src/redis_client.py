"""
Конфигурация и утилиты для работы с Redis кэшем
"""
from typing import Optional
from redis import asyncio as aioredis
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

from .config import settings


class RedisClient:
    """Клиент для работы с Redis"""
    
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
    
    async def connect(self):
        """Подключение к Redis"""
        redis_host = settings.get("redis", {}).get("host", "redis")
        redis_port = settings.get("redis", {}).get("port", 6379)
        redis_db = settings.get("redis", {}).get("db", 0)
        
        self.redis = aioredis.from_url(
            f"redis://{redis_host}:{redis_port}/{redis_db}",
            encoding="utf-8",
            decode_responses=True,
        )
        
        # Инициализация FastAPICache
        FastAPICache.init(RedisBackend(self.redis), prefix="fastapi-cache")
        
        print(f"✅ Connected to Redis at {redis_host}:{redis_port}")
    
    async def disconnect(self):
        """Отключение от Redis"""
        if self.redis:
            await self.redis.close()
            print("❌ Disconnected from Redis")
    
    async def get(self, key: str) -> Optional[str]:
        """Получить значение из кэша"""
        if self.redis:
            return await self.redis.get(key)
        return None
    
    async def set(self, key: str, value: str, expire: int = 300):
        """Сохранить значение в кэш с TTL (по умолчанию 5 минут)"""
        if self.redis:
            await self.redis.set(key, value, ex=expire)
    
    async def delete(self, key: str):
        """Удалить значение из кэша"""
        if self.redis:
            await self.redis.delete(key)
    
    async def invalidate_pattern(self, pattern: str):
        """Удалить все ключи по паттерну"""
        if self.redis:
            keys = await self.redis.keys(pattern)
            if keys:
                await self.redis.delete(*keys)


# Глобальный экземпляр Redis клиента
redis_client = RedisClient()
