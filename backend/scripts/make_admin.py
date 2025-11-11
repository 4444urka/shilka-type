"""
Скрипт для назначения пользователя администратором.
Использование:
    # В интерактивном режиме
    python -m scripts.make_admin

    # Передать username и подтвердить автоматически
    python -m scripts.make_admin --username someuser --yes

Скрипт использует тот же AsyncSessionLocal, что и остальные скрипты в `backend/src/database`.
"""
import argparse
import asyncio
import sys
from sqlalchemy import select

from src.database import AsyncSessionLocal
from src.auth.models import User
import src.stats.models 
import src.theme.models 


async def make_admin(username: str) -> int:
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(User).where(User.username == username))
            user = result.scalar_one_or_none()
            if not user:
                print(f"Пользователь с username='{username}' не найден.")
                return 2

            old_role = getattr(user, "role", None)
            if old_role == "admin":
                print(f"Пользователь '{username}' уже имеет роль 'admin'.")
                return 0

            user.role = "admin"
            db.add(user)
            await db.commit()
            await db.refresh(user)

            print(f"✓ Успешно: пользователь '{username}' назначен администратором.")
            return 0
        except Exception as e:
            await db.rollback()
            print(f"Ошибка при назначении администратора: {e}")
            return 1


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Назначить пользователя администратором (role='admin')")
    parser.add_argument("--username", "-u", help="username пользователя")
    parser.add_argument("--yes", "-y", action="store_true", help="Подтвердить без запроса")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    username = args.username
    if not username:
        try:
            username = input("Введите username пользователя: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nОтменено")
            sys.exit(2)

    if not username:
        print("Username не задан.")
        sys.exit(2)

    if not args.yes:
        try:
            conf = input(f"Сделать пользователя '{username}' админом? [y/N]: ").strip().lower()
        except (KeyboardInterrupt, EOFError):
            print("\nОтменено")
            sys.exit(2)
        if conf not in ("y", "yes"):
            print("Отменено пользователем.")
            sys.exit(0)

    code = asyncio.run(make_admin(username))
    sys.exit(code)


if __name__ == "__main__":
    main()
