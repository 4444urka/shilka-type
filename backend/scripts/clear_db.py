"""
Скрипт для очистки тестовых данных из базы данных
Использование:
    python -m scripts.clear_db
"""
from sqlalchemy.orm import Session

from src.database import SessionLocal, engine
from src.auth.models import User
from src.stats.models import TypingSession


def clear_all_data(db: Session):
    """Удаляет все данные из таблиц"""
    print("🗑️  Удаляем все сессии печати...")
    deleted_sessions = db.query(TypingSession).delete()
    print(f"✓ Удалено {deleted_sessions} сессий")
    
    print("\n🗑️  Удаляем всех пользователей...")
    deleted_users = db.query(User).delete()
    print(f"✓ Удалено {deleted_users} пользователей")
    
    db.commit()


def clear_test_data(db: Session):
    """Удаляет только тестовые данные (пользователи с паролем password123)"""
    print("🗑️  Удаляем тестовые сессии печати...")
    
    # Получаем ID тестовых пользователей
    test_users = db.query(User).filter(
        User.username.like('%typer%') |
        User.username.like('%fingers%') |
        User.username.like('%ninja%') |
        User.username.like('%master%') |
        User.username.like('%writer%') |
        User.username.like('%wizard%') |
        User.username.like('%champion%') |
        User.username.like('%swift%') |
        User.username.like('%blazing%')
    ).all()
    
    test_user_ids = [user.id for user in test_users]
    
    if test_user_ids:
        deleted_sessions = db.query(TypingSession).filter(
            TypingSession.user_id.in_(test_user_ids)
        ).delete(synchronize_session=False)
        print(f"✓ Удалено {deleted_sessions} тестовых сессий")
        
        print("\n🗑️  Удаляем тестовых пользователей...")
        deleted_users = db.query(User).filter(
            User.id.in_(test_user_ids)
        ).delete(synchronize_session=False)
        print(f"✓ Удалено {deleted_users} тестовых пользователей")
    else:
        print("ℹ️  Тестовые данные не найдены")
    
    db.commit()


def main():
    """Основная функция для очистки данных"""
    print("🧹 Начинаем очистку базы данных...\n")
    
    # Создаем сессию БД
    db = SessionLocal()
    
    try:
        # Спрашиваем, что удалять
        print("Выберите режим очистки:")
        print("1. Удалить только тестовые данные")
        print("2. Удалить ВСЕ данные (осторожно!)")
        choice = input("\nВведите номер (1 или 2): ").strip()
        
        if choice == "1":
            clear_test_data(db)
        elif choice == "2":
            confirm = input("\n⚠️  Вы уверены? Это удалит ВСЕ данные! (yes/no): ").strip().lower()
            if confirm == "yes":
                clear_all_data(db)
            else:
                print("❌ Операция отменена")
                return
        else:
            print("❌ Неверный выбор")
            return
        
        print("\n✅ Очистка базы данных завершена успешно!")
        
        # Показываем статистику
        print("\n📊 Текущая статистика:")
        total_users = db.query(User).count()
        total_sessions = db.query(TypingSession).count()
        print(f"  - Пользователей в БД: {total_users}")
        print(f"  - Сессий в БД: {total_sessions}")
        
    except Exception as e:
        print(f"\n❌ Ошибка при очистке данных: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
