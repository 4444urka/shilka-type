"""
Pydantic схемы для content модуля
"""
from pydantic import BaseModel, Field


class TextUploadRequest(BaseModel):
    """Схема для загрузки сырого текста"""
    raw_text: str = Field(..., description="Сырой текст для обработки")
    language: str = Field(..., pattern="^(ru|en)$", description="Язык текста: 'ru' или 'en'")


class TextUploadResponse(BaseModel):
    """Схема ответа после загрузки текста"""
    message: str
    words_created: int
    sentences_created: int
    language: str


class WordResponse(BaseModel):
    """Схема ответа для слова"""
    id: int
    text: str
    language: str
    is_active: bool
    
    class Config:
        from_attributes = True


class SentenceResponse(BaseModel):
    """Схема ответа для предложения"""
    id: int
    text: str
    language: str
    word_count: int
    is_active: bool
    
    class Config:
        from_attributes = True
