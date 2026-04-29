# Scenor - Платформа автоматизации рабочих процессов

**Дипломный проект, реализующий платформу визуальной автоматизации рабочих процессов, вдохновленную n8n**

## 📋 Обзор проекта

Scenor — это MVP (минимально жизнеспособный продукт) платформы автоматизации рабочих процессов, которая позволяет пользователям создавать, управлять и выполнять сложные рабочие процессы автоматизации через визуальный интерфейс. Платформа позволяет пользователям строить рабочие процессы, соединяя узлы (действия, триггеры, логика) с ребрами (соединения), аналогично n8n, но с упрощенным, сфокусированным набором функций, подходящим для дипломного проекта.

### Основные возможности

- **Аутентификация и авторизация пользователей** - Регистрация, вход, JWT-аутентификация с контролем доступа на основе ролей
- **Управление проектами** - Создание и организация проектов с командной работой
- **Визуальный редактор рабочих процессов** - Построение рабочих процессов путем соединения узлов и ребер
- **Выполнение рабочих процессов** - Запуск рабочих процессов вручную или через вебхуки с отслеживанием выполнения в реальном времени
- **Реестр типов узлов** - 12+ встроенных типов узлов, охватывающих триггеры, логику, преобразование данных и интеграции
- **Управление учетными данными** - Безопасное хранение ключей API и учетных данных с шифрованием AES-256
- **История выполнения** - Отслеживание запусков рабочих процессов с подробными логами и статусом выполнения
- **Совместное использование рабочих процессов** - Совместное использование рабочих процессов публично или с конкретными пользователями через токены
- **REST API** - Полнофункциональный API с документацией Swagger

---

## 🏗️ Обзор архитектуры

### Технологический стек

**Backend:**
- **Фреймворк:** NestJS 11.x
- **Язык:** TypeScript 5.7
- **База данных:** PostgreSQL 16
- **ORM:** Prisma 7.6.0
- **Валидация:** Zod 4.3.6, class-validator
- **Аутентификация:** JWT (jsonwebtoken 9.0.3)
- **Шифрование:** bcrypt, crypto (AES-256-GCM)

**Frontend:**
- **Фреймворк:** React 19.2.0
- **Язык:** TypeScript 5.9
- **Инструмент сборки:** Vite 7.2.4
- **Маршрутизация:** React Router 7.10.1
- **Стили:** SCSS
- **Тестирование:** Vitest

**Инфраструктура:**
- **Контейнеризация:** Docker & Docker Compose
- **Документация API:** Swagger/OpenAPI

### Основные архитектурные принципы

#### 1. **Рабочий процесс как направленный граф**
Рабочие процессы представлены как направленные ациклические графы (DAG), состоящие из:
- **Узлы** - Отдельные действия, триггеры или блоки логики
- **Ребра** - Соединения между узлами, определяющие поток выполнения

#### 2. **Универсальная модель узла**
Вместо отдельных таблиц для каждого типа узла система использует:
- Одна таблица `NodeType` - Определяет доступные типы узлов со схемами
- Одна таблица `WorkflowNode` - Экземпляры узлов в рабочих процессах
- JSON конфигурация - Параметры, специфичные для узла, хранятся в `configJson`

#### 3. **Разделение ответственности**
- **Время проектирования** - Структура рабочего процесса (узлы, ребра, конфигурация)
- **Время выполнения** - Данные выполнения (выполнения, логи, выходные данные)
- **Учетные данные** - Зашифрованные секреты хранятся отдельно от конфигурации узла

#### 4. **Контроль доступа на основе ролей**
- **Глобальные роли** - Администратор, Пользователь
- **Роли проекта** - Владелец, Редактор, Зритель
- **Совместное использование рабочих процессов** - Публичные ссылки и токены для конкретных пользователей

---

## 📁 Структура проекта

