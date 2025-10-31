"""
Скрипт для генерации тестовых данных в базу данных
Использование:
    python -m scripts.seed_db
"""
import asyncio
import json
import random
from datetime import datetime, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import AsyncSessionLocal, engine, Base
from src.auth.models import User
from src.theme.models import Theme
from src.stats.models import TypingSession
from src.auth.utils import get_password_hash


# Списки для генерации
USERNAMES = [
    "speedtyper", "fastfingers", "keyboardninja", "typingmaster", "quickwriter",
    "codewizard", "textchampion", "rapidtyper", "swiftkeys", "blazingkeys"
]

WORDS_RU = [
    "привет", "мир", "код", "программа", "компьютер", "клавиатура", "текст", 
    "скорость", "точность", "тренировка", "быстро", "печать", "слово", "буква"
]

WORDS_EN = [
    "hello", "world", "code", "program", "computer", "keyboard", "text",
    "speed", "accuracy", "training", "fast", "typing", "word", "letter"
]

MODES = ["words", "time", "sentences", "quote"]
LANGUAGES = ["ru", "en"]


def generate_random_history(words: list[str]) -> list[list[dict]]:
    """Генерирует случайную историю печати для слов"""
    history = []
    current_time = 0
    
    for word in words:
        word_history = []
        for char in word:
            # Случайное время между нажатиями (50-200 мс)
            current_time += random.randint(50, 200)
            # 90% правильных нажатий
            correct = random.random() > 0.1
            word_history.append({
                "char": char,
                "correct": correct,
                "time": current_time
            })
        history.append(word_history)
    
    return history


def generate_typing_session(user_id: int, days_ago: int = 0) -> TypingSession:
    """Генерирует одну случайную сессию печати"""
    # Случайный режим и язык
    mode = random.choice(MODES)
    language = random.choice(LANGUAGES)
    
    # Выбираем слова в зависимости от языка
    word_list = WORDS_RU if language == "ru" else WORDS_EN
    num_words = random.randint(10, 30)
    words = random.choices(word_list, k=num_words)
    
    # Генерируем историю
    history = generate_random_history(words)
    
    # Вычисляем метрики
    total_chars = sum(len(word) for word in words)
    correct_chars = sum(
        sum(1 for char in word_hist if char["correct"])
        for word_hist in history
    )
    
    # Случайная скорость (40-120 WPM)
    wpm = round(random.uniform(40, 120), 1)
    
    # Точность (85-100%)
    accuracy = round((correct_chars / total_chars) * 100, 1) if total_chars > 0 else 100
    
    # Длительность (15-60 секунд)
    duration = random.randint(15, 60)
    
    # Дата создания (от сегодня до N дней назад)
    created_at = datetime.utcnow() - timedelta(days=days_ago, hours=random.randint(0, 23))
    
    return TypingSession(
        user_id=user_id,
        wpm=wpm,
        accuracy=accuracy,
        duration=duration,
        words=json.dumps(words),
        history=json.dumps(history),
        typing_mode=mode,
        language=language,
        created_at=created_at
    )


async def seed_users(db: AsyncSession, count: int = 10) -> list[User]:
    """Создает тестовых пользователей"""
    users = []
    
    for i in range(count):
        username = f"{random.choice(USERNAMES)}{random.randint(1, 999)}"
        
        # Проверяем, что пользователь не существует
        result = await db.execute(select(User).filter(User.username == username))
        existing = result.scalar_one_or_none()
        if existing:
            continue
        
        user = User(
            username=username,
            hashed_password=get_password_hash("password123"),  # Простой пароль для тестов
            shilka_coins=random.randint(0, 1000)
            ,
            # Значения по умолчанию для настроек
            default_time=30,
            default_words=25,
            default_language="en",
            default_mode="words",
            default_test_type="time",
        )
        
        db.add(user)
        users.append(user)
    
    await db.commit()
    
    # Обновляем ID пользователей
    for user in users:
        await db.refresh(user)
    
    return users


async def seed_themes(db: AsyncSession, users: list[User], count: int = 5) -> list[Theme]:
    """Создаёт несколько тестовых тем и назначает авторов"""
    themes = []
    sample_theme_data = {
        "colors": {"bg": "#ffffff", "text": "#000000", "primary": "#ff6600"},
        "font": "Inter",
    }

    for i in range(count):
        author = random.choice(users)
        theme = Theme(
            name=f"Theme {i+1}",
            author_id=author.id,
            theme_data=json.dumps(sample_theme_data),
            is_public=True,
            created_at=datetime.utcnow(),
        )
        db.add(theme)
        themes.append(theme)

    await db.commit()
    for t in themes:
        await db.refresh(t)

    return themes


async def seed_sessions(db: AsyncSession, users: list[User], sessions_per_user: int = 20):
    """Создает тестовые сессии печати для пользователей"""
    total_created = 0
    for user in users:
        created_for_user = 0
        for day in range(sessions_per_user):
            # Генерируем от 1 до 3 сессий за день
            sessions_today = random.randint(1, 3)

            for _ in range(sessions_today):
                session = generate_typing_session(user.id, days_ago=day)
                db.add(session)
                created_for_user += 1

        total_created += created_for_user
        print(f"✓ Создано {created_for_user} сессий для пользователя {user.username}")

    await db.commit()
    print(f"\n✓ Всего создано {total_created} сессий")


async def main():
    """Основная функция для генерации тестовых данных"""
    print("🌱 Начинаем генерацию тестовых данных...\n")
    
    # Создаем таблицы, если их нет
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Создаем async сессию БД
    async with AsyncSessionLocal() as db:
        try:
            # Генерируем пользователей
            print("👥 Создаем тестовых пользователей...")
            users = await seed_users(db, count=10)
            print(f"✓ Создано {len(users)} пользователей\n")
            # Создаём тестовые темы и связываем некоторые с пользователями
            print("🎨 Создаём тестовые темы...")
            themes = await seed_themes(db, users, count=5)
            print(f"✓ Создано {len(themes)} тем\n")

            # Назначаем случайные выбранные темы пользователям (примерно половине)
            for user in users:
                if themes and random.random() > 0.5:
                    chosen = random.choice(themes)
                    user.selected_theme_id = chosen.id
                    db.add(user)
            await db.commit()
            
            # Генерируем сессии печати
            print("⌨️  Создаем тестовые сессии печати...")
            await seed_sessions(db, users, sessions_per_user=20)
            
            print("\n✅ Генерация тестовых данных завершена успешно!")
            print("\n📊 Статистика:")
            
            # Подсчитываем общее количество
            result_users = await db.execute(select(User))
            total_users = len(result_users.scalars().all())
            
            result_sessions = await db.execute(select(TypingSession))
            total_sessions = len(result_sessions.scalars().all())
            
            print(f"  - Всего пользователей в БД: {total_users}")
            print(f"  - Всего сессий в БД: {total_sessions}")
            
        except Exception as e:
            print(f"\n❌ Ошибка при генерации данных: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(main())
