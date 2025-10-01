from fastapi import FastAPI
from .auth.router import router as auth_router
from .database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth_router, prefix="/auth", tags=["auth"])