```
scenor/
├── backend/                          # NestJS backend приложение
│   ├── src/
│   │   ├── app.module.ts            # Корневой модуль
│   │   ├── main.ts                  # Точка входа приложения
│   │   ├── auth/                    # Аутентификация и авторизация
│   │   │   ├── auth.guard.ts        # Проверка JWT
│   │   │   ├── auth-token.service.ts # Генерация/валидация токенов
│   │   │   └── roles.guard.ts       # Контроль доступа на основе ролей
│   │   ├── users/                   # Управление пользователями
│   │   │   ├── users.service.ts     # Бизнес-логика пользователей
│   │   │   ├── users.controller.ts  # Endpoints пользователей
│   │   │   ├── users.repository.ts  # Запросы к БД
│   │   │   └── dto/                 # Объекты передачи данных
│   │   ├── profiles/                # Профили пользователей
│   │   ├── projects/                # Управление проектами
│   │   ├── workflows/               # CRUD операции рабочих процессов
│   │   │   ├── workflows.service.ts # Бизнес-логика рабочих процессов
│   │   │   ├── workflows.controller.ts
│   │   │   ├── node-config.schemas.ts # Zod схемы валидации
│   │   │   └── dto/                 # DTOs рабочих процессов
│   │   ├── node-types/              # Реестр типов узлов
│   │   │   ├── node-types.service.ts
│   │   │   ├── node-types.defaults.ts # Встроенные определения узлов
│   │   │   └── dto/
│   │   ├── executions/              # Движок выполнения рабочих процессов
│   │   │   ├── executions.service.ts # Логика выполнения и обход графа
│   │   │   ├── executions.controller.ts
│   │   │   └── dto/
│   │   ├── credentials/             # Управление учетными данными
│   │   │   ├── credentials.service.ts # Шифрование/расшифровка
│   │   │   ├── credentials.controller.ts
│   │   │   └── dto/
│   │   ├── workflow-shares/         # Совместное использование рабочих процессов
│   │   ├── database/                # Настройка Prisma клиента
│   │   ├── initialization/          # Инициализация и seed данные
│   │   ├── config/                  # Конфигурация окружения
│   │   └── common/                  # Общие утилиты и middleware
│   ├── prisma/
│   │   └── schema.prisma            # Схема базы данных
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                         # React frontend приложение
│   ├── src/
│   │   ├── App.tsx                  # Корневой компонент
│   │   ├── main.tsx                 # Точка входа
│   │   ├── pages/                   # Компоненты страниц
│   │   │   ├── authorization/       # Страница входа
│   │   │   ├── registration/        # Страница регистрации
│   │   │   ├── overview/            # Главная панель управления
│   │   │   └── settings/            # Настройки пользователя
│   │   ├── components/              # Переиспользуемые компоненты
│   │   │   ├── left_nav/            # Боковая навигация
│   │   │   ├── settings/            # Компоненты настроек
│   │   │   ├── overview/            # Компоненты страницы обзора
│   │   │   └── ProtectedRoute.tsx   # Обертка защиты маршрутов
│   │   ├── services/
│   │   │   └── api.ts               # API клиент
│   │   ├── hooks/                   # Пользовательские React хуки
│   │   │   ├── useLogin.ts
│   │   │   ├── useRegister.ts
│   │   │   ├── useProfile.ts
│   │   │   └── useFieldFeedback.ts
│   │   ├── context/                 # React context провайдеры
│   │   ├── utils/                   # Вспомогательные функции
│   │   │   └── validation/          # Валидация входных данных
│   │   └── styles/                  # Глобальные стили
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── docker-compose.yml               # Оркестрация Docker сервисов
├── CONTEXT.md                        # Контекст проекта и принципы
├── CODEBASE_OVERVIEW.md             # Подробный справочник кодовой базы
├── IMPLEMENTATION_GUIDE.md          # Руководство разработчика
└── README.md                         # Этот файл
```
scenor/
├── backend/                          # NestJS backend application
│   ├── src/
│   │   ├── app.module.ts            # Root module
│   │   ├── main.ts                  # Application entry point
│   │   ├── auth/                    # Authentication & authorization
│   │   │   ├── auth.guard.ts        # JWT validation guard
│   │   │   ├── auth-token.service.ts # Token generation/validation
│   │   │   └── roles.guard.ts       # Role-based access control
│   │   ├── users/                   # User management
│   │   │   ├── users.service.ts     # User business logic
│   │   │   ├── users.controller.ts  # User endpoints
│   │   │   ├── users.repository.ts  # Database queries
│   │   │   └── dto/                 # Data transfer objects
│   │   ├── profiles/                # User profiles
│   │   ├── projects/                # Project management
│   │   ├── workflows/               # Workflow CRUD operations
│   │   │   ├── workflows.service.ts # Workflow business logic
│   │   │   ├── workflows.controller.ts
│   │   │   ├── node-config.schemas.ts # Zod validation schemas
│   │   │   └── dto/                 # Workflow DTOs
│   │   ├── node-types/              # Node type registry
│   │   │   ├── node-types.service.ts
│   │   │   ├── node-types.defaults.ts # Pre-built node definitions
│   │   │   └── dto/
│   │   ├── executions/              # Workflow execution engine
│   │   │   ├── executions.service.ts # Execution logic & graph traversal
│   │   │   ├── executions.controller.ts
│   │   │   └── dto/
│   │   ├── credentials/             # Credential management
│   │   │   ├── credentials.service.ts # Encryption/decryption
│   │   │   ├── credentials.controller.ts
│   │   │   └── dto/
│   │   ├── workflow-shares/         # Workflow sharing
│   │   ├── database/                # Prisma client setup
│   │   ├── initialization/          # Seed data & initialization
│   │   ├── config/                  # Environment configuration
│   │   └── common/                  # Shared utilities & middleware
│   ├── prisma/
│   │   └── schema.prisma            # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/                         # React frontend application
│   ├── src/
│   │   ├── App.tsx                  # Root component
│   │   ├── main.tsx                 # Entry point
│   │   ├── pages/                   # Page components
│   │   │   ├── authorization/       # Login page
│   │   │   ├── registration/        # Registration page
│   │   │   ├── overview/            # Main dashboard
│   │   │   └── settings/            # User settings
│   │   ├── components/              # Reusable components
│   │   │   ├── left_nav/            # Navigation sidebar
│   │   │   ├── settings/            # Settings components
│   │   │   ├── overview/            # Overview page components
│   │   │   └── ProtectedRoute.tsx   # Route protection wrapper
│   │   ├── services/
│   │   │   └── api.ts               # API client
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useLogin.ts
│   │   │   ├── useRegister.ts
│   │   │   ├── useProfile.ts
│   │   │   └── useFieldFeedback.ts
│   │   ├── context/                 # React context providers
│   │   ├── utils/                   # Utility functions
│   │   │   └── validation/          # Input validation
│   │   └── styles/                  # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── docker-compose.yml               # Docker services orchestration
├── CONTEXT.md                        # Project context & principles
├── CODEBASE_OVERVIEW.md             # Detailed codebase reference
├── IMPLEMENTATION_GUIDE.md          # Developer guide
└── README.md                         # This file
```

---

## 🗄️ Схема базы данных

### Основные сущности

**Управление пользователями:**
- `User` - Учетные записи пользователей с учетными данными аутентификации
- `UserProfile` - Расширенная информация пользователя (аватар, биография и т.д.)

**Организация проектов:**
- `Project` - Рабочее пространство для организации рабочих процессов
- `ProjectMember` - Члены команды с ролями (Владелец, Редактор, Зритель)

**Определение рабочего процесса:**
- `Workflow` - Метаданные рабочего процесса (имя, описание, статус)
- `WorkflowNode` - Отдельные узлы в рабочем процессе
- `WorkflowEdge` - Соединения между узлами
- `NodeType` - Реестр доступных типов узлов

**Выполнение и логирование:**
- `WorkflowExecution` - Записи о запусках рабочих процессов
- `ExecutionNodeLog` - Подробные логи для каждого выполнения узла

**Учетные данные и совместное использование:**
- `Credential` - Зашифрованные ключи API и секреты
- `WorkflowShare` - Публичные ссылки и токены совместного использования для конкретных пользователей

### Ключевые связи

```
User (1) ──────────────────────── (N) Project (как владелец)
  │
  ├─ (1) ──────────────────────── (N) ProjectMember
  │
  ├─ (1) ──────────────────────── (N) Workflow (как создатель)
  │
  └─ (1) ──────────────────────── (N) WorkflowExecution (как инициатор)

