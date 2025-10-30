from typing import Any, Iterable


def _is_correct(char_item: Any) -> bool:
    """Return True if the char item represents a correct character.

    Supports both dicts (from JSON) and objects (Pydantic models).
    """
    if isinstance(char_item, dict):
        return bool(char_item.get("correct", False))
    return bool(getattr(char_item, "correct", False))


def compute_wpm(words: Iterable, history: Iterable[Iterable[Any]], duration: int | None, wpm_override: float | None = None) -> float:
    """Compute WPM from history and duration.

    If `wpm_override` is provided (front-end value), it is returned unchanged.
    History items may be lists of dicts (JSON) or lists of objects (Pydantic models).
    """
    if wpm_override is not None:
        return float(wpm_override)

    if not duration or duration == 0:
        return 0.0

    # Count correct characters across all words
    correct_chars = 0
    for word in history:
        # word may be a list of char objects/dicts
        for c in word:
            if _is_correct(c):
                correct_chars += 1

    minutes = duration / 60.0
    if minutes == 0:
        return 0.0

    wpm = (correct_chars / 5.0) / minutes
    return round(wpm, 2)


def compute_accuracy(history: Iterable[Iterable[Any]], accuracy_override: float | None = None) -> float:
    """Compute accuracy percentage from history.

    If `accuracy_override` is provided (front-end value), it is returned unchanged.
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
