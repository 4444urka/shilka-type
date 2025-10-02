# Применение миграции для таблицы typing_sessions

## Команды для применения миграции

```bash
cd backend
alembic upgrade head
```

Эта команда применит новую миграцию и создаст таблицу `typing_sessions` в базе данных.

## Проверка применённых миграций

```bash
alembic current
```

## Откат миграции (если нужно)

```bash
alembic downgrade -1
```
