from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db

from . import models, schemas, utils
from . import service as auth_service

router = APIRouter()


@router.post("/register", response_model=schemas.UserPublic)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    """Регистрация нового пользователя"""
    return await auth_service.register_user(user, db)


@router.post("/login", response_model=schemas.Token)
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Вход пользователя и получение JWT токена"""
    user = await auth_service.authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = auth_service.create_access_token_for_user(user)

    # Устанавливаем HttpOnly cookie с токеном
    cookie_max_age = int(utils.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Установите True в production за HTTPS
        samesite="lax",
        max_age=cookie_max_age,
        path="/",
    )
    print(f"Setting cookie with max_age: {cookie_max_age} seconds ({utils.ACCESS_TOKEN_EXPIRE_MINUTES} minutes)")
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserPublic)
async def read_users_me(current_user: models.User = Depends(utils.get_current_user)):
    """Получение информации о текущем пользователе"""
    return current_user


@router.post("/logout")
async def logout(response: Response):
    """Выход пользователя (удаление cookie)"""
    response.delete_cookie("access_token", path="/")
    return {"detail": "Logged out"}