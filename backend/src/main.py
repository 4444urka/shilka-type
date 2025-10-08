import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth.router import router as auth_router
from .stats.router import router as stats_router
from .database import Base, engine
from .redis_client import redis_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения"""
    # Startup: Создание таблиц (только для разработки, в prod используйте миграции)
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all)  # Осторожно!
        await conn.run_sync(Base.metadata.create_all)
    
    # Подключение к Redis
    try:
        await redis_client.connect()
    except Exception as e:
        print(f"⚠️ Redis connection failed: {e}. Running without cache.")
    
    yield
    
    # Shutdown: Закрытие соединений
    await redis_client.disconnect()
    await engine.dispose()


app = FastAPI(
    title="Shilka Type API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS origins для разработки и продакшена
origins = [
    "http://localhost:5173",
]

# Добавляем дополнительные origins из переменных окружения
additional_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
origins.extend([origin.strip() for origin in additional_origins if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(stats_router, prefix="/stats", tags=["stats"])


@app.get("/health")
async def health_check():
    """Health check endpoint для Docker и мониторинга"""
    return {"status": "ok"}


@app.get("/")
async def read_root():
    """Root endpoint"""
    return {"message": "Shilka Type API", "version": "1.0.0"}