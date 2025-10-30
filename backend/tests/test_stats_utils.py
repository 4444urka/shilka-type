import pytest

from src.stats.utils import compute_wpm, compute_accuracy


class CharObj:
    def __init__(self, correct: bool):
        self.correct = correct


def test_compute_wpm_override():
    assert compute_wpm([], [], 10, wpm_override=42) == 42.0


def test_compute_wpm_zero_duration():
    history = [[{"char": "a", "correct": True, "time": 1}]]
    assert compute_wpm(["a"], history, 0) == 0.0


def test_compute_wpm_json_history():
    words = ["hello"]
    history = [[{"char": "h", "correct": True, "time": 1}, {"char": "e", "correct": True, "time": 1}]]
    # 2 correct chars, duration=60 -> WPM = (2/5)/1 = 0.4
    assert compute_wpm(words, history, 60) == 0.4


def test_compute_wpm_object_history():
    history = [[CharObj(True), CharObj(False), CharObj(True)]]  # 2 correct
    # duration=30s -> minutes=0.5 -> (2/5)/0.5 = 0.8
    assert compute_wpm([], history, 30) == 0.8


def test_compute_accuracy_override():
    assert compute_accuracy([], accuracy_override=12.345) == 12.345


def test_compute_accuracy_empty_history():
    assert compute_accuracy([]) == 100.0


def test_compute_accuracy_json_and_objects():
    history1 = [[{"char": "a", "correct": True}, {"char": "b", "correct": False}], [{"char": "c", "correct": True}]]
    # total=3, correct=2 -> accuracy=66.67
    assert compute_accuracy(history1) == round((2 / 3) * 100, 2)

    history2 = [[CharObj(False), CharObj(False)]]  # total=2, correct=0 -> 0.0
    assert compute_accuracy(history2) == 0.0
