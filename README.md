# 🎯 Shilka Type

Веб-приложение для тренировки слепой печати с отслеживанием прогресса и статистики.

## 📋 Описание

Shilka Type - это современное веб-приложение для развития навыков печати. Приложение позволяет пользователям практиковаться в наборе текста, отслеживать свою статистику (WPM, точность) и следить за прогрессом во времени.

## 🚀 Технологический стек

### Frontend

- **React 19** - UI библиотека
- **TypeScript** - типизация
- **Vite 7** - сборщик и dev-сервер
- **Chakra UI v3** - компонентная библиотека
- **Axios** - HTTP клиент
- **Typed.js** - анимация текста
- **Framer Motion** - анимации

### Backend

- **FastAPI** - веб-фреймворк
- **SQLAlchemy** - ORM
- **Alembic** - миграции БД
- **PostgreSQL** - база данных
- **Poetry** - управление зависимостями Python

### DevOps

- **Docker & Docker Compose** - контейнеризация
- **Nginx** - веб-сервер (продакшен)

## 📦 Установка и запуск

### Требования

- Node.js 20.19.0+ или 22.12.0+
- Python 3.11+
- Docker и Docker Compose (для контейнерного запуска)
- Yarn (рекомендуется)

### Локальная разработка

#### Frontend

```bash
cd frontend
yarn install
yarn dev
```

Приложение будет доступно по адресу: http://localhost:5173

#### Backend

```bash
cd backend
poetry install
poetry run alembic upgrade head
poetry run uvicorn src.main:app --reload
```

API будет доступно по адресу: http://localhost:8000

### Docker (полный стек)

#### Разработка

```bash
docker-compose up --build
```

#### Продакшен

```bash
docker-compose -f docker-compose.prod.yml up --build
```

## 🏗️ Структура проекта

```
shilka-type/
├── frontend/              # React приложение
│   ├── src/
│   │   ├── api/          # API клиенты
│   │   ├── components/   # React компоненты
│   │   ├── hooks/        # Кастомные хуки
│   │   ├── pages/        # Страницы приложения
│   │   ├── services/     # Сервисы
│   │   ├── slices/       # Redux slices
│   │   ├── store/        # Redux store
│   │   ├── types/        # TypeScript типы
│   │   └── utils/        # Утилиты
│   └── tests/            # Тесты
├── backend/              # FastAPI приложение
│   ├── src/
│   │   ├── auth/        # Аутентификация
│   │   ├── stats/       # Статистика
│   │   ├── config.py    # Конфигурация
│   │   ├── database.py  # Подключение к БД
│   │   └── main.py      # Точка входа
│   ├── migrations/      # Alembic миграции
│   └── tests/           # Тесты
└── docker-compose.yml   # Docker конфигурация
```

## 🧪 Тестирование

### Frontend

```bash
cd frontend
yarn test
```

### Backend

```bash
cd backend
poetry run pytest
```

## 🔧 Переменные окружения

### Frontend

Создайте `.env` файл в директории `frontend/`:

```env
VITE_API_URL=http://localhost:8000
```

### Backend

Создайте `.env` файл в директории `backend/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/shilkatype
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 📝 API Документация

После запуска backend, API документация доступна по адресам:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🎮 Основные функции

- ✅ Регистрация и аутентификация пользователей
- ✅ Различные режимы печати (typing_mode)
- ✅ Поддержка разных языков
- ✅ Отслеживание WPM (слов в минуту)
- ✅ Расчет точности печати
- ✅ История тренировок
- ✅ Система внутренней валюты (Shilka Coins)
- ✅ Темная/светлая тема

## 🤝 Вклад в проект

1. Fork проекта
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 👥 Авторы

- [@4444urka](https://github.com/4444urka)

## 🔗 Ссылки

- [GitHub Repository](https://github.com/4444urka/shilka-type)
