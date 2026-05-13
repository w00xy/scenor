# Требования к Панели Администрирования

## Обзор

Панель администрирования предназначена для пользователей с ролью `SUPER_ADMIN` и обеспечивает централизованное управление всей платформой автоматизации workflow.

---

## Mind Map: Функциональная Структура

```
                                    ADMIN PANEL
                                         |
        +--------------------------------+--------------------------------+
        |                                |                                |
   USER MANAGEMENT              SYSTEM MANAGEMENT              MONITORING & ANALYTICS
        |                                |                                |
        +-- User CRUD                    +-- Node Types                  +-- Platform Statistics
        +-- Role Management              +-- System Settings             +-- Execution Analytics
        +-- Bulk Operations               +-- Database Management         +-- User Activity
        +-- User Activity Logs            +-- Initialization              +-- Performance Metrics
        +-- Password Reset                +-- Backup/Restore              +-- Error Tracking
        |                                |                                |
   PROJECT MANAGEMENT            WORKFLOW MANAGEMENT              SECURITY & AUDIT
        |                                |                                |
        +-- View All Projects             +-- View All Workflows          +-- Audit Logs
        +-- Project Access Control        +-- Workflow Templates          +-- Access Logs
        +-- Project Analytics             +-- Execution History           +-- Security Events
        +-- Archive/Delete Projects       +-- Failed Executions           +-- Credential Audit
        +-- Transfer Ownership            +-- Workflow Shares             +-- Session Management
        |                                |                                |
   CREDENTIALS MANAGEMENT         CONTENT MODERATION              SYSTEM HEALTH
        |                                |                                |
        +-- View All Credentials          +-- Workflow Review             +-- Service Status
        +-- Credential Audit              +-- Share Management            +-- Database Health
        +-- Encryption Status             +-- Webhook Monitoring          +-- WebSocket Connections
        +-- Bulk Operations               +-- Abuse Detection             +-- Resource Usage
```

---

## Детальная Функциональность

### 1. USER MANAGEMENT (Управление Пользователями)

#### 1.1 Просмотр и Поиск Пользователей
- **Список всех пользователей** с пагинацией
- **Фильтрация**: по роли, дате регистрации, статусу активности
- **Поиск**: по username, email, имени
- **Сортировка**: по дате создания, последней активности, количеству проектов

#### 1.2 Управление Пользователями
- **Просмотр профиля**: полная информация о пользователе
  - Базовая информация (username, email, роль)
  - Профиль (firstName, lastName, bio, phone, avatarUrl)
  - Статистика (количество проектов, workflows, executions)
  - История активности
- **Редактирование пользователя**:
  - Изменение роли (USER ↔ SUPER_ADMIN)
  - Обновление email, username
  - Редактирование профиля
- **Блокировка/Разблокировка** пользователя (новое поле `isBlocked`)
- **Удаление пользователя** с каскадным удалением данных
- **Сброс пароля** (генерация временного пароля)

#### 1.3 Массовые Операции
- Экспорт списка пользователей (CSV, JSON)
- Массовая блокировка/разблокировка
- Массовое изменение ролей
- Массовое удаление неактивных пользователей

#### 1.4 Логи Активности Пользователей
- История входов (IP, время, устройство)
- История действий (создание/удаление проектов, workflows)
- История изменений профиля

---

### 2. PROJECT MANAGEMENT (Управление Проектами)

#### 2.1 Просмотр Всех Проектов
- **Список всех проектов** (PERSONAL и TEAM)
- **Фильтрация**: по типу, владельцу, статусу (archived/active)
- **Поиск**: по названию, описанию, владельцу
- **Статистика**: количество workflows, executions, участников

#### 2.2 Управление Проектами
- **Просмотр деталей проекта**:
  - Информация о проекте
  - Список участников с ролями
  - Список workflows
  - Статистика executions
- **Редактирование проекта**: название, описание
- **Управление участниками**:
  - Добавление/удаление участников
  - Изменение ролей (OWNER, EDITOR, VIEWER)
- **Передача владения** проекта другому пользователю
- **Архивация/Разархивация** проекта
- **Удаление проекта** с каскадным удалением

#### 2.3 Аналитика Проектов
- Топ проектов по количеству executions
- Топ проектов по количеству workflows
- Неактивные проекты (без executions за период)
- Проекты с ошибками

---