Project (1) ──────────────────────── (N) Workflow
  │
  ├─ (1) ──────────────────────── (N) Credential
  │
  └─ (1) ──────────────────────── (N) ProjectMember

Workflow (1) ──────────────────────── (N) WorkflowNode
  │
  ├─ (1) ──────────────────────── (N) WorkflowEdge
  │
  └─ (1) ──────────────────────── (N) WorkflowExecution

WorkflowNode (N) ──────────────────────── (1) NodeType
  │
  └─ (N) ──────────────────────── (1) Credential (опционально)

WorkflowExecution (1) ──────────────────────── (N) ExecutionNodeLog
```

---

## 🔄 Движок выполнения рабочих процессов

### Поток выполнения

1. **Триггер** - Рабочий процесс запускается вручную или через вебхук
2. **Анализ графа** - Система определяет начальные узлы и строит граф выполнения
3. **Обработка очереди** - Узлы выполняются в топологическом порядке
4. **Выполнение узла** - Каждый обработчик узла обрабатывает входные данные и производит выходные данные
5. **Ветвление** - Узлы логики (IF, Switch) определяют пути выполнения
6. **Логирование** - Каждый шаг логируется со статусом, входными данными, выходными данными и длительностью
7. **Завершение** - Рабочий процесс завершается с успехом или ошибкой

### Типы узлов

#### Триггеры
- **Manual Trigger** - Запускает рабочий процесс вручную с опциональными входными данными
- **Webhook Trigger** - Запускает рабочий процесс через HTTP POST на сгенерированную конечную точку

#### Логика
- **IF** - Условное ветвление на основе выражений
- **Switch** - Маршрутизация выполнения в разные ветви на основе совпадения значений

#### Преобразование данных
- **Set** - Создание или переопределение полей данных
- **Transform** - Выполнение пользовательского JavaScript для преобразования данных

#### Действия
- **HTTP Request** - Выполнение HTTP запросов с заголовками, телом, параметрами запроса
- **Code** - Выполнение пользовательских фрагментов JavaScript
- **Delay** - Пауза выполнения на указанную длительность

#### Интеграции
- **DB Select** - Запрос записей из базы данных
- **DB Insert** - Вставка записей в базу данных

### Конечный автомат состояния выполнения

```
Состояния выполнения рабочего процесса:
  queued → running → success
                  ↘ failed → cancelled

