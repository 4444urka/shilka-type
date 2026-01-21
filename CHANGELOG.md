# История изменений

## [1.6.1](https://github.com/4444urka/shilka-type/compare/v1.6.0...v1.6.1) (2025-10-27)


### Исправления

* удалены эмодзи из секций в конфигурации релиза ([e4af27d](https://github.com/4444urka/shilka-type/commit/e4af27d7142703bab8736a81547e1e2283c6d430))

# 📋 История изменений

## [1.6.0](https://github.com/4444urka/shilka-type/compare/v1.5.0...v1.6.0) (2025-10-27)


### 🤯 Новые возможности

* добавлены SSL сертификаты для поддержки HTTPS в конфигурации docker-compose ([a390024](https://github.com/4444urka/shilka-type/commit/a3900242d0b0ac38984f6c31339efa9c718a152e))


### 🐛 Исправления

* добавлены переменные окружения для настройки времени истечения токена и разрешенных источников ([784c7a0](https://github.com/4444urka/shilka-type/commit/784c7a043123219114ee4be328e3f511ef67d24f))
* обновлены настройки сервера nginx для поддержки HTTPS и перенаправления с HTTP ([8085424](https://github.com/4444urka/shilka-type/commit/80854247a33bb6843f25220c522ef9f7e003847d))
* обновлены настройки шифрования SSL для повышения безопасности ([d05b900](https://github.com/4444urka/shilka-type/commit/d05b900580ea1e22acbf203779bbe1b77624d5d2))
* упрощен вывод текста ссылок на страницы регистрации и входа ([b7b4db7](https://github.com/4444urka/shilka-type/commit/b7b4db76cfc8fdcc9157a7d5ef16932e8f606969))

## [1.5.0](https://github.com/4444urka/shilka-type/compare/v1.4.0...v1.5.0) (2025-10-24)


### 🤯 Новые возможности

* добавлен новый CI/CD пайплайн с тестами и деплоем на продакшен ([a9d3dc1](https://github.com/4444urka/shilka-type/commit/a9d3dc12fc16548028702157e3ca631f0fd36898))
* добавлен сервис Redis в docker-compose и обновлены зависимости в backend ([db9c1c2](https://github.com/4444urka/shilka-type/commit/db9c1c283a581d4b04ec39e99ee6e05cb40e4375))


### 🐛 Исправления

* добавлено условие для запуска CD пайплайна после завершения CI пайплайна ([ede1dd5](https://github.com/4444urka/shilka-type/commit/ede1dd53487436043308ec6016ca19bf7653486b))
* изменен текст метки "Количество слов" на "По словам" в утилите отображения типа теста ([a3e4acb](https://github.com/4444urka/shilka-type/commit/a3e4acb39f00299d79000d9d0d4b22abd961aa67))
* изменен триггер CD пайплайна с pull_request на push для ветки develop ([82cbbf2](https://github.com/4444urka/shilka-type/commit/82cbbf26d349ccc563df4bed16577335fe90a80e))
* обновлен базовый URL тестового клиента для API ([d3a758d](https://github.com/4444urka/shilka-type/commit/d3a758dd84c05dbd2bb2431290c26b4b0ac5d0f0))
* обновлен значок сайта на shilkatype.svg и удален старый файл vite.svg ([53075a7](https://github.com/4444urka/shilka-type/commit/53075a7d3da6f93be884a83367a09d944482f114))
* обновлен номер версии до 1.4.0, добавлены изменения в CHANGELOG и исправлены метки в утилитах отображения ([e8bd3ea](https://github.com/4444urka/shilka-type/commit/e8bd3ea9eb902ab846011694c729c5002ad23bf5))
* обновлено название CI/CD пайплайна и добавлен CD пайплайн для деплоя на продакшен ([b3924ad](https://github.com/4444urka/shilka-type/commit/b3924ad4a6fe2868d4dc35f79c9c77f796f43fd6))
* обновлены команды установки зависимостей и сборки приложения в Dockerfile.prod ([7830997](https://github.com/4444urka/shilka-type/commit/7830997a318711421a38bec27e9c59f2005f8b99))
* обновлены маршруты API в приложении и конфигурации Nginx ([47fc13b](https://github.com/4444urka/shilka-type/commit/47fc13b5f7a82acbbd079c9b32e59d5e6515d8da))
* убрано использование sudo для команд docker в процессе деплоя ([7e4b4f9](https://github.com/4444urka/shilka-type/commit/7e4b4f9d2f0e6f2565ded2aa1779448133c6c06d))
* убрано использование флага -v при остановке контейнеров в CI/CD ([f08bcd1](https://github.com/4444urka/shilka-type/commit/f08bcd14759c129b5a0472adbf8ae6be361d5023))

## [1.4.0](https://github.com/4444urka/shilka-type/compare/v1.3.0...v1.4.0) (2025-10-11)


### 🤯 Новые возможности

* Добавлена возможность менять цветовую тема ([43538ab](https://github.com/4444urka/shilka-type/commit/43538ab2e6a4855a5f18c6373bcadfa4a10e2d4a))


### 🐛 Исправления

* исправлен принцип отображения ошибочных клавиш на клавиатуре в статистике ([c684123](https://github.com/4444urka/shilka-type/commit/c684123539b2e38ce19804a849c369dd0b48222a))
* исправлено вычисление времени для расчета WPM ([c87d2ed](https://github.com/4444urka/shilka-type/commit/c87d2edebac312b7f41bf6290cc1135fc782937e))


### 💄 Стилизация

* Добавил иконку ([91d9db8](https://github.com/4444urka/shilka-type/commit/91d9db8ae4a064eefa89c4e25d5ea9a902ed9e6a))

## [1.3.0](https://github.com/4444urka/shilka-type/compare/v1.2.0...v1.3.0) (2025-10-09)


### 🤯 Новые возможности

* Добавлен новый режим по количеству слов ([901e3c3](https://github.com/4444urka/shilka-type/commit/901e3c307e6769710385f452d872c7923a0bb904))


### 💄 Стилизация

* Добавлена анимация появления версии ([7104f91](https://github.com/4444urka/shilka-type/commit/7104f9172e222d2907c2036a3beafbc1aef8e704))


### ✅ Тесты

* Добавлены тесты. Теперь покрытие равно 54% ([fcee7c9](https://github.com/4444urka/shilka-type/commit/fcee7c9f40ac6b484460cce388f56b2113bd991f))

## [1.2.0](https://github.com/4444urka/shilka-type/compare/v1.1.0...v1.2.0) (2025-10-08)


### ✨ Новые возможности

* добавлена функция получения версии приложения ([80d059a](https://github.com/4444urka/shilka-type/commit/80d059a54c41cf99e2194e4626567274beaee7f9))

## [1.1.0](https://github.com/4444urka/shilka-type/compare/v1.0.0...v1.1.0) (2025-10-08)


### ✨ Новые возможности

* Теперь апи работает асинхронно и кэширует значения в редис. ([e711d3f](https://github.com/4444urka/shilka-type/commit/e711d3f107b336a771318b4b8271c32502140426))


### 🐛 Исправления

* исправил тесты ([7f1724e](https://github.com/4444urka/shilka-type/commit/7f1724ecfd7ebf4c4aa5d603828fa5adcab2c345))

## 1.0.0 (2025-10-08)


### ✨ Новые возможности

* **ci:** обновить версию Node.js до 24 и улучшить конфигурацию переменных окружения для тестов бэкенда ([fc35b6b](https://github.com/4444urka/shilka-type/commit/fc35b6b258060dc1788fc048ec83c89050e1680d))
* implement Sc session tracking and leaderboard functionality ([50a8aef](https://github.com/4444urka/shilka-type/commit/50a8aef101fda39c98f53226d6b80d5606aa73cf))
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