### 3. WORKFLOW MANAGEMENT (Управление Workflow)

#### 3.1 Просмотр Всех Workflows
- **Список всех workflows** из всех проектов
- **Фильтрация**: по проекту, статусу (draft/active/inactive/archived), владельцу
- **Поиск**: по названию, описанию
- **Статистика**: количество executions, success rate

#### 3.2 Управление Workflows
- **Просмотр workflow**:
  - Граф (nodes и edges)
  - Конфигурация nodes
  - История executions
- **Редактирование**: название, описание, статус
- **Клонирование workflow** в шаблон
- **Удаление workflow**

#### 3.3 Шаблоны Workflows
- **Создание шаблонов** из существующих workflows
- **Библиотека шаблонов** для пользователей
- **Категоризация шаблонов**

#### 3.4 История Выполнений
- **Просмотр всех executions** платформы
- **Фильтрация**: по статусу, workflow, проекту, дате
- **Детали execution**: logs, payload, ошибки
- **Повторный запуск** failed executions
- **Массовое удаление** старых executions

#### 3.5 Управление Shares
- **Список всех workflow shares**
- **Фильтрация**: по типу доступа, статусу (active/expired)
- **Отзыв доступа** (удаление share)
- **Аудит использования** shares

---

### 4. CREDENTIALS MANAGEMENT (Управление Учетными Данными)

#### 4.1 Просмотр Credentials
- **Список всех credentials** из всех проектов
- **Фильтрация**: по проекту, типу
- **Поиск**: по названию
- **Статистика использования**: в каких workflows используется

#### 4.2 Аудит Credentials
- История создания/изменения/удаления
- История доступа к credentials
- Неиспользуемые credentials
- Credentials без шифрования (если есть)

#### 4.3 Управление
- **Просмотр метаданных** (без расшифровки данных)
- **Удаление credentials**
- **Проверка целостности** шифрования

---

### 5. NODE TYPES MANAGEMENT (Управление Типами Узлов)

#### 5.1 Управление Node Types
- **Список всех node types**
- **Создание нового node type**:
  - Название, описание, категория
  - JSON Schema для конфигурации
  - Иконка, цвет
- **Редактирование node type**
- **Активация/Деактивация** node type
- **Удаление node type** (если не используется)

#### 5.2 Статистика Node Types
- Популярность использования каждого типа
- Node types с наибольшим количеством ошибок

---

### 6. SYSTEM SETTINGS (Системные Настройки)

#### 6.1 Общие Настройки
- **Регистрация пользователей**: включить/отключить
- **Лимиты**:
  - Максимальное количество проектов на пользователя
  - Максимальное количество workflows на проект
  - Максимальное количество executions в день
  - Максимальное время выполнения workflow
  - Максимальное количество nodes в workflow
- **JWT настройки**:
  - Время жизни access token
  - Время жизни refresh token
- **WebSocket настройки**:
  - Heartbeat interval
  - Max subscriptions per connection
  - Rate limiting

#### 6.2 Email Настройки
- SMTP конфигурация
- Email шаблоны (регистрация, сброс пароля)
- Тестирование отправки email

#### 6.3 Интеграции
- Webhook настройки (глобальные)
- API rate limiting
- CORS настройки

---

### 7. MONITORING & ANALYTICS (Мониторинг и Аналитика)

#### 7.1 Статистика Платформы
- **Общая статистика**:
  - Количество пользователей (всего, активных, новых за период)
  - Количество проектов (всего, активных)
  - Количество workflows (всего, по статусам)
  - Количество executions (всего, за период, по статусам)
- **Графики**:
  - Регистрации пользователей по времени
  - Executions по времени
  - Success rate по времени

#### 7.2 Аналитика Executions
- **Статистика выполнений**:
  - Общее количество executions
  - Success rate (%)
  - Average execution time
  - Failed executions (топ причин)
- **Графики**:
  - Executions по часам/дням/месяцам
  - Success vs Failed
  - Execution time distribution

#### 7.3 Активность Пользователей
- **Топ активных пользователей**:
  - По количеству executions
  - По количеству workflows
  - По времени в системе
- **Неактивные пользователи**: без активности за период

#### 7.4 Метрики Производительности
- **API метрики**:
  - Request rate
  - Response time
  - Error rate
- **Database метрики**:
  - Query performance
  - Connection pool usage
  - Slow queries

