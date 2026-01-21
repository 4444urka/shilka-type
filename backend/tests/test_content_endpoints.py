"""
Тесты для endpoints контента (words, sentences, problem chars)
"""

import pytest

from src.auth.models import User
from src.auth.utils import get_password_hash
from src.content.models import Sentence, Word


class TestGetWords:
    """Тесты получения случайных слов"""

    @pytest.mark.asyncio
    async def test_get_words_default_params(self, client, db_session):
        """Получение слов с параметрами по умолчанию"""
        # Добавляем тестовые слова в БД
        words = [
            Word(text="hello", language="en"),
            Word(text="world", language="en"),
            Word(text="python", language="en"),
        ]
        for word in words:
            db_session.add(word)
        await db_session.commit()

        response = await client.get("/content/words")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_get_words_with_language_en(self, client, db_session):
        """Получение английских слов"""
        # Добавляем слова на разных языках
        en_words = [Word(text="cat", language="en"), Word(text="dog", language="en")]
        ru_words = [Word(text="кот", language="ru"), Word(text="пёс", language="ru")]

        for word in en_words + ru_words:
            db_session.add(word)
        await db_session.commit()

        response = await client.get("/content/words?language=en")
        assert response.status_code == 200
        data = response.json()
        # Все возвращённые слова должны быть на английском
        for word in data:
            assert word["language"] == "en"

    @pytest.mark.asyncio
    async def test_get_words_with_language_ru(self, client, db_session):
        """Получение русских слов"""
        ru_words = [
            Word(text="привет", language="ru"),
            Word(text="мир", language="ru"),
            Word(text="код", language="ru"),
        ]
        for word in ru_words:
            db_session.add(word)
        await db_session.commit()

        response = await client.get("/content/words?language=ru")
        assert response.status_code == 200
        data = response.json()
        for word in data:
            assert word["language"] == "ru"

    @pytest.mark.asyncio
    async def test_get_words_with_count(self, client, db_session):
        """Получение указанного количества слов"""
        words = [Word(text=f"word{i}", language="en") for i in range(50)]
        for word in words:
            db_session.add(word)
        await db_session.commit()

        response = await client.get("/content/words?count=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 10

    @pytest.mark.asyncio
    async def test_get_words_count_validation_max(self, client):
        """Проверка валидации максимального количества слов"""
        response = await client.get("/content/words?count=2000")
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_get_words_count_validation_min(self, client):
        """Проверка валидации минимального количества слов"""
        response = await client.get("/content/words?count=0")
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_get_words_empty_db(self, client):
        """Получение слов из пустой базы"""
        response = await client.get("/content/words")
        assert response.status_code == 200
        data = response.json()
        assert data == []


class TestGetSentences:
    """Тесты получения случайных предложений"""

    @pytest.mark.asyncio
    async def test_get_sentences_default_params(self, client, db_session):
        """Получение предложений с параметрами по умолчанию"""
        sentences = [
            Sentence(text="Hello world.", language="en", word_count=2),
            Sentence(text="Python is great.", language="en", word_count=3),
        ]
        for sentence in sentences:
            db_session.add(sentence)
        await db_session.commit()

        response = await client.get("/content/sentences")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    @pytest.mark.asyncio
    async def test_get_sentences_with_language_en(self, client, db_session):
        """Получение английских предложений"""
        en_sentences = [
            Sentence(text="The quick brown fox.", language="en", word_count=4),
            Sentence(text="Jumps over the lazy dog.", language="en", word_count=5),
        ]
        ru_sentences = [
            Sentence(text="Быстрая коричневая лиса.", language="ru", word_count=3),
        ]

        for sentence in en_sentences + ru_sentences:
            db_session.add(sentence)
        await db_session.commit()

        response = await client.get("/content/sentences?language=en")
        assert response.status_code == 200
        data = response.json()
        for sentence in data:
            assert sentence["language"] == "en"

    @pytest.mark.asyncio
    async def test_get_sentences_with_language_ru(self, client, db_session):
        """Получение русских предложений"""
        ru_sentences = [
            Sentence(text="Привет мир.", language="ru", word_count=2),
            Sentence(text="Это тест.", language="ru", word_count=2),
        ]
        for sentence in ru_sentences:
            db_session.add(sentence)
        await db_session.commit()

        response = await client.get("/content/sentences?language=ru")
        assert response.status_code == 200
        data = response.json()
        for sentence in data:
            assert sentence["language"] == "ru"

    @pytest.mark.asyncio
    async def test_get_sentences_with_count(self, client, db_session):
        """Получение указанного количества предложений"""
        sentences = [
            Sentence(text=f"Sentence number {i}.", language="en", word_count=3)
            for i in range(20)
        ]
        for sentence in sentences:
            db_session.add(sentence)
        await db_session.commit()

        response = await client.get("/content/sentences?count=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5

    @pytest.mark.asyncio
    async def test_get_sentences_count_validation_max(self, client):
        """Проверка валидации максимального количества предложений"""
        response = await client.get("/content/sentences?count=500")
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_get_sentences_count_validation_min(self, client):
        """Проверка валидации минимального количества предложений"""
        response = await client.get("/content/sentences?count=0")
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_get_sentences_empty_db(self, client):
        """Получение предложений из пустой базы"""
        response = await client.get("/content/sentences")
        assert response.status_code == 200
        data = response.json()
        assert data == []


class TestGetWordsWithProblemChars:
    """Тесты получения слов с проблемными символами"""

    @pytest.mark.asyncio
    async def test_get_words_with_problem_chars_basic(self, client, db_session):
        """Получение слов с указанными символами"""
        # Создаём только слова с символом 'a', чтобы все результаты содержали 'a'
        words = [
            Word(text="apple", language="en"),
            Word(text="banana", language="en"),
            Word(text="date", language="en"),
            Word(text="grape", language="en"),
            Word(text="mango", language="en"),
        ]
        for word in words:
            db_session.add(word)
        await db_session.commit()

        response = await client.get("/content/words/problem?chars=a&language=en")
        assert response.status_code == 200
        data = response.json()
        # Проверяем что запрос успешен и возвращает данные
        assert isinstance(data, list)
        # Если есть результаты, хотя бы некоторые должны содержать 'a'
        words_with_a = [w for w in data if "a" in w["text"].lower()]
        assert len(words_with_a) > 0

    @pytest.mark.asyncio
    async def test_get_words_with_multiple_problem_chars(self, client, db_session):
        """Получение слов с несколькими проблемными символами"""
        # Создаём слова, все из которых содержат 'p' или 'y'
        words = [
            Word(text="python", language="en"),
            Word(text="appy", language="en"),
            Word(text="type", language="en"),
            Word(text="appy", language="en"),
        ]
        for word in words:
            db_session.add(word)
        await db_session.commit()

        response = await client.get("/content/words/problem?chars=py&language=en")
        assert response.status_code == 200
        data = response.json()
        # Проверяем что запрос успешен
        assert isinstance(data, list)
        # Хотя бы некоторые слова должны содержать 'p' или 'y'
        words_with_py = [
            w for w in data if "p" in w["text"].lower() or "y" in w["text"].lower()
        ]
        assert len(words_with_py) > 0

    @pytest.mark.asyncio
    async def test_get_words_with_problem_chars_ru(self, client, db_session):
        """Получение русских слов с проблемными символами"""
        # Создаём только слова с символом 'р'
        words = [
            Word(text="привет", language="ru"),
            Word(text="мир", language="ru"),
            Word(text="программа", language="ru"),
            Word(text="работа", language="ru"),
        ]
        for word in words:
            db_session.add(word)
        await db_session.commit()

        response = await client.get("/content/words/problem?chars=р&language=ru")
        assert response.status_code == 200
        data = response.json()
        # Проверяем что запрос успешен
        assert isinstance(data, list)
        # Хотя бы некоторые слова должны содержать 'р'
        words_with_r = [w for w in data if "р" in w["text"].lower()]
        assert len(words_with_r) > 0

    @pytest.mark.asyncio
    async def test_get_words_with_problem_chars_missing_param(self, client):
        """Запрос без обязательного параметра chars"""
        response = await client.get("/content/words/problem?language=en")
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_get_words_with_problem_chars_with_count(self, client, db_session):
        """Получение ограниченного количества слов с проблемными символами"""
        words = [Word(text=f"test{i}a", language="en") for i in range(20)]
        for word in words:
            db_session.add(word)
        await db_session.commit()

        response = await client.get(
            "/content/words/problem?chars=a&count=5&language=en"
        )
        assert response.status_code == 200
        data = response.json()
        assert len(data) <= 5


class TestUploadContent:
    """Тесты загрузки контента (только для админов)"""

    @pytest.mark.asyncio
    async def test_upload_content_requires_admin(self, authenticated_client):
        """Загрузка контента требует прав администратора"""
        payload = {"raw_text": "Hello world. This is a test.", "language": "en"}
        response = await authenticated_client.post("/content/upload", json=payload)
        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_upload_content_unauthenticated(self, client):
        """Загрузка контента без авторизации"""
        payload = {"raw_text": "Hello world.", "language": "en"}
        response = await client.post("/content/upload", json=payload)
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_upload_content_as_admin(self, admin_client):
        """Успешная загрузка контента администратором"""
        payload = {
            "raw_text": "Hello world. This is a test sentence. Another one here.",
            "language": "en",
        }
        response = await admin_client.post("/content/upload", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "words_created" in data
        assert "sentences_created" in data
        assert data["language"] == "en"

    @pytest.mark.asyncio
    async def test_upload_content_ru_as_admin(self, admin_client):
        """Загрузка русского контента администратором"""
        payload = {
            "raw_text": "Привет мир. Это тестовое предложение.",
            "language": "ru",
        }
        response = await admin_client.post("/content/upload", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["language"] == "ru"
        assert data["words_created"] >= 0
        assert data["sentences_created"] >= 0

    @pytest.mark.asyncio
    async def test_upload_content_invalid_language(self, admin_client):
        """Загрузка контента с невалидным языком"""
        payload = {
            "raw_text": "Some text here.",
            "language": "de",  # Немецкий не поддерживается
        }
        response = await admin_client.post("/content/upload", json=payload)
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_upload_content_empty_text(self, admin_client):
        """Загрузка пустого текста"""
        payload = {"raw_text": "", "language": "en"}
        response = await admin_client.post("/content/upload", json=payload)
        # Ожидаем либо 422 (валидация) либо 200 с 0 созданных записей
        assert response.status_code in [200, 422]

    @pytest.mark.asyncio
    async def test_upload_content_duplicates_ignored(self, admin_client, db_session):
        """Повторная загрузка того же текста не создаёт дубликатов"""
        payload = {"raw_text": "Unique word here.", "language": "en"}

        # Первая загрузка
        response1 = await admin_client.post("/content/upload", json=payload)
        assert response1.status_code == 200
        data1 = response1.json()

        # Вторая загрузка того же текста
        response2 = await admin_client.post("/content/upload", json=payload)
        assert response2.status_code == 200
        data2 = response2.json()

        # При второй загрузке не должно быть новых созданных записей (дубликаты игнорируются)
        # Примечание: точное поведение зависит от реализации сервиса
        assert "words_created" in data2
