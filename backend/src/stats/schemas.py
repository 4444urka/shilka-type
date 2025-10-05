from pydantic import BaseModel


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

    def calculate_wpm(self) -> float:
        """Вычисляет слов в минуту (WPM) на основе истории (fallback если не передан с фронта)."""
        if self.wpm is not None:
            return self.wpm
            
        if not self.duration or self.duration == 0:
            return 0.0
        
        # Считаем все правильные символы
        correct_chars = sum(
            sum(1 for char in word if char.correct)
            for word in self.history
        )
        
        # WPM = (правильные символы / 5) / (секунды / 60)
        # 5 символов = среднее слово по стандарту
        minutes = self.duration / 60.0
        if minutes == 0:
            return 0.0
        
        wpm = (correct_chars / 5.0) / minutes
        return round(wpm, 2)
    
    def calculate_accuracy(self) -> float:
        """Вычисляет точность набора (accuracy) в процентах (fallback если не передан с фронта)."""
        if self.accuracy is not None:
            return self.accuracy
            
        total_chars = sum(len(word) for word in self.history)
        if total_chars == 0:
            return 100.0
        
        correct_chars = sum(
            sum(1 for char in word if char.correct)
            for word in self.history
        )
        
        accuracy = (correct_chars / total_chars) * 100.0
        return round(accuracy, 2)


class TypingSessionResponse(BaseModel):
    id: int
    wpm: float
    accuracy: float
    duration: int | None
    created_at: str
    
    class Config:
        from_attributes = True


class CharErrorStat(BaseModel):
    char: str
    error_rate: float
    total_typed: int
    errors: int
