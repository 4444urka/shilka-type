from pydantic import BaseModel, Field
from pydantic import ConfigDict


class AddCoinsRequest(BaseModel):
    amount: int


class TypingChar(BaseModel):
    char: str
    correct: bool
    time: int


class WordHistoryPayload(BaseModel):
    words: list[str]
    history: list[list[TypingChar]]
    duration: int | None = None
    wpm: float | None = None  # WPM с фронтенда
    accuracy: float | None = None  # Точность с фронтенда
    mode: str | None = None  # режим набора (words, sentences, etc.)
    language: str | None = None  # язык (ru, en, etc.)
    test_type: str | None = Field(None, alias="testType")  # тип теста (time, words)
    model_config = ConfigDict(populate_by_name=True)
    # NOTE: business logic (WPM/accuracy computation) was moved to
    # `src.stats.utils` to keep schemas pure (DTO). Use
    # `src.stats.utils.compute_wpm` and `src.stats.utils.compute_accuracy`
    # from services or other parts of the codebase when you need to
    # calculate metrics based on the payload.


class TypingSessionResponse(BaseModel):
    id: int
    wpm: float
    accuracy: float
    duration: int | None
    typing_mode: str | None
    language: str | None
    test_type: str | None
    created_at: str
    model_config = ConfigDict(from_attributes=True)


class CharErrorStat(BaseModel):
    char: str
    error_rate: float
    total_typed: int
    errors: int
