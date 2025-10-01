from .config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

# Получение данных для подключения к базе данных из конфигурации
DB_USER = settings.get("database").get("user")
DB_PASSWORD = settings.get("database").get("password")
DB_NAME = settings.get("database").get("db_name")
DB_HOST = settings.get("database").get("host")
DB_PORT = settings.get("database").get("port")

# Формирование URL для подключения к базе данных PostgreSQL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Создание движка SQLAlchemy
engine = create_engine(DATABASE_URL)

# Создание фабрики сессий
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Базовый класс для декларативных моделей
Base = declarative_base()

# Функция-зависимость для получения сессии базы данных
def get_db():
    """
    Создает и возвращает сессию базы данных, обеспечивая ее закрытие после использования.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()