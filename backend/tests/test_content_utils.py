"""
Тесты для утилит обработки текста (content/utils.py)
"""
import pytest
from src.content.utils import (
    clean_text,
    extract_words,
    extract_sentences,
    count_words_in_text,
    is_russian_word,
    is_english_word,
    filter_words_by_language,
    filter_sentence_by_language
)


class TestLanguageDetection:
    """Тесты определения языка слов"""
    
    def test_is_russian_word_with_cyrillic(self):
        """Проверка русского слова с кириллицей"""
        assert is_russian_word("привет") is True
        assert is_russian_word("МОСКВА") is True
        assert is_russian_word("тест123") is True
    
    def test_is_russian_word_without_cyrillic(self):
        """Проверка что латиница не определяется как русский"""
        assert is_russian_word("hello") is False
        assert is_russian_word("TEST") is False
        assert is_russian_word("123") is False
    
    def test_is_english_word_with_latin(self):
        """Проверка английского слова с латиницей"""
        assert is_english_word("hello") is True
        assert is_english_word("WORLD") is True
        assert is_english_word("test123") is True
    
    def test_is_english_word_without_latin(self):
        """Проверка что кириллица не определяется как английский"""
        assert is_english_word("привет") is False
        assert is_english_word("ТЕСТ") is False
        assert is_english_word("123") is False


class TestFilterWordsByLanguage:
    """Тесты фильтрации слов по языку"""
    
    def test_filter_russian_words(self):
        """Фильтрация: оставляем только русские слова"""
        words = ["привет", "hello", "мир", "world", "тест"]
        result = filter_words_by_language(words, "ru")
        assert result == ["привет", "мир", "тест"]
    
    def test_filter_english_words(self):
        """Фильтрация: оставляем только английские слова"""
        words = ["привет", "hello", "мир", "world", "test"]
        result = filter_words_by_language(words, "en")
        assert result == ["hello", "world", "test"]
    
    def test_filter_empty_list(self):
        """Фильтрация пустого списка"""
        assert filter_words_by_language([], "ru") == []
        assert filter_words_by_language([], "en") == []


class TestFilterSentenceByLanguage:
    """Тесты фильтрации предложений по языку"""
    
    def test_russian_sentence_passes_russian_filter(self):
        """Русское предложение проходит русский фильтр"""
        sentence = "Это тестовое предложение на русском языке."
        assert filter_sentence_by_language(sentence, "ru") is True
    
    def test_english_sentence_fails_russian_filter(self):
        """Английское предложение не проходит русский фильтр"""
        sentence = "This is a test sentence in English language."
        assert filter_sentence_by_language(sentence, "ru") is False
    
    def test_english_sentence_passes_english_filter(self):
        """Английское предложение проходит английский фильтр"""
        sentence = "This is a test sentence in English language."
        assert filter_sentence_by_language(sentence, "en") is True
    
    def test_russian_sentence_fails_english_filter(self):
        """Русское предложение не проходит английский фильтр"""
        sentence = "Это тестовое предложение на русском языке."
        assert filter_sentence_by_language(sentence, "en") is False
    
    def test_mixed_sentence_with_majority_russian(self):
        """Смешанное предложение с преобладанием русского (>=80%)"""
        # 5 русских слов, 1 английское = 83% русских
        sentence = "Это тест для проверки функции word."
        assert filter_sentence_by_language(sentence, "ru") is True
    
    def test_mixed_sentence_with_majority_english(self):
        """Смешанное предложение с преобладанием английского (>=80%)"""
        # 5 английских слов, 1 русское = 83% английских
        sentence = "This is a тест for API validation."
        assert filter_sentence_by_language(sentence, "en") is True
    
    def test_mixed_sentence_below_threshold(self):
        """Смешанное предложение ниже порога 80%"""
        # 3 русских, 2 английских = 60% русских
        sentence = "Это тест for API validation."
        assert filter_sentence_by_language(sentence, "ru") is False


class TestCleanText:
    """Тесты очистки текста"""
    
    def test_clean_russian_text(self):
        """Очистка русского текста"""
        text = "  Привет,   мир!  Это   тест123.  "
        result = clean_text(text, "ru")
        assert result == "Привет, мир! Это тест."
        # Цифры должны быть удалены для русского
        assert "123" not in result
    
    def test_clean_english_text(self):
        """Очистка английского текста"""
        text = "  Hello,   world!  This   is123   test.  "
        result = clean_text(text, "en")
        assert result == "Hello, world! This is test."
        # Цифры должны быть удалены для английского
        assert "123" not in result
    
    def test_remove_special_characters_russian(self):
        """Удаление спецсимволов из русского текста"""
        text = "Привет@#$%мир! Это тест..."
        result = clean_text(text, "ru")
        assert "@" not in result
        assert "#" not in result
        assert "$" not in result
        assert "Привет" in result
        assert "мир" in result
    
    def test_remove_special_characters_english(self):
        """Удаление спецсимволов из английского текста"""
        text = "Hello@#$%world! This is test..."
        result = clean_text(text, "en")
        assert "@" not in result
        assert "#" not in result
        assert "Hello" in result
        assert "world" in result
    
    def test_normalize_whitespace(self):
        """Нормализация множественных пробелов"""
        text = "Привет    мир!    Это     тест."
        result = clean_text(text, "ru")
        assert "    " not in result
        assert result == "Привет мир! Это тест."
    
    def test_preserve_punctuation(self):
        """Сохранение знаков препинания"""
        text = "Привет, мир! Как дела? Всё отлично."
        result = clean_text(text, "ru")
        assert "," in result
        assert "!" in result
        assert "?" in result
        assert "." in result
    
    def test_clean_empty_text(self):
        """Очистка пустого текста"""
        assert clean_text("", "ru") == ""
        assert clean_text("   ", "en") == ""


