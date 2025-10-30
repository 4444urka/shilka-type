from pydantic import BaseModel
from pydantic import ConfigDict


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
    model_config = ConfigDict(from_attributes=True)

class ThemePublic(ThemeBase):
    id: int
    author_id: int
    author_username: str
    created_at: str
    model_config = ConfigDict(from_attributes=True)