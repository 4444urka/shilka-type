from typing import Any, Iterable


def _is_correct(char_item: Any) -> bool:
    """Return True if the char item represents a correct character.

    Supports both dicts (from JSON) and objects (Pydantic models).
    """
    if isinstance(char_item, dict):
        return bool(char_item.get("correct", False))
    return bool(getattr(char_item, "correct", False))


def compute_wpm(words: Iterable, history: Iterable[Iterable[Any]], duration: int | None, wpm_override: float | None = None) -> float:
    """Вычислить WPM (words per minute) по истории и длительности.

    Если задан `wpm_override` (значение с фронтенда), оно возвращается без изменений.
    Элементы `history` могут быть списками словарей (JSON) или объектами Pydantic.
    """
    if wpm_override is not None:
        return float(wpm_override)

    if not duration or duration == 0:
        return 0.0

    # Подсчитать правильные символы по всем словам
    correct_chars = 0
    for word in history:
        # word может быть списком объектов символов или словарей
        for c in word:
            if _is_correct(c):
                correct_chars += 1

    minutes = duration / 60.0
    if minutes == 0:
        return 0.0

    wpm = (correct_chars / 5.0) / minutes
    return round(wpm, 2)


def compute_accuracy(history: Iterable[Iterable[Any]], accuracy_override: float | None = None) -> float:
    """Вычислить процент точности (accuracy) по истории.

    Если задан `accuracy_override` (значение с фронтенда), оно возвращается без изменений.
    """
    if accuracy_override is not None:
        return float(accuracy_override)

    total_chars = 0
    correct_chars = 0
    for word in history:
        total_chars += len(word)
        for c in word:
            if _is_correct(c):
                correct_chars += 1

    if total_chars == 0:
        return 100.0

    accuracy = (correct_chars / total_chars) * 100.0
    return round(accuracy, 2)


def compute_reward(wpm: float, accuracy: float, duration: int | None, test_type: str | None) -> int:
    """Вычислить награду (монеты) за сессию набора.

    Простейшее правило по умолчанию:
      coins = max(1, int(wpm * (accuracy / 100)))

    Функцию можно настраивать: добавлять бонусы за длительность, тип теста и т.д.
    """
    try:
        base = float(wpm or 0.0) * (float(accuracy or 0.0) / 100.0)
    except Exception:
        base = 0.0

    coins = int(base)
    if coins < 1:
        coins = 1

    # дополнительные корректировки
    if duration and duration > 300:  # +1 монета за длинные сессии (>5 минут)
        coins += 1

    # небольшой бонус для специальных типов тестов
    if test_type and test_type.lower() == "marathon":
        coins += 2

    return coins


def compute_reward_from_history(history: Iterable[Iterable[Any]]) -> int:
    """Вычислить награду по истории: +1 за правильный символ, -1 за неправильный.

    `history` может быть вложенным итерируемым объектом словарей (JSON) или Pydantic-моделей.
    Возвращает целочисленную дельту (может быть отрицательной). Вызов обязан применить
    результат к балансу пользователя и при необходимости не допустить отрицательного баланса.
    """
    correct = 0
    incorrect = 0
    for word in history:
        for c in word:
            if _is_correct(c):
                correct += 1
            else:
                incorrect += 1

    return correct - incorrect
