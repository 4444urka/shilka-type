# 📋 История изменений

## [1.1.0](https://github.com/4444urka/shilka-type/compare/v1.0.0...v1.1.0) (2025-10-08)


### ✨ Новые возможности

* Теперь апи работает асинхронно и кэширует значения в редис. ([e711d3f](https://github.com/4444urka/shilka-type/commit/e711d3f107b336a771318b4b8271c32502140426))


### 🐛 Исправления

* исправил тесты ([7f1724e](https://github.com/4444urka/shilka-type/commit/7f1724ecfd7ebf4c4aa5d603828fa5adcab2c345))

## 1.0.0 (2025-10-08)


### ✨ Новые возможности

* **ci:** обновить версию Node.js до 24 и улучшить конфигурацию переменных окружения для тестов бэкенда ([fc35b6b](https://github.com/4444urka/shilka-type/commit/fc35b6b258060dc1788fc048ec83c89050e1680d))
* implement typing session tracking and leaderboard functionality ([50a8aef](https://github.com/4444urka/shilka-type/commit/50a8aef101fda39c98f53226d6b80d5606aa73cf))
* Refactor typing session management and UI components ([dce7335](https://github.com/4444urka/shilka-type/commit/dce733515b3ade251c5e2661747bc3ea071f3a7e))
* **tests:** add comprehensive tests for components, hooks, and utilities ([e5e144f](https://github.com/4444urka/shilka-type/commit/e5e144fbf8daeaacbd8d602fcbf393ef6b295038))
* восстановить конфигурацию Vercel для развертывания приложения ([a4f0ffd](https://github.com/4444urka/shilka-type/commit/a4f0ffd7e5f5a03ddedba14b0e26b2bc4f24d20d))
* добавить конфигурацию Vercel и переменные окружения для продакшена ([be4fb83](https://github.com/4444urka/shilka-type/commit/be4fb8349d9a9983109ec7738f4d08c76dbbef4a))
* добавлена поддержка темной и светлой темы, обновлены стили и компоненты ([7d8763b](https://github.com/4444urka/shilka-type/commit/7d8763bbb68ad29e045f878531bb239ef45696d4))
* обновить Dockerfile и добавить конфигурацию для Render.com ([af45870](https://github.com/4444urka/shilka-type/commit/af45870f732ededd8a676bc06d9a8e378ddab923))
* обновить конфигурацию Docker и Render.com для развертывания приложения ([23906f6](https://github.com/4444urka/shilka-type/commit/23906f61bd4d38baaca8c513bdf53ce07a1a80f7))
* обновить конфигурацию Docker и добавить Dockerfile для развертывания приложения ([841061a](https://github.com/4444urka/shilka-type/commit/841061a04de06b0ae105e9193aef1d3a8fee08f3))


### 🐛 Исправления

* ещё один фикс для релизов ([1fe830f](https://github.com/4444urka/shilka-type/commit/1fe830f3ae5618fbd6096063a07d4a9c2f25ec67))
* изменить команду установки в конфигурации Vercel ([aa20307](https://github.com/4444urka/shilka-type/commit/aa203073560775cfc2928fc5b91e4f31253b28af))
* исправлены пробелы в файле README.md и semantic-release.yml ([bb34701](https://github.com/4444urka/shilka-type/commit/bb3470162d101cb9f7fe4012f47f5881cb1461ee))
* обновить переменную API URL в конфигурации Vercel и отключить ручное разделение чанков в Vite ([8fc51f8](https://github.com/4444urka/shilka-type/commit/8fc51f8a4e74c9b22d17e932f5d9fac5ec68a80e))
* удалить флаг --frozen-lockfile при установке зависимостей фронтенда ([e672505](https://github.com/4444urka/shilka-type/commit/e6725059d6ca0efe30a9cc6faa66a1e14f1e62d8))


### 📝 Документация

* Добавлена документация по Conventional Commits и шаблон Pull Request. Настроен Semantic Release для автоматического создания релизов. ([4adb031](https://github.com/4444urka/shilka-type/commit/4adb031aa629a12b0c18313d6f949d4271fa1531))


### ♻️ Рефакторинг

* удалить устаревший Dockerfile и обновить конфигурацию для запуска приложения ([8f0de88](https://github.com/4444urka/shilka-type/commit/8f0de88213575f2843ec3f4494ece3290dcabd7c))

## [Unreleased]

### ✨ Добавлено

- Автоматическое создание релизов через Semantic Release
- Документация по Conventional Commits
- Docker образы для frontend и backend

### 🐛 Исправлено

- Миграции базы данных для typing_mode и language
- Проблемы с паролями в docker-compose.yml

### 🔒 Безопасность

- Удалены хардкод пароли из репозитория
- Добавлена поддержка переменных окружения
- Создан .env.example для шаблона конфигурации
