"""
Утилиты для обработки и очистки текста
"""
import re
from typing import List


def is_russian_word(word: str) -> bool:
    """
    Проверяет, содержит ли слово кириллицу
    
    Args:
        word: Слово для проверки
    
    Returns:
        True если слово содержит хотя бы одну кириллическую букву
    """
    return bool(re.search(r'[а-яА-ЯёЁ]', word))


def is_english_word(word: str) -> bool:
    """
    Проверяет, содержит ли слово латиницу
    
    Args:
        word: Слово для проверки
    
    Returns:
        True если слово содержит хотя бы одну латинскую букву
    """
    return bool(re.search(r'[a-zA-Z]', word))


def filter_words_by_language(words: List[str], language: str) -> List[str]:
    """
    Фильтрует слова, оставляя только те, которые соответствуют языку
    
    Args:
        words: Список слов
        language: Язык ('ru' или 'en')
    
    Returns:
        Отфильтрованный список слов
    """
    if language == 'ru':
        return [w for w in words if is_russian_word(w)]
    else:  # en
        return [w for w in words if is_english_word(w)]


def filter_sentence_by_language(sentence: str, language: str) -> bool:
    """
    Проверяет, соответствует ли предложение указанному языку
    
    Args:
        sentence: Предложение
        language: Язык ('ru' или 'en')
    
    Returns:
        True если предложение содержит преимущественно слова на нужном языке
    """
    # Убираем знаки препинания и разбиваем на слова
    words = re.sub(r'[.,!?\-\']', '', sentence).split()
    
    if not words:
        return False
    
    if language == 'ru':
        # Считаем слова с кириллицей
        cyrillic_words = sum(1 for w in words if is_russian_word(w))
        # Предложение считается русским, если >= 80% слов содержат кириллицу
        return cyrillic_words >= len(words) * 0.8
    else:  # en
        # Считаем слова с латиницей
        latin_words = sum(1 for w in words if is_english_word(w))
        # Предложение считается английским, если >= 80% слов содержат латиницу
        return latin_words >= len(words) * 0.8


def clean_text(text: str, language: str) -> str:
    """
    Очищает текст от лишних символов
    
    Args:
        text: Сырой текст
        language: Язык текста ('ru' или 'en')
    
    Returns:
        Очищенный текст
    """
    # Заменяем множественные пробелы на один
    text = re.sub(r'\s+', ' ', text)
    
    # Убираем пробелы в начале и конце
    text = text.strip()
    
    # Для русского языка оставляем: буквы, дефис, апостроф
    # Для английского: буквы, дефис, апостроф
    if language == 'ru':
        # Оставляем только кириллицу, дефис, апостроф, пробелы, точку, запятую, восклицательный и вопросительный знаки
        text = re.sub(r'[^а-яА-ЯёЁ\s\-\'.,!?]', '', text)
    else:  # en или другие латиничные
        # Оставляем только латиницу, дефис, апостроф, пробелы, точку, запятую, восклицательный и вопросительный знаки
        text = re.sub(r'[^a-zA-Z\s\-\'.,!?]', '', text)
    
    # Убираем множественные пробелы через split/join (безопаснее чем regex)
    text = ' '.join(text.split())
    
    # Убираем пробелы перед знаками препинания (ограничиваем квантификатор)
    text = re.sub(r' {1,10}([.,!?])', r'\1', text)
    
    return text.strip()


def extract_words(text: str, language: str = None) -> List[str]:
    """
    Разбивает текст на отдельные слова
    
    Args:
        text: Очищенный текст
        language: Язык для фильтрации ('ru', 'en' или None)
    
    Returns:
        Список уникальных слов
    """
    # Убираем знаки препинания для разбиения на слова
    text_no_punct = re.sub(r'[.,!?]', '', text)
    
    # Разбиваем по пробелам
    words = text_no_punct.split()
    
    # Фильтруем пустые строки и приводим к нижнему регистру
    words = [w.lower().strip() for w in words if w.strip()]
    
    # Фильтруем по языку если указан
    if language:
        words = filter_words_by_language(words, language)
    
    # Убираем дубликаты, сохраняя порядок
    seen = set()
    unique_words = []
    for word in words:
        if word not in seen and len(word) > 1:  # Игнорируем односимвольные слова
            seen.add(word)
            unique_words.append(word)
    
    return unique_words


def extract_sentences(text: str, language: str = None) -> List[str]:
    """
    Разбивает текст на предложения
    
    Args:
        text: Очищенный текст
        language: Язык для фильтрации ('ru', 'en' или None)
    
    Returns:
        Список предложений
    """
    # Заменяем переносы строк на пробелы
    text = re.sub(r'\n+', ' ', text)
    
    # Разбиваем по точке, восклицательному и вопросительному знакам,
    # после которых идёт пробел (или несколько) и заглавная буква, или конец строки
    # Это предотвратит разбиение на сокращениях типа "т.е." или "и т.д."
    sentences = re.split(r'(?<=[.!?])(?=\s+[A-ZА-ЯЁ]|\s*$)', text)
    
    # Фильтруем пустые строки, убираем лишние пробелы
    sentences = [s.strip() for s in sentences if s.strip()]
    
    # Оставляем только предложения с минимум 3 словами
    # и которые заканчиваются знаком препинания
    result = []
    for sent in sentences:
        # Проверяем количество слов
        word_count = len([w for w in re.sub(r'[.,!?]', '', sent).split() if w.strip()])
        # Проверяем что заканчивается знаком препинания
        ends_with_punct = bool(re.search(r'[.!?]\s*$', sent))
        
        if word_count >= 3 and ends_with_punct:
            # Фильтруем по языку если указан
            if language is None or filter_sentence_by_language(sent, language):
                result.append(sent)
    
    return result


def count_words_in_text(text: str) -> int:
    """
    Подсчитывает количество слов в тексте
    
    Args:
        text: Текст
    
    Returns:
        Количество слов
    """
    # Убираем знаки препинания
    text_no_punct = re.sub(r'[.,!?]', '', text)
    words = text_no_punct.split()
    return len([w for w in words if w.strip()])
