"""
Скрипт для генерации тестовых данных в базу данных
Использование:
    python -m scripts.seed_db
"""
import json
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from src.database import SessionLocal, engine, Base
from src.auth.models import User
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


def seed_users(db: Session, count: int = 10) -> list[User]:
    """Создает тестовых пользователей"""
    users = []
    
    for i in range(count):
        username = f"{random.choice(USERNAMES)}{random.randint(1, 999)}"
        
        # Проверяем, что пользователь не существует
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            continue
        
        user = User(
            username=username,
            hashed_password=get_password_hash("password123"),  # Простой пароль для тестов
            shilka_coins=random.randint(0, 1000)
        )
        
        db.add(user)
        users.append(user)
    
    db.commit()
    
    # Обновляем ID пользователей
    for user in users:
        db.refresh(user)
    
    return users


def seed_sessions(db: Session, users: list[User], sessions_per_user: int = 20):
    """Создает тестовые сессии печати для пользователей"""
    for user in users:
        for day in range(sessions_per_user):
            # Генерируем от 1 до 3 сессий за день
            sessions_today = random.randint(1, 3)
            
            for _ in range(sessions_today):
                session = generate_typing_session(user.id, days_ago=day)
                db.add(session)
        
        print(f"✓ Создано {sessions_per_user * 2} сессий для пользователя {user.username}")
    
    db.commit()
    print(f"\n✓ Всего создано {sessions_per_user * 2 * len(users)} сессий")


def main():
    """Основная функция для генерации тестовых данных"""
    print("🌱 Начинаем генерацию тестовых данных...\n")
    
    # Создаем таблицы, если их нет
    Base.metadata.create_all(bind=engine)
    
    # Создаем сессию БД
    db = SessionLocal()
    
    try:
        # Генерируем пользователей
        print("👥 Создаем тестовых пользователей...")
        users = seed_users(db, count=10)
        print(f"✓ Создано {len(users)} пользователей\n")
        
        # Генерируем сессии печати
        print("⌨️  Создаем тестовые сессии печати...")
        seed_sessions(db, users, sessions_per_user=20)
        
        print("\n✅ Генерация тестовых данных завершена успешно!")
        print("\n📊 Статистика:")
        total_users = db.query(User).count()
        total_sessions = db.query(TypingSession).count()
        print(f"  - Всего пользователей в БД: {total_users}")
        print(f"  - Всего сессий в БД: {total_sessions}")
        
    except Exception as e:
        print(f"\n❌ Ошибка при генерации данных: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
