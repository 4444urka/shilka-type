from pydantic import BaseModel, Field
from pydantic import ConfigDict


class AddCoinsRequest(BaseModel):
    """Схема запроса для добавления/вычитания монет"""
    amount: int = Field(..., description="Количество монет (положительное для добавления, отрицательное для вычитания)")


class UserAdminUpdate(BaseModel):
    """Схема обновления пользователя администратором"""
    username: str | None = None
    # email historically existed but current User model doesn't have it; keep optional for future
    email: str | None = None
    coins: int | None = None
    role: str | None = Field(None, pattern="^(user|admin)$")
    is_active: bool | None = None


class UserAdminResponse(BaseModel):
    """Схема ответа с информацией о пользователе для админа.

    Поля согласованы с текущей ORM-моделью `User`.
    """
    id: int
    username: str
    role: str
    shilka_coins: int | None = 0
    selected_theme_id: int | None = None
    default_time: int | None = 30
    default_words: int | None = 25
    default_language: str | None = "en"
    default_mode: str | None = "words"
    default_test_type: str | None = "time"

    # enable ORM mode (pydantic v2)
    model_config = ConfigDict(from_attributes=True)
