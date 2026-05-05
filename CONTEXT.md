# Обзор проекта Scenor

## О проекте

Я разрабатываю дипломный проект, вдохновлённый n8n.
Это платформа автоматизации рабочих процессов с визуальным редактором, где пользователи могут создавать workflow из узлов (nodes), соединённых рёбрами (edges).

Проект не является полной копией n8n, а представляет собой MVP / упрощённую версию с собственным UI и ограниченным набором функций.
Цель — реализовать чистую архитектуру, которая будет масштабируемой, понятной и подходящей для дипломного проекта.

## Статус проекта

**Дата обновления:** 5 мая 2026

✅ **Backend MVP** - полностью реализован и готов к использованию
- 13 модулей (10 feature + 3 shared)
- 50+ API endpoints
- Полная система аутентификации и авторизации
- Execution engine с поддержкой условной логики
- Шифрование credentials
- Audit trail для критических операций

🚧 **Frontend** - в разработке другим разработчиком
- Backend API готов для интеграции
- Swagger документация доступна

## Технологический стек

### Backend
- **Framework:** NestJS 11.0.1
- **Язык:** TypeScript 5.7.3
- **ORM:** Prisma 7.6.0
- **База данных:** PostgreSQL 16
- **Аутентификация:** JWT (jsonwebtoken 9.0.3)
- **Валидация:** Zod 4.3.6 + class-validator 0.14.4
- **Шифрование:** Node.js crypto (AES-256-GCM)
- **Хеширование паролей:** bcrypt 6.0.0
- **API документация:** Swagger 11.0.0
- **WebSocket:** Socket.io для real-time updates

### Frontend
- **Framework:** React 19.2.0 + TypeScript (в разработке)
- **Build Tool:** Vite
- **Routing:** React Router

### База данных
- **Система:** PostgreSQL 16 (Alpine)
- **Драйвер:** pg 8.20.0
- **Adapter:** @prisma/adapter-pg 7.6.0

## Быстрый старт

### Требования
- Node.js 18+
- PostgreSQL 12+
- npm или yarn

### Установка и запуск

```bash
# Клонировать репозиторий
git clone <repo-url>
cd scenor

# Перейти в папку backend
cd backend

# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env
# Отредактировать .env файл с вашими настройками

# Сгенерировать Prisma client
npm run prisma:generate

# Применить миграции базы данных
npm run prisma:migrate:dev

# Запустить backend в режиме разработки
npm run dev
```

### Запуск через Docker

```bash
# Из корневой папки проекта
docker-compose up -d
```

### Доступ к API

После запуска backend:
- **API:** http://localhost:3000
- **Swagger UI:** http://localhost:3000/api
- **OpenAPI spec:** http://localhost:3000/api-json
- **Prisma Studio:** `npm run studio` (в папке backend)

### Переменные окружения

