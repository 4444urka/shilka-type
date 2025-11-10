"""
Тесты для API endpoints контента (content/router.py)
"""
import pytest
from sqlalchemy import select

from src.content.models import Word, Sentence


class TestUploadContentEndpoint:
    """Тесты эндпоинта загрузки текста"""
    
    @pytest.mark.asyncio
    async def test_upload_text_success_as_admin(self, admin_client, db_session):
        """Админ успешно загружает текст"""
        payload = {
            "raw_text": "Привет мир! Это тестовое предложение. Ещё одно здесь.",
            "language": "ru"
        }
        
        response = await admin_client.post("/content/upload", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "words_created" in data
        assert "sentences_created" in data
        assert data["language"] == "ru"
        assert data["words_created"] > 0
        assert data["sentences_created"] > 0
    
    @pytest.mark.asyncio
    async def test_upload_text_forbidden_for_regular_user(self, authenticated_client):
        """Обычный пользователь не может загружать текст"""
        payload = {
            "raw_text": "Привет мир! Это тест.",
            "language": "ru"
        }
        
        response = await authenticated_client.post("/content/upload", json=payload)
        
        assert response.status_code == 403
    
    @pytest.mark.asyncio
    async def test_upload_text_unauthorized(self, client):
        """Неавторизованный пользователь не может загружать текст"""
        payload = {
            "raw_text": "Привет мир! Это тест.",
            "language": "ru"
        }
        
        response = await client.post("/content/upload", json=payload)
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_upload_english_text(self, admin_client):
        """Загрузка английского текста"""
        payload = {
            "raw_text": "Hello world! This is a test sentence. Another one here.",
            "language": "en"
        }
        
        response = await admin_client.post("/content/upload", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["language"] == "en"
        assert data["words_created"] > 0
        assert data["sentences_created"] > 0
    
    @pytest.mark.asyncio
    async def test_upload_empty_text(self, admin_client):
        """Загрузка пустого текста"""
        payload = {
            "raw_text": "",
            "language": "ru"
        }
        
        response = await admin_client.post("/content/upload", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["words_created"] == 0
        assert data["sentences_created"] == 0
    
    @pytest.mark.asyncio
    async def test_upload_invalid_language(self, admin_client):
        """Загрузка с невалидным языком"""
        payload = {
            "raw_text": "Some text here.",
            "language": "invalid"
        }
        
        response = await admin_client.post("/content/upload", json=payload)
        
        # Должна быть ошибка валидации (422)
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_upload_missing_fields(self, admin_client):
        """Загрузка без обязательных полей"""
        response = await admin_client.post("/content/upload", json={})
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_upload_duplicate_content_skipped(self, admin_client):
        """Повторная загрузка того же текста пропускает дубликаты"""
        payload = {
            "raw_text": "Привет мир! Это тестовое предложение здесь.",
            "language": "ru"
        }
        
        # Первая загрузка
        response1 = await admin_client.post("/content/upload", json=payload)
        data1 = response1.json()
        
        # Вторая загрузка того же текста
        response2 = await admin_client.post("/content/upload", json=payload)
        data2 = response2.json()
        
        assert response2.status_code == 200
        assert data2["words_created"] == 0
        assert data2["sentences_created"] == 0


class TestGetRandomWordsEndpoint:
    """Тесты эндпоинта получения случайных слов"""
    
    @pytest.mark.asyncio
    async def test_get_random_words_success(self, client, db_session):
        """Успешное получение случайных слов"""
        # Создаём тестовые слова
        for i in range(10):
            word = Word(language="ru", text=f"слово{i}", is_active=True)
            db_session.add(word)
        await db_session.commit()
        
        response = await client.get("/content/words?language=ru&count=5")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        assert all("text" in word for word in data)
        assert all(word["language"] == "ru" for word in data)
    
    @pytest.mark.asyncio
    async def test_get_random_words_default_count(self, client, db_session):
        """Получение слов с количеством по умолчанию (25)"""
        # Создаём 30 слов
        for i in range(30):
            word = Word(language="ru", text=f"слово{i}", is_active=True)
            db_session.add(word)
        await db_session.commit()
        
        response = await client.get("/content/words?language=ru")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 25  # Значение по умолчанию
    
    @pytest.mark.asyncio
    async def test_get_random_words_filters_by_language(self, client, db_session):
        """Фильтрация слов по языку"""
        # Создаём русские и английские слова
        for i in range(10):
            word_ru = Word(language="ru", text=f"слово{i}", is_active=True)
            word_en = Word(language="en", text=f"word{i}", is_active=True)
            db_session.add(word_ru)
            db_session.add(word_en)
        await db_session.commit()
        
        response_ru = await client.get("/content/words?language=ru&count=20")
        response_en = await client.get("/content/words?language=en&count=20")
        
        assert response_ru.status_code == 200
        assert response_en.status_code == 200
        
        words_ru = response_ru.json()
        words_en = response_en.json()
        
        assert all(w["language"] == "ru" for w in words_ru)
        assert all(w["language"] == "en" for w in words_en)
    
    @pytest.mark.asyncio
    async def test_get_random_words_empty_database(self, client):
        """Получение слов из пустой БД"""
        response = await client.get("/content/words?language=ru&count=5")
        
        assert response.status_code == 200
        data = response.json()
        assert data == []
    
    @pytest.mark.asyncio
    async def test_get_random_words_invalid_language(self, client):
        """Получение слов с невалидным языком"""
        response = await client.get("/content/words?language=invalid&count=5")
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_get_random_words_invalid_count(self, client):
        """Получение слов с невалидным количеством"""
        response = await client.get("/content/words?language=ru&count=-5")
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_get_random_words_only_active(self, client, db_session):
        """Возвращаются только активные слова"""
        # Создаём активные и неактивные слова
        for i in range(5):
            word_active = Word(language="ru", text=f"активное{i}", is_active=True)
            word_inactive = Word(language="ru", text=f"неактивное{i}", is_active=False)
            db_session.add(word_active)
            db_session.add(word_inactive)
        await db_session.commit()
        
        response = await client.get("/content/words?language=ru&count=10")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5  # Только активные
        assert all(w["is_active"] for w in data)


class TestGetRandomSentencesEndpoint:
    """Тесты эндпоинта получения случайных предложений"""
    
    @pytest.mark.asyncio
    async def test_get_random_sentences_success(self, client, db_session):
        """Успешное получение случайных предложений"""
        # Создаём тестовые предложения
        for i in range(10):
            sentence = Sentence(
                language="ru",
                text=f"Это тестовое предложение номер {i}.",
                word_count=5,
                is_active=True
            )
            db_session.add(sentence)
        await db_session.commit()
        
        response = await client.get("/content/sentences?language=ru&count=3")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3
        assert all("text" in sent for sent in data)
        assert all(sent["language"] == "ru" for sent in data)
        assert all("word_count" in sent for sent in data)
    
    @pytest.mark.asyncio
    async def test_get_random_sentences_default_count(self, client, db_session):
        """Получение предложений с количеством по умолчанию (10)"""
        # Создаём 15 предложений
        for i in range(15):
            sentence = Sentence(
                language="ru",
                text=f"Это предложение номер {i} здесь.",
                word_count=5,
                is_active=True
            )
            db_session.add(sentence)
        await db_session.commit()
        
        response = await client.get("/content/sentences?language=ru")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 10  # Значение по умолчанию
    
    @pytest.mark.asyncio
    async def test_get_random_sentences_filters_by_language(self, client, db_session):
        """Фильтрация предложений по языку"""
        # Создаём русские и английские предложения
        for i in range(5):
            sent_ru = Sentence(
                language="ru",
                text=f"Это русское предложение номер {i}.",
                word_count=5,
                is_active=True
            )
            sent_en = Sentence(
                language="en",
                text=f"This is English sentence number {i}.",
                word_count=5,
                is_active=True
            )
            db_session.add(sent_ru)
            db_session.add(sent_en)
        await db_session.commit()
        
        response_ru = await client.get("/content/sentences?language=ru&count=10")
        response_en = await client.get("/content/sentences?language=en&count=10")
        
        assert response_ru.status_code == 200
        assert response_en.status_code == 200
        
        sentences_ru = response_ru.json()
        sentences_en = response_en.json()
        
        assert all(s["language"] == "ru" for s in sentences_ru)
        assert all(s["language"] == "en" for s in sentences_en)
    
    @pytest.mark.asyncio
    async def test_get_random_sentences_empty_database(self, client):
        """Получение предложений из пустой БД"""
        response = await client.get("/content/sentences?language=ru&count=5")
        
        assert response.status_code == 200
        data = response.json()
        assert data == []
    
    @pytest.mark.asyncio
    async def test_get_random_sentences_only_active(self, client, db_session):
        """Возвращаются только активные предложения"""
        # Создаём активные и неактивные предложения
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
        
        response = await client.get("/content/sentences?language=ru&count=10")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5  # Только активные
        assert all(s["is_active"] for s in data)
    
    @pytest.mark.asyncio
    async def test_get_random_sentences_invalid_language(self, client):
        """Получение предложений с невалидным языком"""
        response = await client.get("/content/sentences?language=invalid&count=5")
        
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_get_random_sentences_invalid_count(self, client):
        """Получение предложений с невалидным количеством"""
        response = await client.get("/content/sentences?language=ru&count=0")
        
        assert response.status_code == 422


class TestContentIntegration:
    """Интеграционные тесты модуля контента"""
    
    @pytest.mark.asyncio
    async def test_full_workflow_upload_and_retrieve(self, admin_client, client, db_session):
        """Полный цикл: загрузка текста и получение контента"""
        # 1. Админ загружает текст
        upload_payload = {
            "raw_text": "Привет мир! Это тест системы контента. Проверяем работу API здесь.",
            "language": "ru"
        }
        
        upload_response = await admin_client.post("/content/upload", json=upload_payload)
        assert upload_response.status_code == 200
        upload_data = upload_response.json()
        
        words_created = upload_data["words_created"]
        sentences_created = upload_data["sentences_created"]
        
        assert words_created > 0
        assert sentences_created > 0
        
        # 2. Любой пользователь получает слова
        words_response = await client.get(f"/content/words?language=ru&count={words_created}")
        assert words_response.status_code == 200
        words = words_response.json()
        assert len(words) == words_created
        
        # 3. Любой пользователь получает предложения
        sentences_response = await client.get(f"/content/sentences?language=ru&count={sentences_created}")
        assert sentences_response.status_code == 200
        sentences = sentences_response.json()
        assert len(sentences) == sentences_created
    
    @pytest.mark.asyncio
    async def test_language_isolation(self, admin_client, client):
        """Изоляция контента по языкам"""
        # Загружаем русский и английский контент
        ru_payload = {
            "raw_text": "Привет мир! Это тест на русском языке.",
            "language": "ru"
        }
        en_payload = {
            "raw_text": "Hello world! This is a test in English language.",
            "language": "en"
        }
        
        await admin_client.post("/content/upload", json=ru_payload)
        await admin_client.post("/content/upload", json=en_payload)
        
        # Проверяем что русский запрос возвращает только русский контент
        ru_words_response = await client.get("/content/words?language=ru&count=50")
        ru_words = ru_words_response.json()
        assert all(w["language"] == "ru" for w in ru_words)
        
        # Проверяем что английский запрос возвращает только английский контент
        en_words_response = await client.get("/content/words?language=en&count=50")
        en_words = en_words_response.json()
        assert all(w["language"] == "en" for w in en_words)