Состояния выполнения узла:
  pending → running → success
                   ↘ failed
                   ↘ skipped
```

---

## 🔐 Аутентификация и авторизация

### Поток аутентификации

1. **Регистрация** - Пользователь создает учетную запись с именем пользователя, электронной почтой и паролем
2. **Вход** - Пользователь получает JWT токен доступа и токен обновления
3. **Защищенные маршруты** - Frontend хранит токены в cookies (рекомендуется httpOnly)
4. **Валидация токена** - Backend валидирует JWT при каждом запросе
5. **Обновление токена** - Истекшие токены доступа можно обновить с помощью токена обновления

### Модель авторизации

**Глобальные роли:**
- `ADMIN` - Системный администратор
- `USER` - Обычный пользователь

**Роли проекта:**
- `OWNER` - Полный контроль над проектом
- `EDITOR` - Может создавать и изменять рабочие процессы
- `VIEWER` - Доступ только для чтения

**Совместное использование рабочих процессов:**
- Публичные ссылки - Любой с ссылкой может просматривать/выполнять
- Токены пользователей - Конкретным пользователям предоставлен доступ через токен

---

## 🚀 Начало работы

### Предварительные требования

- Node.js 18+
- PostgreSQL 16+
- Docker & Docker Compose (опционально)

### Настройка Backend

```bash
cd backend

# Установка зависимостей
npm install

# Генерация Prisma клиента
npm run prisma:generate

# Запуск миграций базы данных
npm run prisma:migrate:dev