class TestExtractWords:
    """Тесты извлечения слов"""
    
    def test_extract_words_russian(self):
        """Извлечение русских слов"""
        text = "Привет, мир! Это тест."
        words = extract_words(text)
        assert "привет" in words
        assert "мир" in words
        assert "это" in words
        assert "тест" in words
    
    def test_extract_words_english(self):
        """Извлечение английских слов"""
        text = "Hello, world! This is test."
        words = extract_words(text)
        assert "hello" in words
        assert "world" in words
        assert "this" in words
        assert "is" in words
        assert "test" in words
    
    def test_extract_words_lowercase(self):
        """Слова приводятся к нижнему регистру"""
        text = "ПРИВЕТ Мир ЭтО тЕсТ"
        words = extract_words(text)
        assert all(w == w.lower() for w in words)
    
    def test_extract_words_unique(self):
        """Дубликаты удаляются"""
        text = "тест тест ТЕСТ Тест"
        words = extract_words(text)
        assert words.count("тест") == 1
    
    def test_extract_words_filter_single_char(self):
        """Односимвольные слова игнорируются"""
        text = "Я и о в тест слово"
        words = extract_words(text)
        assert "я" not in words
        assert "и" not in words
        assert "о" not in words
        assert "в" not in words
        assert "тест" in words
        assert "слово" in words
    
    def test_extract_words_with_language_filter_russian(self):
        """Извлечение с фильтрацией по русскому языку"""
        text = "Привет hello мир world тест"
        words = extract_words(text, language="ru")
        assert "привет" in words
        assert "мир" in words
        assert "тест" in words
        assert "hello" not in words
        assert "world" not in words
    
    def test_extract_words_with_language_filter_english(self):
        """Извлечение с фильтрацией по английскому языку"""
        text = "Привет hello мир world test"
        words = extract_words(text, language="en")
        assert "hello" in words
        assert "world" in words
        assert "test" in words
        assert "привет" not in words
        assert "мир" not in words
    
    def test_extract_words_empty_text(self):
        """Извлечение слов из пустого текста"""
        assert extract_words("") == []
        assert extract_words("   ") == []


class TestExtractSentences:
    """Тесты извлечения предложений"""
    
    def test_extract_sentences_basic(self):
        """Базовое извлечение предложений"""
        text = "Это первое предложение. Это второе предложение! А это третье?"
        sentences = extract_sentences(text)
        assert len(sentences) == 3
        assert "Это первое предложение." in sentences
        assert "Это второе предложение!" in sentences
        assert "А это третье?" in sentences
    
    def test_extract_sentences_minimum_words(self):
        """Предложения с минимум 3 словами"""
        text = "Да. Хорошо! Это нормальное предложение тут. А?"
        sentences = extract_sentences(text)
        # Только "Это нормальное предложение тут." должно пройти
        assert len(sentences) == 1
        assert "Это нормальное предложение тут." in sentences
    
    def test_extract_sentences_with_abbreviations(self):
        """Не разбивать на сокращениях"""
        text = "Например, т.е. это тест и т.д. для проверки."
        sentences = extract_sentences(text)
        # Должно быть одно предложение, несмотря на точки в сокращениях
        assert len(sentences) == 1
    
    def test_extract_sentences_must_end_with_punct(self):
        """Предложения должны заканчиваться знаком препинания"""
        text = "Это правильное предложение. Это неправильное"
        sentences = extract_sentences(text)
        assert len(sentences) == 1
        assert "Это правильное предложение." in sentences
    
    def test_extract_sentences_with_language_filter_russian(self):
        """Извлечение с фильтрацией по русскому языку"""
        text = "Это русское предложение здесь. This is English sentence. Ещё одно русское."
        sentences = extract_sentences(text, language="ru")
        assert len(sentences) == 2
        assert "Это русское предложение здесь." in sentences
        assert "Ещё одно русское." in sentences
        assert not any("English" in s for s in sentences)
    
    def test_extract_sentences_with_language_filter_english(self):
        """Извлечение с фильтрацией по английскому языку"""
        text = "Это русское предложение тут. This is English sentence here. Another English one."
        sentences = extract_sentences(text, language="en")
        assert len(sentences) == 2
        assert "This is English sentence here." in sentences
        assert "Another English one." in sentences
        assert not any("русское" in s for s in sentences)
    
    def test_extract_sentences_empty_text(self):
        """Извлечение предложений из пустого текста"""
        assert extract_sentences("") == []
        assert extract_sentences("   ") == []
    
    def test_extract_sentences_multiple_punctuation(self):
        """Разные знаки препинания в конце"""
        text = "Первое предложение тут. Второе предложение здесь! Третье предложение вопрос?"
        sentences = extract_sentences(text)
        assert len(sentences) == 3


class TestCountWordsInText:
    """Тесты подсчёта слов в тексте"""
    
    def test_count_words_basic(self):
        """Базовый подсчёт слов"""
        assert count_words_in_text("один два три") == 3
        assert count_words_in_text("one two three four") == 4
    
    def test_count_words_with_punctuation(self):
        """Подсчёт слов с знаками препинания"""
        text = "Привет, мир! Как дела?"
        assert count_words_in_text(text) == 4
    
    def test_count_words_empty_text(self):
        """Подсчёт слов в пустом тексте"""
        assert count_words_in_text("") == 0
        assert count_words_in_text("   ") == 0
    
    def test_count_words_multiple_spaces(self):
        """Подсчёт слов с множественными пробелами"""
        text = "слово1    слово2     слово3"
        assert count_words_in_text(text) == 3
