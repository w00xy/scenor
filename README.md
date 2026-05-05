# Scenor - Платформа автоматизации workflow

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red.svg)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.6.0-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)

Дипломный проект - упрощенная платформа автоматизации рабочих процессов. Позволяет создавать workflow из узлов (nodes) и связей (edges), выполнять их и отслеживать результаты.

## 📊 Статус проекта

**Дата обновления:** 5 мая 2026

✅ **Backend MVP** - полностью реализован и готов к использованию
- 13 модулей (10 feature + 3 shared)
- 50+ API endpoints
- Полная система аутентификации и авторизации
- Execution engine с поддержкой условной логики
- Шифрование credentials (AES-256-GCM)
- Audit trail для критических операций

🚧 **Frontend** - в разработке другим разработчиком
- Backend API готов для интеграции
- Swagger документация доступна

## 🚀 Технологии

### Backend
- **Framework:** NestJS 11.0.1
- **Язык:** TypeScript 5.7.3
- **ORM:** Prisma 7.6.0
- **База данных:** PostgreSQL 16
- **Аутентификация:** JWT (access + refresh tokens)
- **Валидация:** Zod 4.3.6 + class-validator 0.14.4
- **Шифрование:** AES-256-GCM для credentials
- **Хеширование:** bcrypt 6.0.0
- **API документация:** Swagger 11.0.0
- **WebSocket:** Socket.io для real-time updates

### База данных
- PostgreSQL 16 (Alpine)
- 13 моделей Prisma
- Полная система миграций

## ⚡ Быстрый старт

### Требования
- Node.js 18+
- PostgreSQL 12+
- npm или yarn

### Установка

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

### Переменные окружения

Создайте файл `.env` в папке `backend/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/scenor
JWT_ACCESS_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-secret-key-min-32-chars
CREDENTIALS_ENCRYPTION_KEY=64-character-hex-string-for-aes256
PORT=3000
HOSTNAME=0.0.0.0
```

## 📚 API документация

После запуска backend:
- **Swagger UI:** http://localhost:3000/api
- **OpenAPI spec:** http://localhost:3000/api-json
- **Prisma Studio:** `npm run studio` (в папке backend)

## 📁 Структура проекта

```
scenor/
├── backend/                    # NestJS backend (готов)
│   ├── src/
│   │   ├── users/             # Модуль пользователей
│   │   ├── profiles/          # Модуль профилей
│   │   ├── projects/          # Модуль проектов
│   │   ├── workflows/         # Модуль workflow
│   │   ├── executions/        # Execution engine
│   │   ├── node-types/        # Реестр типов узлов
│   │   ├── credentials/       # Управление credentials
│   │   ├── workflow-shares/   # Публичный доступ
│   │   ├── auth/              # Аутентификация
│   │   ├── database/          # Prisma client
│   │   └── config/            # Конфигурация
│   ├── prisma/
│   │   ├── schema.prisma      # Главная схема
│   │   ├── user.prisma        # Модели пользователей
│   │   ├── project.prisma     # Модели проектов
│   │   ├── workflow.prisma    # Модели workflow
│   │   └── migrations/        # Миграции БД
│   ├── test/                  # Тесты
│   └── package.json
├── frontend/                   # React frontend (в разработке)
├── CONTEXT/                    # Детальная документация
│   ├── CODEBASE_OVERVIEW.md   # Обзор кодовой базы
│   ├── IMPLEMENTATION_GUIDE.md # Руководство по разработке
│   └── README_EXPLORATION.md  # Итоги исследования
├── CONTEXT.md                  # Обзор проекта и архитектуры
├── README.md                   # Этот файл
└── docker-compose.yml          # Docker конфигурация
```

## ✨ Основные возможности

### Реализовано ✅

**Аутентификация и авторизация:**
- ✅ Регистрация пользователей с валидацией
- ✅ Логин с JWT токенами (access + refresh)
- ✅ Role-based access control (USER, SUPER_ADMIN)
- ✅ Project-level permissions (OWNER, EDITOR, VIEWER)

**Управление проектами:**
- ✅ CRUD операции для проектов
- ✅ Управление членством в проектах
- ✅ Типы проектов (PERSONAL, TEAM)
- ✅ Архивация проектов

**Workflow management:**
- ✅ Создание и редактирование workflow
- ✅ Визуальное построение графа (nodes + edges)
- ✅ 11 типов узлов (triggers, logic, data, actions)
- ✅ Валидация конфигурации узлов через Zod
- ✅ Статусы workflow (draft, active, inactive, archived)

**Execution engine:**
- ✅ Запуск workflow вручную
- ✅ Топологическая сортировка узлов
- ✅ Условное ветвление (if/switch)
- ✅ Логирование выполнения узлов
- ✅ История всех запусков
- ✅ Обработка ошибок

**Credentials management:**
- ✅ Шифрование credentials (AES-256-GCM)
- ✅ Привязка credentials к узлам
- ✅ Scope credentials к проектам
- ✅ Безопасное хранение секретов

**Workflow sharing:**
- ✅ Публичный доступ через токены
- ✅ Типы доступа (view, comment, edit)
- ✅ Срок действия токенов
- ✅ Доступ к workflow по ссылке

**Audit и безопасность:**
- ✅ Audit trail для удаления executions
- ✅ Логирование критических операций
- ✅ Защита от удаления running executions
- ✅ Bcrypt для паролей
- ✅ Input validation (Zod + class-validator)

