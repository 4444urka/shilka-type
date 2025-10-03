# Dockerfile for Render deployment (in repository root)
# Используем официальный Python образ
FROM python:3.13-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем файлы зависимостей из backend папки
COPY backend/pyproject.toml backend/poetry.lock ./

# Устанавливаем Poetry
RUN pip install --no-cache-dir poetry==1.8.3

# Настраиваем Poetry для установки в системное окружение
RUN poetry config virtualenvs.create false

# Устанавливаем только production зависимости
RUN poetry install --only=main --no-interaction --no-ansi

# Копируем файлы приложения из backend папки
COPY backend/ .

# Запускаем миграции
RUN poetry run alembic upgrade head

# Создаем пользователя для безопасности
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Открываем порт для FastAPI
EXPOSE 10000

# Команда запуска приложения (используем sh для переменной окружения)
CMD ["sh", "-c", "poetry run uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-10000}"]