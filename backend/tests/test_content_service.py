"""
Тесты для сервисного слоя контента (content/service.py)
"""
import pytest
from sqlalchemy import select

from src.content.models import Word, Sentence
from src.content.service import (
    upload_text_content,
    get_random_words,
    get_random_sentences
)


class TestUploadTextContent:
    """Тесты загрузки и обработки текста"""
    
    @pytest.mark.asyncio
    async def test_upload_russian_text_creates_words_and_sentences(self, db_session):
        """Загрузка русского текста создаёт слова и предложения"""
        raw_text = "Привет мир! Это тестовое предложение. Ещё одно предложение здесь."
        
        words_count, sentences_count = await upload_text_content(
            db_session, raw_text, "ru"
        )
        
        assert words_count > 0
        assert sentences_count > 0
        
        # Проверяем что слова сохранились в БД
        result = await db_session.execute(
            select(Word).where(Word.language == "ru")
        )
        words = result.scalars().all()
        assert len(words) == words_count
        assert all(w.is_active for w in words)
        
        # Проверяем что предложения сохранились
        result = await db_session.execute(
            select(Sentence).where(Sentence.language == "ru")
        )
        sentences = result.scalars().all()
        assert len(sentences) == sentences_count
        assert all(s.is_active for s in sentences)
    
    @pytest.mark.asyncio
    async def test_upload_english_text_creates_words_and_sentences(self, db_session):
        """Загрузка английского текста создаёт слова и предложения"""
        raw_text = "Hello world! This is a test sentence. Another one here."
        
        words_count, sentences_count = await upload_text_content(
            db_session, raw_text, "en"
        )
        
        assert words_count > 0
        assert sentences_count > 0
        
        # Проверяем что всё на английском
        result = await db_session.execute(
            select(Word).where(Word.language == "en")
        )
        words = result.scalars().all()
        assert len(words) == words_count
    
    @pytest.mark.asyncio
    async def test_upload_duplicate_words_skipped(self, db_session):
        """Дубликаты слов не создаются повторно"""
        text1 = "Привет мир тест."
        text2 = "Привет другой тест слово."
        
        words1, _ = await upload_text_content(db_session, text1, "ru")
        words2, _ = await upload_text_content(db_session, text2, "ru")
        
        # Второй раз должно создаться меньше слов (т.к. "привет" и "тест" уже есть)
        assert words2 < words1
        
        # Проверяем общее количество уникальных слов
        result = await db_session.execute(
            select(Word).where(Word.language == "ru")
        )
        all_words = result.scalars().all()
        word_texts = {w.text for w in all_words}
        
        assert "привет" in word_texts
        assert "мир" in word_texts
        assert "тест" in word_texts
        assert "другой" in word_texts
        assert "слово" in word_texts
    
    @pytest.mark.asyncio
    async def test_upload_duplicate_sentences_skipped(self, db_session):
        """Дубликаты предложений не создаются повторно"""
        text = "Это тестовое предложение здесь. Другое предложение тут."
        
        _, sent1 = await upload_text_content(db_session, text, "ru")
        _, sent2 = await upload_text_content(db_session, text, "ru")
        
        # Второй раз ничего не должно создаться
        assert sent2 == 0
        
        # Проверяем что в БД только уникальные предложения
        result = await db_session.execute(
            select(Sentence).where(Sentence.language == "ru")
        )
        sentences = result.scalars().all()
        assert len(sentences) == sent1
    
    @pytest.mark.asyncio
    async def test_upload_empty_text_returns_zero(self, db_session):
        """Пустой текст возвращает (0, 0)"""
        words, sentences = await upload_text_content(db_session, "", "ru")
        assert words == 0
        assert sentences == 0
    
    @pytest.mark.asyncio
    async def test_upload_mixed_language_filters_by_language(self, db_session):
        """Смешанный текст фильтруется по языку"""
        # Русский текст с английскими словами
        text = "Привет world тест API endpoint функция."
        
        words_count, _ = await upload_text_content(db_session, text, "ru")
        
        # Проверяем что английские слова не попали в БД
        result = await db_session.execute(
            select(Word).where(Word.language == "ru")
        )
        words = result.scalars().all()
        word_texts = {w.text for w in words}
        
        assert "привет" in word_texts
        assert "тест" in word_texts
        assert "функция" in word_texts
        # Английские слова должны быть отфильтрованы
        assert "world" not in word_texts
        assert "api" not in word_texts
        assert "endpoint" not in word_texts
    
    @pytest.mark.asyncio
    async def test_upload_sentence_word_count_calculated(self, db_session):
        """Количество слов в предложении подсчитывается"""
        text = "Это предложение содержит пять слов."
        
        _, sentences_count = await upload_text_content(db_session, text, "ru")
        
        result = await db_session.execute(
            select(Sentence).where(Sentence.language == "ru")
        )
        sentence = result.scalar_one()
        
        assert sentence.word_count == 5


