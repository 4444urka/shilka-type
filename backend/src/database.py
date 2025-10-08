from .config import settings
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator

# Получение данных для подключения к базе данных из конфигурации
DB_USER = settings.get("database").get("user")
DB_PASSWORD = settings.get("database").get("password")
DB_NAME = settings.get("database").get("db_name")
DB_HOST = settings.get("database").get("host")
DB_PORT = settings.get("database").get("port")

# Формирование URL для подключения к базе данных PostgreSQL (asyncpg драйвер)
DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Создание асинхронного движка SQLAlchemy
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Установите True для отладки SQL запросов
    pool_size=10,  # Размер пула соединений
    max_overflow=20,  # Максимальное количество дополнительных соединений
    pool_pre_ping=True,  # Проверка соединения перед использованием
)

# Создание фабрики асинхронных сессий
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# Базовый класс для декларативных моделей
Base = declarative_base()


# Асинхронная функция-зависимость для получения сессии базы данных
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Создает и возвращает асинхронную сессию базы данных,
    обеспечивая ее закрытие после использования.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()