#### 7.5 Отслеживание Ошибок
- **Лог ошибок**:
  - Application errors
  - Execution errors
  - Node errors
- **Группировка** по типу ошибки
- **Алерты** при критических ошибках

---

### 8. SECURITY & AUDIT (Безопасность и Аудит)

#### 8.1 Audit Logs (Журнал Аудита)
- **Логирование всех административных действий**:
  - Создание/удаление пользователей
  - Изменение ролей
  - Удаление проектов/workflows
  - Изменение системных настроек
  - Доступ к credentials
- **Фильтрация**: по действию, пользователю, дате
- **Экспорт** логов

#### 8.2 Access Logs (Логи Доступа)
- История входов в систему
- Неудачные попытки входа
- Подозрительная активность (множественные неудачные попытки)

#### 8.3 Security Events (События Безопасности)
- Изменения паролей
- Изменения ролей
- Доступ к чувствительным данным
- Массовые операции

#### 8.4 Session Management (Управление Сессиями)
- **Активные сессии** всех пользователей
- **Принудительное завершение** сессии
- **Массовое завершение** сессий пользователя

---

### 9. SYSTEM HEALTH (Здоровье Системы)

#### 9.1 Service Status (Статус Сервисов)
- **Backend API**: статус, uptime
- **Database**: статус, connection pool
- **WebSocket Gateway**: статус, активные соединения

#### 9.2 Database Health (Здоровье БД)
- **Размер базы данных**
- **Количество записей** в каждой таблице
- **Индексы**: статус, фрагментация
- **Slow queries**: топ медленных запросов

#### 9.3 WebSocket Connections
- **Активные соединения**: количество, пользователи
- **Subscriptions**: количество активных подписок
- **Heartbeat status**: статус ping-pong

#### 9.4 Resource Usage (Использование Ресурсов)
- **CPU usage**
- **Memory usage**
- **Disk usage**
- **Network I/O**

---

### 10. DATABASE MANAGEMENT (Управление БД)

#### 10.1 Maintenance (Обслуживание)
- **Очистка старых данных**:
  - Удаление старых executions (старше N дней)
  - Удаление старых audit logs
  - Удаление неактивных shares
- **Оптимизация таблиц**
- **Переиндексация**

#### 10.2 Backup & Restore (Резервное Копирование)
- **Создание backup** базы данных
- **Расписание автоматических backup**
- **Восстановление** из backup
- **Список backup**: дата, размер, статус

---

### 11. CONTENT MODERATION (Модерация Контента)

#### 11.1 Workflow Review (Проверка Workflows)
- **Подозрительные workflows**:
  - С большим количеством HTTP requests
  - С code nodes (потенциально опасный код)
  - С высоким failure rate
- **Ручная проверка** workflow
- **Блокировка workflow**

#### 11.2 Abuse Detection (Обнаружение Злоупотреблений)
- **Обнаружение аномалий**:
  - Пользователи с чрезмерным количеством executions
  - Пользователи с множественными failed executions
  - Подозрительные webhook вызовы
- **Автоматические алерты**
- **Блокировка пользователя/workflow**

---

## Архитектура Панели Администрирования

### Технический Стек

#### Backend
- **Новый модуль**: `src/admin/`
- **Guard**: `AdminGuard` (проверка роли SUPER_ADMIN)
- **Контроллеры**:
  - `AdminUsersController`
  - `AdminProjectsController`
  - `AdminWorkflowsController`
  - `AdminCredentialsController`
  - `AdminNodeTypesController`
  - `AdminSystemController`
  - `AdminAnalyticsController`
  - `AdminAuditController`
  - `AdminHealthController`

#### Frontend
- **Отдельный раздел**: `/admin`
- **Роутинг**: защищенные маршруты для SUPER_ADMIN
- **Компоненты**:
  - Dashboard с общей статистикой
  - Таблицы с фильтрацией и пагинацией
  - Графики и диаграммы (Chart.js / Recharts)
  - Формы редактирования
  - Модальные окна для подтверждения действий

### Безопасность

1. **Авторизация**: все эндпоинты защищены `@Roles('SUPER_ADMIN')`
2. **Аудит**: все действия логируются в `AdminAuditLog`
3. **Rate Limiting**: ограничение запросов к admin API
4. **CSRF Protection**: защита от CSRF атак
5. **Sensitive Data**: маскирование чувствительных данных в логах