class TestGetRandomWords:
    """Тесты получения случайных слов"""
    
    @pytest.mark.asyncio
    async def test_get_random_words_returns_requested_count(self, db_session):
        """Возвращает запрошенное количество слов"""
        # Создаём тестовые слова
        for i in range(10):
            word = Word(language="ru", text=f"слово{i}", is_active=True)
            db_session.add(word)
        await db_session.commit()
        
        words = await get_random_words(db_session, "ru", count=5)
        assert len(words) == 5
    
    @pytest.mark.asyncio
    async def test_get_random_words_filters_by_language(self, db_session):
        """Фильтрует слова по языку"""
        # Создаём русские и английские слова
        for i in range(5):
            word_ru = Word(language="ru", text=f"слово{i}", is_active=True)
            word_en = Word(language="en", text=f"word{i}", is_active=True)
            db_session.add(word_ru)
            db_session.add(word_en)
        await db_session.commit()
        
        words_ru = await get_random_words(db_session, "ru", count=10)
        words_en = await get_random_words(db_session, "en", count=10)
        
        assert all(w.language == "ru" for w in words_ru)
        assert all(w.language == "en" for w in words_en)
    
    @pytest.mark.asyncio
    async def test_get_random_words_only_active(self, db_session):
        """Возвращает только активные слова"""
        # Создаём активные и неактивные слова
        for i in range(5):
            word_active = Word(language="ru", text=f"активное{i}", is_active=True)
            word_inactive = Word(language="ru", text=f"неактивное{i}", is_active=False)
            db_session.add(word_active)
            db_session.add(word_inactive)
        await db_session.commit()
        
        words = await get_random_words(db_session, "ru", count=10)
        
        assert all(w.is_active for w in words)
        assert len(words) == 5  # Только активные
    
    @pytest.mark.asyncio
    async def test_get_random_words_empty_database(self, db_session):
        """Пустая БД возвращает пустой список"""
        words = await get_random_words(db_session, "ru", count=5)
        assert words == []
    
    @pytest.mark.asyncio
    async def test_get_random_words_less_than_requested(self, db_session):
        """Возвращает меньше слов если в БД недостаточно"""
        for i in range(3):
            word = Word(language="ru", text=f"слово{i}", is_active=True)
            db_session.add(word)
        await db_session.commit()
        
        words = await get_random_words(db_session, "ru", count=10)
        assert len(words) == 3


class TestGetRandomSentences:
    """Тесты получения случайных предложений"""
    
    @pytest.mark.asyncio
    async def test_get_random_sentences_returns_requested_count(self, db_session):
        """Возвращает запрошенное количество предложений"""
        for i in range(10):
            sentence = Sentence(
                language="ru",
                text=f"Это тестовое предложение номер {i}.",
                word_count=5,
                is_active=True
            )
            db_session.add(sentence)
        await db_session.commit()
        
        sentences = await get_random_sentences(db_session, "ru", count=3)
        assert len(sentences) == 3
    
    @pytest.mark.asyncio
    async def test_get_random_sentences_filters_by_language(self, db_session):
        """Фильтрует предложения по языку"""
        for i in range(5):
            sent_ru = Sentence(
                language="ru",
                text=f"Это русское предложение {i}.",
                word_count=4,
                is_active=True
            )
            sent_en = Sentence(
                language="en",
                text=f"This is English sentence {i}.",
                word_count=4,
                is_active=True
            )
            db_session.add(sent_ru)
            db_session.add(sent_en)
        await db_session.commit()
        
        sentences_ru = await get_random_sentences(db_session, "ru", count=10)
        sentences_en = await get_random_sentences(db_session, "en", count=10)
        
        assert all(s.language == "ru" for s in sentences_ru)
        assert all(s.language == "en" for s in sentences_en)
    
    @pytest.mark.asyncio
    async def test_get_random_sentences_only_active(self, db_session):
        """Возвращает только активные предложения"""
        for i in range(5):
            sent_active = Sentence(
                language="ru",
                text=f"Активное предложение номер {i}.",
                word_count=4,
                is_active=True
            )
            sent_inactive = Sentence(
                language="ru",
                text=f"Неактивное предложение номер {i}.",
                word_count=4,
                is_active=False
            )
            db_session.add(sent_active)
            db_session.add(sent_inactive)
        await db_session.commit()
        
        sentences = await get_random_sentences(db_session, "ru", count=10)
        
        assert all(s.is_active for s in sentences)
        assert len(sentences) == 5  # Только активные
    
    @pytest.mark.asyncio
    async def test_get_random_sentences_empty_database(self, db_session):
        """Пустая БД возвращает пустой список"""
        sentences = await get_random_sentences(db_session, "ru", count=5)
        assert sentences == []
    
    @pytest.mark.asyncio
    async def test_get_random_sentences_less_than_requested(self, db_session):
        """Возвращает меньше предложений если в БД недостаточно"""
        for i in range(2):
            sentence = Sentence(
                language="ru",
                text=f"Предложение номер {i} здесь.",
                word_count=4,
                is_active=True
            )
            db_session.add(sentence)
        await db_session.commit()
        
        sentences = await get_random_sentences(db_session, "ru", count=10)
        assert len(sentences) == 2