# Запуск сервера разработки
npm run dev
```

### Настройка Frontend

```bash
cd frontend

# Установка зависимостей
npm install

# Запуск сервера разработки
npm run dev
```

### Переменные окружения

Создайте файл `.env` в директории `backend/`:

```env
# База данных
DATABASE_URL=postgresql://user:password@localhost:5432/scenor

# JWT Секреты (минимум 32 символа)
JWT_ACCESS_SECRET=your-secret-key-min-32-chars-for-access-token
JWT_REFRESH_SECRET=your-secret-key-min-32-chars-for-refresh-token

# Шифрование учетных данных (64-символная hex строка для AES-256)
CREDENTIALS_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Сервер
PORT=3000
HOSTNAME=0.0.0.0
NODE_ENV=dev
```

### Настройка Docker

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f app

# Остановка сервисов
docker-compose down
```

---

## 📚 Документация API

### Swagger UI

После запуска backend, получите доступ к документации API по адресу:
```
http://localhost:3000/api
```

### Ключевые endpoints

**Аутентификация:**
- `POST /users/register` - Создание новой учетной записи пользователя
- `POST /users/login` - Вход и получение токенов
- `POST /users/refresh` - Обновление токена доступа

**Проекты:**
- `GET /projects` - Список проектов пользователя
- `POST /projects` - Создание нового проекта
- `GET /projects/:id` - Получение деталей проекта
- `PUT /projects/:id` - Обновление проекта
- `DELETE /projects/:id` - Удаление проекта

**Рабочие процессы:**
- `GET /projects/:projectId/workflows` - Список рабочих процессов
- `POST /projects/:projectId/workflows` - Создание рабочего процесса
- `GET /workflows/:id` - Получение рабочего процесса с узлами и ребрами
- `PUT /workflows/:id` - Обновление рабочего процесса
- `DELETE /workflows/:id` - Удаление рабочего процесса

**Узлы рабочего процесса:**
- `POST /workflows/:workflowId/nodes` - Создание узла
- `PUT /workflows/:workflowId/nodes/:nodeId` - Обновление узла
- `DELETE /workflows/:workflowId/nodes/:nodeId` - Удаление узла

**Ребра рабочего процесса:**
- `POST /workflows/:workflowId/edges` - Создание ребра
- `PUT /workflows/:workflowId/edges/:edgeId` - Обновление ребра
- `DELETE /workflows/:workflowId/edges/:edgeId` - Удаление ребра

**Выполнения:**
- `POST /workflows/:workflowId/execute` - Запуск рабочего процесса вручную
- `GET /workflows/:workflowId/executions` - Список истории выполнения
- `GET /workflows/:workflowId/executions/:executionId` - Получение деталей выполнения
- `GET /workflows/:workflowId/executions/:executionId/logs` - Получение логов выполнения

**Учетные данные:**
- `GET /projects/:projectId/credentials` - Список учетных данных
- `POST /projects/:projectId/credentials` - Создание учетных данных
- `PUT /projects/:projectId/credentials/:id` - Обновление учетных данных
- `DELETE /projects/:projectId/credentials/:id` - Удаление учетных данных

**Типы узлов:**
- `GET /node-types` - Список доступных типов узлов

**Совместное использование рабочих процессов:**
- `POST /workflows/:workflowId/share` - Создание ссылки совместного использования
- `GET /workflows/share/:token` - Доступ к общему рабочему процессу
- `GET /workflows/:workflowId/shares` - Список совместных использований
- `DELETE /workflows/:workflowId/shares/:shareId` - Удаление совместного использования

---

## 🧪 Тестирование

### Backend тесты

```bash
cd backend

# Запуск всех тестов
npm run test

# Запуск тестов в режиме наблюдения
npm run test:watch

# Генерация отчета о покрытии
npm run test:cov
```

### Frontend тесты

```bash
cd frontend

# Запуск тестов
npm run test

# Запуск тестов в режиме наблюдения
npm run test:watch
```

---

## 📝 Рекомендации по разработке

### Организация кода

