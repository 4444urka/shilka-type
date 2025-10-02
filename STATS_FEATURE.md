# Реализованный функционал статистики

## Что добавлено

### Backend

1. **Модели БД** (`backend/src/auth/models.py`)

   - `TypingSession` - таблица для хранения сессий набора текста
   - Поля: id, user_id, wpm, accuracy, duration, words, history, created_at
   - Связь с User через relationship

2. **Pydantic схемы** (`backend/src/auth/schemas.py`)

   - `TypingChar` - модель символа (char, correct, time)
   - `WordHistoryPayload` - входящие данные сессии
   - Методы `calculate_wpm()` и `calculate_accuracy()` для вычисления метрик
   - `TypingSessionResponse` - формат ответа API

3. **API эндпоинты** (`backend/src/auth/router.py`)

   - `POST /auth/word-history` - сохранение новой сессии с автоматическим расчётом WPM и accuracy
   - `GET /auth/typing-sessions?limit=10` - получение последних сессий пользователя

4. **Миграция БД** (`backend/migrations/versions/c5d8e9f12345_add_typing_sessions_table.py`)
   - Создание таблицы typing_sessions
   - Индексы на id и user_id
   - Foreign key на users.id

### Frontend

1. **API клиент** (`frontend/src/api/auth/authRequests.ts`)

   - `postWordHistory(payload)` - отправка истории набора
   - `fetchTypingSessions(limit)` - получение сессий
   - Типы `TypingSession` и `WordHistoryPayload`

2. **Компоненты**

   - `StatsChart` (`frontend/src/components/StatsChart/StatsChart.tsx`)

     - График WPM и accuracy по датам
     - SVG-визуализация с двумя линиями
     - Легенда и подписи осей
     - Автоматическая нормализация данных

   - `TypingHistory` (`frontend/src/components/TypingHistory/TypingHistory.tsx`)
     - Список последних сессий
     - Отображение WPM, accuracy, длительности
     - Форматирование даты

3. **Интеграция** (`frontend/src/pages/Stats/Stats.tsx`)

   - Лейаут с двумя колонками: Leaderboard слева, StatsChart справа
   - TypingHistory внизу во всю ширину
   - Адаптивная компоновка через Flexbox

4. **Хук** (`frontend/src/hooks/useTypingSession.ts`)
   - Автоматическая отправка истории при завершении сессии (time === 0)
   - Отправка только для авторизованных пользователей
   - Защита от повторной отправки через ref

## Формулы расчёта

### WPM (Words Per Minute)

```
WPM = (правильные_символы / 5) / (секунды / 60)
```

Где 5 - стандартная длина слова в английском языке

### Accuracy (Точность)

```
Accuracy = (правильные_символы / общее_количество_символов) × 100%
```

## Применение миграции

```bash
cd backend
alembic upgrade head
```

## Как работает

1. Пользователь завершает сессию набора текста (таймер доходит до 0)
2. `useTypingSession` автоматически:
   - Финализирует историю (добавляет текущие набранные символы)
   - Отправляет POST запрос на `/auth/word-history` с words, history, duration
3. Backend:
   - Вычисляет WPM и accuracy по формулам
   - Сохраняет сессию в БД с текущим timestamp
   - Возвращает данные сессии
4. На странице Stats:
   - График (`StatsChart`) отображает последние 20 сессий
   - История (`TypingHistory`) показывает последние 10 сессий списком
   - Данные загружаются автоматически при заходе на страницу

## Особенности реализации

- **SVG график**: нативная реализация без внешних библиотек
- **Две оси Y**: одна шкала для WPM и accuracy (0-100)
- **Автоматическая нормализация**: максимум WPM определяется динамически
- **Форматирование дат**: день.месяц для компактности
- **Реверс данных**: график показывает прогресс слева направо (старые → новые)
- **Цветовая кодировка**: синий для WPM, зелёный для accuracy
- **Responsive**: график адаптируется под размер контейнера
