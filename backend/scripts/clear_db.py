"""
Скрипт для очистки тестовых данных из базы данных
Использование:
    python -m scripts.clear_db
"""
import asyncio
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import AsyncSessionLocal
from src.auth.models import User
from src.stats.models import TypingSession


async def clear_all_data(db: AsyncSession):
    """Удаляет все данные из таблиц"""
    print("🗑️  Удаляем все сессии печати...")
    result = await db.execute(delete(TypingSession))
    print(f"✓ Удалено {result.rowcount} сессий")
    
    print("\n🗑️  Удаляем всех пользователей...")
    result = await db.execute(delete(User))
    print(f"✓ Удалено {result.rowcount} пользователей")
    
    await db.commit()


async def clear_test_data(db: AsyncSession):
    """Удаляет только тестовые данные (пользователи с паролем password123)"""
    print("🗑️  Удаляем тестовые сессии печати...")
    
    # Получаем ID тестовых пользователей
    result = await db.execute(
        select(User).filter(
            User.username.like('%typer%') |
            User.username.like('%fingers%') |
            User.username.like('%ninja%') |
            User.username.like('%master%') |
            User.username.like('%writer%') |
            User.username.like('%wizard%') |
            User.username.like('%champion%') |
            User.username.like('%swift%') |
            User.username.like('%blazing%')
        )
    )
    test_users = result.scalars().all()
    test_user_ids = [user.id for user in test_users]
    
    if test_user_ids:
        result = await db.execute(
            delete(TypingSession).filter(
                TypingSession.user_id.in_(test_user_ids)
            )
        )
        print(f"✓ Удалено {result.rowcount} тестовых сессий")
        
        print("\n🗑️  Удаляем тестовых пользователей...")
        result = await db.execute(
            delete(User).filter(User.id.in_(test_user_ids))
        )
        print(f"✓ Удалено {result.rowcount} тестовых пользователей")
    else:
        print("ℹ️  Тестовые данные не найдены")
    
    await db.commit()


async def main():
    """Основная функция для очистки данных"""
    print("🧹 Начинаем очистку базы данных...\n")
    
    # Спрашиваем, что удалять
    print("Выберите режим очистки:")
    print("1. Удалить только тестовые данные")
    print("2. Удалить ВСЕ данные (осторожно!)")
    choice = input("\nВведите номер (1 или 2): ").strip()
    
    # Создаем async сессию БД
    async with AsyncSessionLocal() as db:
        try:
            if choice == "1":
                await clear_test_data(db)
            elif choice == "2":
                confirm = input("\n⚠️  Вы уверены? Это удалит ВСЕ данные! (yes/no): ").strip().lower()
                if confirm == "yes":
                    await clear_all_data(db)
                else:
                    print("❌ Операция отменена")
                    return
            else:
                print("❌ Неверный выбор")
                return
            
            print("\n✅ Очистка базы данных завершена успешно!")
            
            # Показываем статистику
            print("\n📊 Текущая статистика:")
            result_users = await db.execute(select(User))
            total_users = len(result_users.scalars().all())
            
            result_sessions = await db.execute(select(TypingSession))
            total_sessions = len(result_sessions.scalars().all())
            
            print(f"  - Пользователей в БД: {total_users}")
            print(f"  - Сессий в БД: {total_sessions}")
            
        except Exception as e:
            print(f"\n❌ Ошибка при очистке данных: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(main())
