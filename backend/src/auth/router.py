from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db

from . import models, schemas, utils

router = APIRouter()


@router.post("/register", response_model=schemas.UserPublic)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    """Регистрация нового пользователя"""
    # Проверяем, существует ли пользователь
    result = await db.execute(
        select(models.User).filter(models.User.username == user.username)
    )
    db_user = result.scalar_one_or_none()
    
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    try:
        hashed_password = utils.get_password_hash(user.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    
    # Создаем нового пользователя
    db_user = models.User(
        username=user.username,
        hashed_password=hashed_password,
        shilka_coins=0,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


@router.post("/login", response_model=schemas.Token)
async def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Вход пользователя и получение JWT токена"""
    # Поиск пользователя
    result = await db.execute(
        select(models.User).filter(models.User.username == form_data.username)
    )
    user = result.scalar_one_or_none()
    
    if not user or not utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = utils.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
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