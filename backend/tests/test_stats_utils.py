import pytest

from src.stats.utils import compute_wpm, compute_accuracy


class CharObj:
    def __init__(self, correct: bool):
        self.correct = correct


def test_compute_wpm_zero_duration():
    history = [[{"char": "a", "correct": True, "time": 1}]]
    assert compute_wpm(["a"], history, 0) == 0.0


def test_compute_wpm_json_history():
    words = ["hello"]
    # Полностью правильное слово "hello" (5 букв, все правильные)
    history = [
        [
            {"char": "h", "correct": True, "time": 1},
            {"char": "e", "correct": True, "time": 1},
            {"char": "l", "correct": True, "time": 1},
            {"char": "l", "correct": True, "time": 1},
            {"char": "o", "correct": True, "time": 1},
        ]
    ]
    # 1 правильное слово, duration=60s -> WPM = 1 слово / 1 минута = 1.0
    assert compute_wpm(words, history, 60) == 1.0


def test_compute_wpm_object_history():
    # 1 слово с 3 буквами, все правильные
    history = [[CharObj(True), CharObj(True), CharObj(True)]]
    # duration=30s -> minutes=0.5 -> 1 слово / 0.5 мин = 2.0
    assert compute_wpm(["abc"], history, 30) == 2.0


def test_compute_wpm_partial_word():
    # Слово с ошибкой - не должно засчитываться
    words = ["test"]
    history = [
        [
            {"char": "t", "correct": True, "time": 1},
            {"char": "e", "correct": False, "time": 1},  # ошибка
            {"char": "s", "correct": True, "time": 1},
            {"char": "t", "correct": True, "time": 1},
        ]
    ]
    # 0 правильных слов -> WPM = 0
    assert compute_wpm(words, history, 60) == 0.0


def test_compute_accuracy_empty_history():
    assert compute_accuracy([]) == 100.0


def test_compute_accuracy_json_and_objects():
    history1 = [[{"char": "a", "correct": True}, {"char": "b", "correct": False}], [{"char": "c", "correct": True}]]
    # total=3, correct=2 -> accuracy=66.67
    assert compute_accuracy(history1) == round((2 / 3) * 100, 2)

    history2 = [[CharObj(False), CharObj(False)]]  # total=2, correct=0 -> 0.0
    assert compute_accuracy(history2) == 0.0
