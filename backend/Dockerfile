# Используем официальный Python образ
FROM python:3.13-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем файлы зависимостей
COPY pyproject.toml poetry.lock ./

# Устанавливаем Poetry
RUN pip install --no-cache-dir poetry==1.8.3

# Настраиваем Poetry для установки в системное окружение
RUN poetry config virtualenvs.create false

# Устанавливаем только production зависимости
RUN poetry install --only=main --no-interaction --no-ansi

# Копируем остальные файлы приложения
COPY . .

# Создаем пользователя для безопасности
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Открываем порт для FastAPI
EXPOSE 8000

# Команда запуска приложения (без --reload для продакшена)
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