### Частично реализовано ⚠️

- ⚠️ **Webhook triggers** - backend определен, но не полностью реализован
- ⚠️ **Database nodes** (db_select, db_insert) - только заглушки

### Не реализовано ❌

- ❌ Frontend визуальный редактор (в разработке другим разработчиком)
- ❌ Cron scheduling для автоматического запуска
- ❌ Real-time collaboration между пользователями
- ❌ Workflow versioning
- ❌ Team invitations UI
- ❌ Activity logs UI
- ❌ Monitoring dashboard
- ❌ Экспорт/импорт workflows

## 🔧 Типы узлов

### Триггеры (2)
- **manual_trigger** - ручной запуск workflow
- **webhook_trigger** - запуск через webhook (частично)

### Логика (2)
- **if** - условное ветвление (режимы: all/any)
- **switch** - множественное ветвление по выражению

### Данные (2)
- **set** - установка/изменение значений полей
- **transform** - трансформация данных через JavaScript

### Действия (3)
- **http_request** - HTTP запросы с поддержкой credentials
- **code** - выполнение JavaScript кода
- **delay** - задержка выполнения на указанное время

### База данных (2 - заглушки)
- **db_select** - выборка из БД (placeholder)
- **db_insert** - вставка в БД (placeholder)

## 🗄️ База данных

### 13 моделей Prisma:

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

## 📖 Документация

### Основная документация
- **[CONTEXT.md](./CONTEXT.md)** - Полный обзор проекта и архитектуры
- **[README.md](./README.md)** - Этот файл (быстрый старт)

### Детальная документация (папка CONTEXT/)
- **[CODEBASE_OVERVIEW.md](./CONTEXT/CODEBASE_OVERVIEW.md)** - Полный обзор кодовой базы (681 строка)
  - Структура модулей и зависимости
  - API endpoints reference
  - Матрица прав доступа
  - Troubleshooting guide
  
- **[IMPLEMENTATION_GUIDE.md](./CONTEXT/IMPLEMENTATION_GUIDE.md)** - Руководство по разработке (897 строк)
  - Пошаговые инструкции добавления функций
  - Примеры кода
  - Best practices
  - Общие паттерны
  - Debugging guide
  
- **[README_EXPLORATION.md](./CONTEXT/README_EXPLORATION.md)** - Итоги исследования проекта (448 строк)
  - Анализ архитектуры
  - Метрики качества кода
  - Рекомендации по развитию

### API документация
- **Swagger UI:** http://localhost:3000/api (после запуска backend)
- **OpenAPI spec:** http://localhost:3000/api-json

### База данных
- **Prisma Studio:** `npm run studio` (в папке backend)
- **Схемы:** `backend/prisma/*.prisma`
- **Миграции:** `backend/prisma/migrations/`

## 🏗️ Архитектурные принципы

### 1. Workflow = Граф
Workflow представляет собой направленный граф из узлов и рёбер. Execution engine обходит граф, выполняя узлы в правильном порядке.

### 2. Универсальные узлы
Все узлы хранятся в одной таблице `workflow_nodes`. Поведение определяется через `typeCode` и `configJson` (JSONB).

### 3. Разделение design-time и runtime
- **Design-time:** workflows, nodes, edges (структура)
- **Runtime:** executions, logs (выполнение)

### 4. Секреты отдельно
Credentials хранятся в отдельной таблице с шифрованием AES-256-GCM, а не внутри конфигурации узлов.

## 🔒 Безопасность

- ✅ JWT access tokens (15 минут) + refresh tokens (7 дней)
- ✅ AES-256-GCM шифрование для credentials
- ✅ Bcrypt для хеширования паролей
- ✅ Role-based access control (USER, SUPER_ADMIN)
- ✅ Project-level permissions (OWNER, EDITOR, VIEWER)
- ✅ Input validation (Zod + class-validator)
- ✅ Audit trail для критических операций

## 🧪 Тестирование

```bash
# Запустить все тесты
npm run test

# Запустить тесты в watch режиме
npm run test:watch

# Запустить тесты с coverage
npm run test:cov

# Запустить e2e тесты
npm run test:e2e
```

## 🛠️ Полезные команды

### Backend

```bash
npm run dev              # Запустить dev server с hot reload
npm run build            # Собрать для production
npm run start:prod       # Запустить production build
npm run lint             # Запустить ESLint
npm run format           # Форматировать код с Prettier
npm run test             # Запустить тесты
npm run test:watch       # Запустить тесты в watch режиме
npm run prisma:migrate:dev    # Создать и применить миграцию
npm run prisma:generate       # Сгенерировать Prisma client
npm run studio                # Открыть Prisma Studio
```

## 🎓 Тип проекта

**Дипломный проект - 2026**

Это упрощённая платформа автоматизации workflow (аналог n8n) для дипломного проекта. Проект демонстрирует:
- Чистую архитектуру backend на NestJS
- Работу с графами и топологической сортировкой
- Систему аутентификации и авторизации
- Шифрование чувствительных данных
- Execution engine для выполнения workflow
- RESTful API с полной документацией

## 📝 Лицензия

UNLICENSED (частный проект)

## 👥 Команда

- **Backend:** Полностью реализован
- **Frontend:** В разработке другим разработчиком

## 🔗 Ссылки

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)

---

**Последнее обновление:** 5 мая 2026  
**Версия:** 1.0 (Backend MVP)  
**Статус:** Backend готов к использованию
