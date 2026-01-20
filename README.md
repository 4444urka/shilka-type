# Shilka Type

Веб-приложение для тренировки слепой печати с отслеживанием прогресса и статистики.

## Описание

Shilka Type - это современное веб-приложение для развития навыков печати. Приложение позволяет пользователям практиковаться в наборе текста, отслеживать свою статистику (WPM, точность) и следить за прогрессом во времени.

## Технологический стек

### Frontend

- **React 19** - UI библиотека
- **TypeScript** - типизация
- **Vite 7** - сборщик и dev-сервер
- **Chakra UI v3** - компонентная библиотека
- **Redux Toolkit** - управление состоянием
- **Axios** - HTTP клиент
- **Typed.js** - анимация текста
- **Framer Motion** - анимации

### Backend

- **FastAPI** - веб-фреймворк
- **SQLAlchemy** - ORM
- **Alembic** - миграции БД
- **PostgreSQL** - база данных
- **Redis** - кэширование
- **Poetry** - управление зависимостями Python

### DevOps

- **Docker & Docker Compose** - контейнеризация
- **Nginx** - веб-сервер (продакшен)

## Установка и запуск

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

## Структура проекта

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
│   │   ├── content/     # Управление контентом
│   │   ├── stats/       # Статистика
│   │   ├── config.py    # Конфигурация
│   │   ├── database.py  # Подключение к БД
│   │   └── main.py      # Точка входа
│   ├── migrations/      # Alembic миграции
│   └── tests/           # Тесты
└── docker-compose.yml   # Docker конфигурация
```

## Основные функции

- ✅ Регистрация и аутентификация пользователей
- ✅ Различные режимы печати (слова, предложения, проблемные символы)
- ✅ Поддержка английского и русского языков
- ✅ Отслеживание WPM (слов в минуту)
- ✅ Расчёт точности печати
- ✅ История тренировок
- ✅ Система внутренней валюты (Shilka Coins)
- ✅ Таблица лидеров в реальном времени (WebSocket)
- ✅ Тёмная/светлая тема
- ✅ Lazy loading страниц
- ✅ Error Boundary для стабильности

## Горячие клавиши

| Клавиша | Действие |
|---------|----------|
| `Tab` | Быстрый перезапуск теста |
| `Escape` | Быстрый перезапуск теста |

## Режимы тренировки

### Слова
Классический режим — печать случайных слов. Идеален для базовой тренировки.

### Предложения
Режим для продвинутых пользователей — печать целых предложений с пунктуацией.

### Проблемные символы ⚠️
**Новый режим!** Автоматически подбирает слова, содержащие символы, в которых вы чаще всего делаете ошибки. Отличный способ улучшить слабые места.

## Тестирование

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

## API Документация

После запуска backend, API документация доступна по адресам:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Основные эндпоинты

#### Аутентификация
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/me` - Текущий пользователь
- `PATCH /api/auth/settings` - Обновление настроек

#### Статистика
- `GET /api/stats/leaderboard` - Таблица лидеров
- `POST /api/stats/typing-session` - Сохранение сессии
- `GET /api/stats/typing-sessions` - История сессий
- `GET /api/stats/char-errors` - Статистика ошибок по символам

#### Контент
- `GET /api/content/words` - Случайные слова
- `GET /api/content/sentences` - Случайные предложения
- `GET /api/content/words/problem` - Слова с проблемными символами

## Архитектура

### Frontend

- **Lazy Loading**: Страницы загружаются по требованию для быстрого первоначального отображения
- **Error Boundary**: Перехват ошибок React для предотвращения падения приложения
- **Мемоизация**: Оптимизация производительности с `useMemo` и `React.memo`
- **Keyboard Shortcuts**: Горячие клавиши для быстрого взаимодействия

### Backend

- **Async/Await**: Полностью асинхронный бэкенд на FastAPI
- **Redis Caching**: Кэширование часто запрашиваемых данных
- **WebSocket**: Обновление лидерборда в реальном времени
- **Rate Limiting**: Защита от злоупотреблений (планируется)

## Авторы

- [@4444urka](https://github.com/4444urka)

## Лицензия

MIT

## Ссылки

- [GitHub Repository](https://github.com/4444urka/shilka-type)