### Новые Модели БД

```prisma
model AdminAuditLog {
  id          String   @id @default(uuid())
  adminId     String
  admin       User     @relation(fields: [adminId], references: [id])
  action      String   // "USER_DELETE", "ROLE_CHANGE", etc.
  targetType  String   // "USER", "PROJECT", "WORKFLOW", etc.
  targetId    String?
  details     Json?    // Дополнительная информация
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
}

model SystemSettings {
  id                      String   @id @default(uuid())
  key                     String   @unique
  value                   Json
  description             String?
  updatedBy               String?
  updatedByUser           User?    @relation(fields: [updatedBy], references: [id])
  updatedAt               DateTime @updatedAt
}

model UserActivityLog {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  action      String   // "LOGIN", "LOGOUT", "CREATE_PROJECT", etc.
  details     Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())
}
```

---

## API Endpoints (Примеры)

### User Management
```
GET    /admin/users                    - Список пользователей
GET    /admin/users/:id                - Детали пользователя
PUT    /admin/users/:id                - Обновление пользователя
DELETE /admin/users/:id                - Удаление пользователя
POST   /admin/users/:id/block          - Блокировка пользователя
POST   /admin/users/:id/unblock        - Разблокировка пользователя
POST   /admin/users/:id/reset-password - Сброс пароля
GET    /admin/users/:id/activity       - История активности
```

### Project Management
```
GET    /admin/projects                 - Список проектов
GET    /admin/projects/:id             - Детали проекта
PUT    /admin/projects/:id             - Обновление проекта
DELETE /admin/projects/:id             - Удаление проекта
POST   /admin/projects/:id/transfer    - Передача владения
```

### Workflow Management
```
GET    /admin/workflows                - Список workflows
GET    /admin/workflows/:id            - Детали workflow
DELETE /admin/workflows/:id            - Удаление workflow
GET    /admin/workflows/:id/executions - История executions
```

### Analytics
```
GET    /admin/analytics/platform       - Общая статистика
GET    /admin/analytics/executions     - Аналитика executions
GET    /admin/analytics/users          - Аналитика пользователей
```

### System
```
GET    /admin/system/settings          - Системные настройки
PUT    /admin/system/settings          - Обновление настроек
GET    /admin/system/health            - Здоровье системы
POST   /admin/system/maintenance       - Обслуживание БД
```

### Audit
```
GET    /admin/audit/logs               - Журнал аудита
GET    /admin/audit/access             - Логи доступа
GET    /admin/audit/security           - События безопасности
```

---

## Приоритизация Функций

### Phase 1 (MVP)
1. User Management (просмотр, редактирование, удаление, изменение ролей)
2. Platform Statistics (базовая статистика)
3. Audit Logs (логирование административных действий)
4. Project Management (просмотр, удаление)
5. Workflow Management (просмотр, удаление)

### Phase 2
1. Analytics Dashboard (графики и диаграммы)
2. System Settings (управление настройками)
3. Node Types Management
4. Credentials Management
5. User Activity Logs

### Phase 3
1. Content Moderation
2. Abuse Detection
3. Database Management (backup/restore)
4. System Health Monitoring
5. Advanced Analytics

---

## UI/UX Рекомендации

### Layout
- **Sidebar Navigation**: разделы админ-панели
- **Top Bar**: поиск, уведомления, профиль админа
- **Main Content Area**: таблицы, графики, формы

### Компоненты
- **Data Tables**: с сортировкой, фильтрацией, пагинацией
- **Charts**: линейные, столбчатые, круговые диаграммы
- **Cards**: для отображения статистики
- **Modals**: для подтверждения опасных действий
- **Alerts**: для уведомлений об успехе/ошибке

### Цветовая Схема
- **Primary**: для основных действий
- **Danger**: для опасных действий (удаление, блокировка)
- **Success**: для успешных операций
- **Warning**: для предупреждений
- **Info**: для информационных сообщений

### Responsive Design
- Адаптивность для планшетов и десктопов
- Мобильная версия (опционально)

---

## Метрики Успеха

1. **Эффективность управления**: время на выполнение административных задач
2. **Прозрачность**: доступность информации о системе
3. **Безопасность**: полнота аудита действий
4. **Производительность**: скорость загрузки данных и графиков
5. **Удобство**: простота навигации и выполнения задач
