from pydantic import BaseModel, Field, field_validator
import json

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=256)

    @field_validator("password")
    @classmethod
    def ensure_password_not_too_long(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 256:
            raise ValueError("Password must be at most 256 bytes when encoded in UTF-8")
        return value

class UserInDB(UserBase):
    id: int
    hashed_password: str
    shilka_coins: int | None = 0
    selected_theme_id: int | None = None

    class Config:
        from_attributes = True


class UserPublic(UserBase):
    id: int
    # Может прийти None из ORM, позволяем и даём дефолт 0
    shilka_coins: int | None = 0
    selected_theme_id: int | None = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None


class ThemeBase(BaseModel):
    name: str
    theme_data: dict  # JSON объект с темой
    is_public: bool = True

class ThemeCreate(ThemeBase):
    pass

class ThemeInDB(ThemeBase):
    id: int
    author_id: int
    created_at: str

    class Config:
        from_attributes = True

class ThemePublic(ThemeBase):
    id: int
    author_id: int
    author_username: str
    created_at: str

    class Config:
        from_attributes = True