- **Services** - Бизнес-логика и операции с базой данных
- **Controllers** - Обработка HTTP запросов и маршрутизация
- **DTOs** - Валидация данных и сериализация
- **Repositories** - Абстракция запросов к базе данных (при необходимости)
- **Guards** - Аутентификация и авторизация
- **Middleware** - Обработка запросов/ответов

### Соглашения об именовании

- **База данных** - `snake_case` (например, `workflow_node`, `created_at`)
- **TypeScript** - `camelCase` (например, `workflowNode`, `createdAt`)
- **Классы** - `PascalCase` (например, `WorkflowsService`)
- **Файлы** - `kebab-case` (например, `workflows.service.ts`)

### Валидация

- Используйте **Zod** для сложной валидации конфигурации узлов рабочего процесса
- Используйте **class-validator** для валидации DTO
- Всегда валидируйте входные данные пользователя перед операциями с базой данных

### Обработка ошибок

- Используйте встроенные исключения NestJS (`BadRequestException`, `NotFoundException`, `ForbiddenException`)
- Включайте описательные сообщения об ошибках
- Логируйте ошибки для отладки

### Миграции базы данных

```bash
cd backend

# Создание новой миграции
npm run prisma:migrate:dev

# Развертывание миграций в production
npm run prisma:migrate:deploy

# Просмотр базы данных в Prisma Studio
npm run studio
```

---

## 🔧 Частые задачи

### Добавление нового типа узла

1. **Определение типа узла** в `backend/src/node-types/node-types.defaults.ts`
2. **Создание обработчика** в сервисе выполнения
3. **Добавление схемы валидации** в `backend/src/workflows/node-config.schemas.ts`
4. **Тестирование выполнения** с примером рабочего процесса

### Добавление нового API endpoint

1. **Создание DTO** в `backend/src/feature/dto/`
2. **Добавление метода сервиса** в `backend/src/feature/feature.service.ts`
3. **Добавление метода контроллера** в `backend/src/feature/feature.controller.ts`
4. **Добавление маршрута** с правильными guards и валидацией
5. **Документирование** в декораторах Swagger

### Отладка выполнения рабочего процесса

1. Проверьте логи выполнения в базе данных: таблица `ExecutionNodeLog`
2. Просмотрите выход узла в `WorkflowExecution.outputDataJson`
3. Проверьте сообщение об ошибке в `WorkflowExecution.errorMessage`
4. Включите отладочное логирование в сервисе выполнения

---

## 📊 Соображения производительности

- **Обход графа** - Использует топологическую сортировку с защитой от бесконечных циклов
- **Пагинация** - Все endpoints списков поддерживают пагинацию limit/offset
- **Шифрование учетных данных** - Использует AES-256-GCM для безопасного хранения
- **Индексы базы данных** - Ключевые поля индексированы для производительности запросов
- **Пулинг соединений** - Prisma управляет пулом соединений с базой данных

---

## 🐛 Известные ограничения

- Выполнение рабочего процесса синхронное (нет асинхронной очереди заданий)
- Нет встроенного планирования рабочих процессов (только ручные/вебхук триггеры)
- Ограниченные типы узлов по сравнению с полным n8n
- Нет версионирования или отката рабочих процессов
- Однопоточное выполнение (нет параллельного выполнения узлов)

---

## 📖 Дополнительные ресурсы

- **CONTEXT.md** - Контекст проекта и архитектурные принципы
- **CODEBASE_OVERVIEW.md** - Подробный справочник для всех модулей
- **IMPLEMENTATION_GUIDE.md** - Примеры кода и лучшие практики
- **Swagger API Docs** - http://localhost:3000/api

---

## 👨‍💼 Информация о проекте

**Тип:** Дипломный проект  
**Статус:** MVP (реализованы основные функции)  
**Последнее обновление:** 29 апреля 2026  
**Лицензия:** UNLICENSED

---

## 📞 Поддержка и обратная связь

По вопросам, проблемам или предложениям обратитесь к документации проекта или свяжитесь с командой разработки.

---

**Создано с ❤️ используя NestJS, React и PostgreSQL**
