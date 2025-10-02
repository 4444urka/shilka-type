from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth.router import router as auth_router
from .stats.router import router as stats_router
from .database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost",
]

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
def health_check():
    """Health check endpoint для Docker и мониторинга"""
    return {"status": "ok"}


@app.get("/")
def read_root():
    """Root endpoint"""
    return {"message": "Shilka Type API", "version": "1.0.0"}