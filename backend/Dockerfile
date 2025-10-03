# Используем официальный Python образ
FROM python:3.13-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Копируем файлы зависимостей
COPY pyproject.toml poetry.lock ./

# Устанавливаем Poetry
RUN pip install --no-cache-dir poetry==1.8.3

# Настраиваем Poetry для установки в системное окружение
RUN poetry config virtualenvs.create false

# Настраиваем pip для увеличенного таймаута (используется Poetry внутри)
ENV PIP_DEFAULT_TIMEOUT=600

# Устанавливаем ВСЕ зависимости (включая dev для тестов) с повторными попытками
RUN poetry install --no-interaction --no-ansi || \
    (sleep 5 && poetry install --no-interaction --no-ansi) || \
    (sleep 10 && poetry install --no-interaction --no-ansi)

# Копируем остальные файлы приложения
COPY . .

# Открываем порт для FastAPI
EXPOSE 8000

# Команда запуска приложения
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
