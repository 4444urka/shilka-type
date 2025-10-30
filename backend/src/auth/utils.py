from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..config import settings
from ..database import get_db
from .models import User
from .schemas import TokenData

pwd_context = CryptContext(
    schemes=["bcrypt_sha256", "bcrypt"],
    deprecated=["bcrypt"],
)

SECRET_KEY = settings["auth"]["secret_key"]
ALGORITHM = settings["auth"]["algorithm"]
ACCESS_TOKEN_EXPIRE_MINUTES = settings["auth"]["access_token_expire_minutes"]

COOKIE_NAME = "access_token"


def verify_password(plain_password, hashed_password):
    """Проверка пароля (синхронная операция)"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    """Хеширование пароля (синхронная операция)"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Создание JWT токена (синхронная операция)"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
    """Получение текущего пользователя из JWT токена (асинхронная)"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = request.cookies.get(COOKIE_NAME)
        if not token:
            print("No token found in cookies")
            raise credentials_exception
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            print("No username in token payload")
            raise credentials_exception
        token_data = TokenData(username=username)
        print(f"User authenticated: {username}")
    except JWTError as e:
        print(f"JWT Error: {e}")
        raise credentials_exception
    
    # Асинхронный запрос к БД
    result = await db.execute(
        select(User).filter(User.username == token_data.username)
    )
    user = result.scalar_one_or_none()
    
    if user is None:
        print(f"User not found in database: {token_data.username}")
        raise credentials_exception
    return user