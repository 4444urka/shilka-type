import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging

from .logging_config import configure_logging

from .auth.router import router as auth_router
from .stats.router import router as stats_router
from .theme.router import router as theme_router
from .database import Base, engine
from .redis_client import redis_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Configure logging once during startup
    configure_logging()
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


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        logger = logging.getLogger("app.request")
        start = time.time()
        try:
            response = await call_next(request)
            status_code = getattr(response, "status_code", None)
        except Exception as exc:
            # Log exception with traceback
            logger.exception("Unhandled error while processing request %s %s", request.method, request.url.path)
            raise
        finally:
            elapsed = (time.time() - start) * 1000.0
            client = request.client.host if request.client else None
            logger.info("%s %s %s %.2fms client=%s", request.method, request.url.path, status_code, elapsed, client)
        return response


# ВАЖНО: CORS middleware должен быть добавлен ПЕРВЫМ (последним в коде),
# чтобы обрабатывать preflight OPTIONS запросы до других middleware
origins = os.getenv("ALLOW_ORIGINS", "").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# RequestLoggingMiddleware добавляется после CORS
app.add_middleware(RequestLoggingMiddleware)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(stats_router, prefix="/api/stats", tags=["stats"])
app.include_router(theme_router, prefix="/api/themes", tags=["themes"])


@app.get("/health")
async def health_check():
    """Health check endpoint для Docker и мониторинга"""
    return {"status": "ok"}


@app.get("/")
async def read_root():
    """Root endpoint"""
    return {"message": "Shilka Type API", "version": "1.0.0"}