Создайте файл `.env` в папке `backend/` со следующими переменными:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/scenor
JWT_ACCESS_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-secret-key-min-32-chars
CREDENTIALS_ENCRYPTION_KEY=64-character-hex-string-for-aes256
PORT=3000
HOSTNAME=0.0.0.0
```

## Основная идея продукта

Система позволяет пользователям:

- ✅ Регистрироваться и проходить аутентификацию
- ✅ Создавать проекты и управлять членством (OWNER/EDITOR/VIEWER)
- ✅ Создавать workflow внутри проектов
- ✅ Визуально строить workflow из узлов и связей
- ✅ Делиться workflow с другими пользователями или по публичной ссылке
- ✅ Запускать workflow вручную или через webhook
- ✅ Просматривать историю выполнения и логи узлов
- ✅ Управлять зашифрованными credentials
- ✅ Удалять executions с audit trail

Workflow представляется как направленный граф:
- **nodes (узлы)** = действия / триггеры / логика / блоки данных
- **edges (рёбра)** = связи между узлами

## Архитектура проекта

### Модули Backend (13 модулей)

#### Feature модули (10):
1. **UsersModule** - регистрация, аутентификация, управление пользователями
2. **ProfilesModule** - профили пользователей (firstName, lastName, bio, phone, avatar)
3. **ProjectsModule** - создание проектов, управление членством
4. **WorkflowsModule** - CRUD для workflows, nodes, edges с валидацией Zod
5. **NodeTypesModule** - реестр типов узлов, 11 дефолтных типов
6. **ExecutionsModule** - execution engine, логирование, удаление с audit trail
7. **CredentialsModule** - шифрование/дешифрование учетных данных
8. **WorkflowSharesModule** - публичный доступ к workflow через токены
9. **InitializationModule** - инициализация системы (создание admin, seed node types)
10. **WebSocketModule** - real-time обновления через Socket.io

#### Shared модули (3):
1. **AuthModule** - JWT guards, token service, role guards
2. **DatabaseModule** - Prisma client wrapper
3. **ConfigModule** - валидация environment variables

### База данных (13 моделей Prisma)

1. **User** - пользователи системы
2. **UserProfile** - профили пользователей
3. **Project** - проекты (PERSONAL/TEAM)
4. **ProjectMember** - членство в проектах с ролями
5. **Workflow** - workflow (draft/active/inactive/archived)
6. **NodeType** - типы узлов (trigger/action/logic/data/integration)
7. **WorkflowNode** - экземпляры узлов в workflow
8. **WorkflowEdge** - связи между узлами
9. **Credential** - зашифрованные учетные данные
10. **WorkflowShare** - публичный доступ к workflow
11. **WorkflowExecution** - запуски workflow
12. **ExecutionNodeLog** - логи выполнения узлов
13. **ExecutionDeletionAudit** - аудит удалений executions

### API Endpoints (50+)

- `/users/*` - регистрация, логин, refresh, управление пользователями
- `/profiles/*` - управление профилями
- `/projects/*` - CRUD проектов
- `/projects/:id/members/*` - управление членством
- `/workflows/*` - CRUD workflows
- `/workflows/:id/nodes/*` - управление узлами
- `/workflows/:id/edges/*` - управление связями
- `/workflows/:id/executions/*` - запуск и управление выполнением
- `/node-types/*` - получение типов узлов
- `/credentials/*` - управление credentials
- `/workflow-shares/*` - управление публичным доступом

## Реализованные типы узлов (11 типов)

### Триггеры (2):
- **manual_trigger** - ручной запуск workflow
- **webhook_trigger** - запуск через webhook (определен, частично реализован)

### Логика (2):
- **if** - условное ветвление (режимы: all/any)
- **switch** - множественное ветвление по выражению

### Данные (2):
- **set** - установка/изменение значений полей
- **transform** - трансформация данных через JavaScript

### Действия (3):
- **http_request** - HTTP запросы с поддержкой credentials
- **code** - выполнение JavaScript кода
- **delay** - задержка выполнения на указанное время

### База данных (2 - заглушки):
- **db_select** - выборка из БД (placeholder)
- **db_insert** - вставка в БД (placeholder)

## Архитектурные принципы

### 1. Workflow — это графы

Workflow представляет собой направленный граф из узлов и рёбер.
Execution engine обходит граф, выполняя узлы в правильном порядке.

### 2. Узлы — универсальные сущности

**Не создавай отдельную таблицу для каждого типа узла.**

Правильный подход:
- Одна таблица `node_types` для определений типов узлов
- Одна таблица `workflow_nodes` для экземпляров узлов в workflow
- Одна таблица `workflow_edges` для связей между узлами
- Специфичные настройки узлов хранятся в `configJson` (JSONB)

Это лучше, чем создавать отдельные таблицы:
- ❌ `http_request_nodes`
- ❌ `if_nodes`
- ❌ `code_nodes`

### 3. Runtime-данные отделены от design-time

**Не храни результаты выполнения внутри записей узлов workflow.**

Разделение:

**Design-time** (структура):
- `workflows` - определение workflow
- `workflow_nodes` - узлы в workflow
- `workflow_edges` - связи между узлами

**Runtime** (выполнение):
- `workflow_executions` - запуски workflow
- `execution_node_logs` - логи выполнения узлов

### 4. Секреты отделены от конфигурации узла

Учётные данные (токены, пароли, API-ключи) хранятся в отдельной таблице `credentials` с шифрованием AES-256-GCM, а не внутри `configJson` узла.

**Преимущества:**
- Безопасность: credentials зашифрованы
- Переиспользование: один credential для нескольких узлов
- Управление: централизованное управление доступом

## Ключевые решения по БД

### Зачем нужна `node_types`

Позволяет:
- Отображать список доступных узлов на фронтенде
- Знать категории узлов (trigger/action/logic/data/integration)
- Хранить дефолтные конфиги для каждого типа
- Валидировать схемы конфигурации
- Легко расширять систему новыми типами узлов

### Почему `workflow_nodes` универсальная

Все узлы хранятся в одной таблице.
Поведение определяется через `typeCode` и `configJson`.

**Преимущества:**
- Единая структура для всех типов узлов
- Легко добавлять новые типы без изменения схемы БД
- Упрощенные запросы и связи

### Почему используется `configJson`

У разных узлов разные настройки → JSONB — правильный выбор.

**Примеры:**
- HTTP Request: `{ url, method, headers, body }`
- IF: `{ mode, conditions }`
- Code: `{ language, source }`

### Почему `credentials` отдельно

Секреты не должны храниться в `configJson` узла.

**Реализация:**
- Таблица `credentials` с полем `encryptedData`
- Шифрование AES-256-GCM с random IV
- Узел ссылается на credential через `credentialsId`

### Почему `execution` отдельно

Разделение design-time и runtime данных обеспечивает:
- Чистоту структуры workflow
- Возможность многократного выполнения
- Историю всех запусков
- Независимое хранение логов

## Рекомендуемая backend-архитектура

### NodeDefinition

Описание типа узла в `node_types`:
- `code` - уникальный код типа
- `displayName` - отображаемое имя
- `category` - категория узла
- `description` - описание
- `icon` - иконка
- `isTrigger` - является ли триггером
- `supportsCredentials` - поддерживает ли credentials
- `schemaJson` - JSON Schema для валидации
- `defaultConfigJson` - дефолтная конфигурация

### NodeHandler

Каждый тип узла имеет обработчик в `executions.service.ts`:
- `ManualTriggerNodeHandler` - обработка manual_trigger
- `HttpRequestNodeHandler` - обработка http_request
- `IfNodeHandler` - обработка if
- `CodeNodeHandler` - обработка code
- И т.д.

### NodeRegistry

Центральный реестр в `node-types.service.ts`:
- `http_request` → HTTP handler
- `if` → IF handler
- `code` → Code handler
- Загрузка типов из БД
- Валидация конфигурации через Zod

### Execution Engine

Реализован в `executions.service.ts`:

1. Загрузить workflow с узлами и связями
2. Построить граф зависимостей
3. Определить порядок выполнения (топологическая сортировка)
4. Для каждого узла:
   - Выбрать handler по `node.typeCode`
   - Выполнить узел с входными данными
   - Записать лог в `execution_node_logs`
   - Передать результат следующим узлам
5. Обработать условное ветвление (if/switch)
6. Завершить execution со статусом success/failed

### Валидация

Используется **Zod** для runtime валидации.

Валидация происходит:
- При создании узла (проверка `configJson`)
- При обновлении узла
- Перед выполнением workflow

Схемы валидации определены в `workflows/node-config.schemas.ts`.

## Модель доступа

### Глобальный доступ
- `users.role` - USER или SUPER_ADMIN
- SUPER_ADMIN может управлять всеми ресурсами

### Доступ к проекту
- `project_members.role` - OWNER, EDITOR, VIEWER
- **OWNER** - полный доступ ко всем ресурсам проекта
- **EDITOR** - может создавать/редактировать workflows, запускать executions
- **VIEWER** - только чтение

### Публичный доступ
- `workflow_shares` - токены для публичного доступа
- Типы доступа: view, comment, edit
- Опциональный срок действия (`expiresAt`)

## Безопасность

### Аутентификация
- ✅ JWT access tokens (срок действия: 15 минут)
- ✅ JWT refresh tokens (срок действия: 7 дней)
- ✅ Отдельные секреты для access и refresh токенов
- ✅ Bearer token validation на защищенных маршрутах

### Авторизация
- ✅ Role-based access control (USER, SUPER_ADMIN)
- ✅ Project-level permissions (OWNER, EDITOR, VIEWER)
- ✅ Resource ownership validation
- ✅ Membership verification

### Защита данных
- ✅ AES-256-GCM шифрование для credentials
- ✅ Random IV для каждого шифрования
- ✅ Authentication tag для проверки целостности
- ✅ Bcrypt для хеширования паролей

### Валидация входных данных
- ✅ Zod schemas для всех DTOs
- ✅ Проверка уникальности email и username
- ✅ Валидация конфигурации узлов
- ✅ Валидация параметров пагинации

### Audit Trail
- ✅ Логирование удаления executions
- ✅ Сохранение метаданных: кто, когда, почему
- ✅ Постоянное хранение audit записей

## Что реализовано

### ✅ Полностью реализовано

**Аутентификация и авторизация:**
- Регистрация пользователей с валидацией
- Логин с JWT токенами
- Refresh token механизм
- Role-based guards
- Project membership guards

**Управление проектами:**
- CRUD операции для проектов
- Управление членством (OWNER/EDITOR/VIEWER)
- Типы проектов (PERSONAL/TEAM)
- Архивация проектов

**Workflow management:**
- CRUD операции для workflows
- Создание и редактирование узлов
- Создание и редактирование связей
- Валидация конфигурации узлов через Zod
- Статусы workflow (draft/active/inactive/archived)

**Execution engine:**
- Запуск workflow вручную
- Топологическая сортировка узлов
- Выполнение узлов с обработчиками
- Условное ветвление (if/switch)
- Логирование выполнения узлов
- Обработка ошибок

**Credentials management:**
- Создание зашифрованных credentials
- AES-256-GCM шифрование
- Привязка credentials к узлам
- Scope credentials к проектам

**Workflow sharing:**
- Создание публичных токенов
- Типы доступа (view/comment/edit)
- Срок действия токенов
- Доступ к workflow по токену

**Audit и безопасность:**
- Audit trail для удаления executions
- Логирование критических операций
- Защита от удаления running executions

**API документация:**
- Swagger UI
- OpenAPI спецификация
- Описание всех endpoints
- Примеры запросов и ответов

### ⚠️ Частично реализовано

- **Webhook triggers** - backend определен, но не полностью реализован
- **Database nodes** (db_select, db_insert) - только заглушки

### ❌ Не реализовано

- Frontend визуальный редактор (в разработке другим разработчиком)
- Cron scheduling для автоматического запуска
- Real-time collaboration между пользователями
- Workflow versioning
- Team invitations UI
- Activity logs UI
- Monitoring dashboard
- Экспорт/импорт workflows

## Coding правила

### Используемые технологии
- TypeScript (strict mode)
- NestJS (не Express!)
- Prisma ORM
- Zod для валидации

### Структура кода
Разделять:
- **routes** - определены в controllers
- **controllers** - обработка HTTP запросов
- **services** - бизнес-логика
- **repositories** - доступ к данным (через Prisma)
- **node handlers** - обработчики типов узлов
- **validation** - Zod schemas и DTOs

### Naming conventions
- **SQL (Prisma):** snake_case (`user_id`, `created_at`)
- **TypeScript:** camelCase (`userId`, `createdAt`)
- **Классы:** PascalCase (`UserService`, `WorkflowController`)
- **Константы:** UPPER_SNAKE_CASE (`DEFAULT_NODE_TYPES`)

### Паттерны
- Dependency Injection через NestJS
- DTO для всех входных данных
- Zod schemas для runtime валидации
- Guards для авторизации
- Interceptors для логирования
- Exception filters для обработки ошибок

## Документация

### Основная документация
- **[CONTEXT.md](./CONTEXT.md)** (этот файл) - обзор проекта и архитектуры
- **[README.md](./README.md)** - быстрый старт и установка

### Детальная документация (папка CONTEXT/)
- **[CODEBASE_OVERVIEW.md](./CONTEXT/CODEBASE_OVERVIEW.md)** - полный обзор кодовой базы (681 строка)
  - Структура модулей
  - Диаграммы зависимостей
  - API endpoints reference
  - Матрица прав доступа
  - Troubleshooting guide
  
- **[IMPLEMENTATION_GUIDE.md](./CONTEXT/IMPLEMENTATION_GUIDE.md)** - руководство по разработке (897 строк)
  - Пошаговые инструкции добавления функций
  - Примеры кода
  - Best practices
  - Общие паттерны
  - Debugging guide
  
- **[README_EXPLORATION.md](./CONTEXT/README_EXPLORATION.md)** - итоги исследования проекта (448 строк)
  - Анализ архитектуры
  - Метрики качества кода
  - Рекомендации по развитию
  
- **[SYSTEM_PROMPT.md](./CONTEXT/SYSTEM_PROMPT.md)** - инструкции для AI помощника (27 строк)
  - Роль AI в проекте
  - Правила работы с кодом
  - Формат commit messages

### API документация
- **Swagger UI:** http://localhost:3000/api (после запуска backend)
- **OpenAPI spec:** http://localhost:3000/api-json

### База данных
- **Prisma Studio:** `npm run studio` (в папке backend)
- **Схемы:** `backend/prisma/*.prisma`
- **Миграции:** `backend/prisma/migrations/`

## Чем должен помогать AI

При работе с проектом AI должен помогать с:

1. **Prisma schema** - создание и изменение моделей
2. **Миграции** - генерация и применение миграций
3. **Backend-архитектура** - следование паттернам NestJS
4. **Execution engine** - логика выполнения workflow
5. **NodeRegistry** - добавление новых типов узлов
6. **Zod-валидация** - создание схем валидации
7. **DTO** - создание Data Transfer Objects
8. **Структура проекта** - организация файлов и модулей
9. **Тесты** - написание unit и integration тестов
10. **Документация** - обновление документации при изменениях

**Важно:** AI должен следовать существующей архитектуре и не переписывать большие части кода без необходимости.

## Итог

Это упрощённая платформа автоматизации workflow (аналог n8n) для дипломного проекта.

### Ключевые идеи:
- ✅ **workflow = граф** - направленный граф из узлов и связей
- ✅ **node types = registry** - централизованный реестр типов узлов
- ✅ **nodes = универсальные** - одна таблица для всех типов
- ✅ **config = JSONB** - гибкая конфигурация в JSON
- ✅ **secrets = отдельно** - зашифрованные credentials
- ✅ **execution = отдельно** - разделение design-time и runtime

### Статус:
- ✅ Backend MVP полностью готов
- 🚧 Frontend в разработке другим разработчиком
- 📚 Документация актуальна и полная
- 🔒 Безопасность реализована
- 🧪 Тесты покрывают критические функции

### Следующие шаги:
1. Интеграция с frontend
2. Реализация webhook triggers
3. Добавление database nodes
4. Внедрение cron scheduling
5. Улучшение monitoring и logging

---

**Дата последнего обновления:** 5 мая 2026  
**Версия:** 1.0 (Backend MVP)  
**Тип проекта:** Дипломный проект  
**Статус:** Backend готов к использованию
