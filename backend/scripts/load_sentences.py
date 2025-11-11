"""
Скрипт для загрузки предложений из sentences.json в базу данных через API загрузки контента.
Запуск: python -m scripts.load_sentences
"""
import asyncio
import json
import sys
from pathlib import Path

# Добавляем корневую директорию в путь
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from src.database import AsyncSessionLocal
from src.content.service import upload_text_content
import src.stats.models  # ensure TypingSession and related models are registered before importing User
from src.auth.models import User, Role
from sqlalchemy import select

async def load_sentences_from_json():
    """Загружает предложения из sentences.json через сервис загрузки контента"""
    
    # Путь к файлу с предложениями (в той же директории, что и скрипт)
    json_path = Path(__file__).parent / "sentences.json"
    
    print(f"🔍 Ищем файл по пути: {json_path}")
    
    if not json_path.exists():
        print(f"❌ Файл не найден: {json_path}")
        print(f"   Скопируйте файл командой:")
        print(f"   cp frontend/src/utils/russian_sentences/sentences.json backend/scripts/")
        return
    
    print(f"📂 Загружаем предложения из: {json_path}")
    
    # Читаем JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    sentences = data.get("sentences", [])
    
    if not sentences:
        print("⚠️  В файле нет предложений")
        return
    
    print(f"📊 Найдено предложений: {len(sentences)}")
    
    # Объединяем все предложения в один текст
    raw_text = "\n".join(sentences)
    
    async with AsyncSessionLocal() as session:
        # Получаем первого админа для выполнения операции
        result = await session.execute(
            select(User).where(User.role == Role.ADMIN).limit(1)
        )
        admin_user = result.scalar_one_or_none()
        
        if not admin_user:
            print("❌ В базе данных нет пользователя с ролью ADMIN")
            print("   Создайте пользователя с ролью ADMIN или измените роль существующего пользователя")
            return
        
        print(f"👤 Используем пользователя: {admin_user.username} (ID: {admin_user.id})")
        
        try:
            # Загружаем текст через сервис
            print("⏳ Обработка текста и загрузка в базу данных...")
            words_count, sentences_count = await upload_text_content(
                db=session,
                raw_text=raw_text,
                language="ru"
            )
            
            print("\n✅ Успешно загружено!")
            print(f"   📝 Слов: {words_count}")
            print(f"   📄 Предложений: {sentences_count}")
            
        except Exception as e:
            print(f"\n❌ Ошибка при загрузке: {e}")
            raise


if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Скрипт загрузки предложений из sentences.json")
    print("=" * 60)
    print()
    
    asyncio.run(load_sentences_from_json())
    
    print()
    print("=" * 60)
    print("✨ Готово!")
    print("=" * 60)
