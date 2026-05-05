# Детальный анализ различий между ветками main и backend-nest

**Дата анализа:** 5 мая 2026  
**Анализируемая папка:** `backend/`

## Общая статистика

- **Измененных файлов:** 20
- **Добавлено строк:** 27
- **Удалено строк:** 966
- **Коммитов в main (не в backend-nest):** 10+
- **Коммитов в backend-nest (не в main):** 1

---

## 1. Удаленный файл: backend/schema.sql

### ❌ В main: отсутствует
### ✅ В backend-nest: присутствует (819 строк)

**Описание:** Полный SQL дамп схемы базы данных PostgreSQL.

**Рекомендация:** Удалить из backend-nest, так как схема управляется через Prisma миграции.

---

## 2. Database Service - Логика подключения к БД

### Файл: `backend/src/database/database.service.ts`

#### В main (текущая версия):
```typescript
import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';

export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(maxRetries = 10, delayMs = 2000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Attempting to connect to database (attempt ${attempt}/${maxRetries})...`);
        await this.$connect();
        this.logger.log('Successfully connected to database');
        return;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Database connection attempt ${attempt} failed: ${errorMessage}`);
        
        if (attempt === maxRetries) {
          this.logger.error('Max retries reached. Could not connect to database.');
          throw error;
        }
        
        this.logger.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
}
```

#### В backend-nest:
```typescript
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

export class DatabaseService {
  async onModuleInit() {
    await this.$connect();
  }
}
```

**Различия:**
- ✅ **main:** Добавлена логика retry с логированием (10 попыток, задержка 2 секунды)
- ❌ **backend-nest:** Простое подключение без retry

**Рекомендация:** Использовать версию из main - retry логика критична для production и Docker окружения.

---

## 3. API Tags в контроллерах - Локализация

### Файлы контроллеров

#### В main:
```typescript
@ApiTags('Credentials')           // credentials.controller.ts
@ApiTags('Workflow Executions')   // executions.controller.ts
@ApiTags('Node Types')            // node-types.controller.ts
@ApiTags('Workflow Shares')       // workflow-shares.controller.ts
```

#### В backend-nest:
```typescript
@ApiTags('Учётные данные')        // credentials.controller.ts
@ApiTags('Выполнение Workflow')   // executions.controller.ts
@ApiTags('Типы узлов')            // node-types.controller.ts
@ApiTags('Общий доступ к Workflow') // workflow-shares.controller.ts
```

**Различия:**
- ✅ **main:** Английские теги (стандарт для API)
- ❌ **backend-nest:** Русские теги

**Рекомендация:** Использовать английские теги из main - это стандарт для REST API и Swagger документации.

---

## 4. DTO: AuthResponseDto - Структура ответа аутентификации

### Файл: `backend/src/users/dto/auth-response.dto.ts`

#### В main:
```typescript
export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access токен для авторизации',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh токен для обновления access токена',
  })
  refreshToken!: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'Информация о пользователе',
  })
  user!: UserResponseDto;  // ← Полный объект пользователя
}
```

#### В backend-nest:
```typescript
export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID пользователя',
  })
  userId!: string;  // ← Только ID
}
```

**Различия:**
- ✅ **main:** Возвращает полный объект пользователя (id, username, email, role, timestamps)
- ❌ **backend-nest:** Возвращает только userId

**Рекомендация:** Использовать версию из main - frontend обычно нуждается в полной информации о пользователе после логина.

---

## 5. DTO: UserResponseDto - Название поля роли

### Файл: `backend/src/users/dto/user-response.dto.ts`

#### В main:
```typescript
export class UserResponseDto {
  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'Глобальная роль пользователя',
  })
  role!: Role;  // ← Короткое имя
}
```

#### В backend-nest:
```typescript
export class UserResponseDto {
  @ApiProperty({
    enum: Role,
    example: Role.USER,
    description: 'Глобальная роль пользователя',
  })
  globalRole!: Role;  // ← Более описательное имя
}
```

**Различия:**
- ✅ **main:** Поле `role`
- ✅ **backend-nest:** Поле `globalRole` (более явное, отличает от project role)

**Рекомендация:** `globalRole` из backend-nest более явное и понятное, особенно когда есть project-level роли.

---

## 6. DTO: ProjectResponseDto - Дополнительные поля

### Файл: `backend/src/projects/dto/project-response.dto.ts`

#### В main:
```typescript
export class ProjectResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  ownerId!: string;
  
  @ApiProperty({
    enum: ProjectType,
    example: ProjectType.TEAM,
    description: 'Тип проекта',
  })
  type!: ProjectType;  // ← PERSONAL или TEAM

  @ApiProperty({
    example: false,
    description: 'Архивирован ли проект',
  })
  isArchived!: boolean;  // ← Статус архивации
  
  createdAt!: Date;
  updatedAt!: Date;

  @ApiProperty({
    enum: ProjectMemberRole,
    example: ProjectMemberRole.OWNER,
    description: 'Роль пользователя в проекте (только для списка проектов)',
    required: false,
  })
  accessRole?: ProjectMemberRole;  // ← Роль текущего пользователя
}
```

#### В backend-nest:
```typescript
export class ProjectResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  ownerId!: string;
  createdAt!: Date;
  updatedAt!: Date;
  // Нет полей: type, isArchived, accessRole
}
```

**Различия:**
- ✅ **main:** Включает `type`, `isArchived`, `accessRole`
- ❌ **backend-nest:** Минимальный набор полей

**Рекомендация:** Использовать версию из main - эти поля важны для UI (фильтрация архивных, отображение типа, проверка прав).

---

## 7. DTO: WorkflowResponseDto - Структура workflow

### Файл: `backend/src/workflows/dto/workflow-response.dto.ts`

#### В main:
```typescript
export class WorkflowResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  projectId!: string;
  
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID создателя workflow',
    nullable: true,
  })
  createdBy!: string | null;

  @ApiProperty({
    enum: WorkflowStatus,
    example: WorkflowStatus.draft,
    description: 'Статус workflow',
  })
  status!: WorkflowStatus;  // draft | active | inactive | archived

  @ApiProperty({
    example: 1,
    description: 'Версия workflow',
  })
  version!: number;

  @ApiProperty({
    example: false,
    description: 'Публичный ли workflow',
  })
  isPublic!: boolean;
  
  createdAt!: Date;
  updatedAt!: Date;
}
```

#### В backend-nest:
```typescript
export class WorkflowResponseDto {
  id!: string;
  name!: string;
  description!: string | null;
  projectId!: string;

  @ApiProperty({
    example: true,
    description: 'Активен ли workflow',
  })
  isActive!: boolean;  // ← Упрощенный статус
  
  createdAt!: Date;
  updatedAt!: Date;
  // Нет полей: createdBy, status, version, isPublic
}
```

**Различия:**
- ✅ **main:** Полная модель с `createdBy`, `status` (enum), `version`, `isPublic`
- ❌ **backend-nest:** Упрощенная модель с булевым `isActive`

**Рекомендация:** Использовать версию из main - соответствует Prisma схеме и требованиям проекта.

---

## 8. DTO: WorkflowGraphResponseDto - ID workflow

### Файл: `backend/src/workflows/dto/workflow-graph-response.dto.ts`

#### В main:
```typescript
export class WorkflowGraphResponseDto {
  @ApiProperty({
    type: [WorkflowNodeResponseDto],
    description: 'Список узлов в workflow',
  })
  nodes!: WorkflowNodeResponseDto[];

  @ApiProperty({
    type: [WorkflowEdgeResponseDto],
    description: 'Список связей между узлами',
  })
  edges!: WorkflowEdgeResponseDto[];
}
```

#### В backend-nest:
```typescript
export class WorkflowGraphResponseDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID workflow',
  })
  workflowId!: string;  // ← Дополнительное поле

  @ApiProperty({
    type: [WorkflowNodeResponseDto],
    description: 'Список узлов в workflow',
  })
  nodes!: WorkflowNodeResponseDto[];

  @ApiProperty({
    type: [WorkflowEdgeResponseDto],
    description: 'Список связей между узлами',
  })
  edges!: WorkflowEdgeResponseDto[];
}
```

**Различия:**
- ✅ **main:** Только nodes и edges
- ✅ **backend-nest:** Дополнительно включает workflowId

**Рекомендация:** Версия из backend-nest с `workflowId` может быть полезна, но обычно ID уже известен из контекста запроса.

---

## 9. DTO: List Response DTOs - Наследование

### Файлы: `projects-list-response.dto.ts`, `workflows-list-response.dto.ts`

#### В main:
```typescript
export class ProjectsListResponseDto extends Array<ProjectResponseDto> {
  @ApiProperty({
    type: [ProjectResponseDto],
    description: 'Список проектов пользователя',
  })
  projects!: ProjectResponseDto[];
}
```

#### В backend-nest:
```typescript
export class ProjectsListResponseDto {
  @ApiProperty({
    type: [ProjectResponseDto],
    description: 'Список проектов пользователя',
  })
  projects!: ProjectResponseDto[];
}
```

**Различия:**
- ❌ **main:** Наследуется от `Array<T>` (странный паттерн)
- ✅ **backend-nest:** Обычный класс с полем `projects`

**Рекомендация:** Использовать версию из backend-nest - наследование от Array не имеет смысла для DTO.

---

## 10. Workflows Service - Автоматическое обновление updatedAt

### Файл: `backend/src/workflows/workflows.service.ts`

#### В main:
```typescript
async createNode(userId: string, workflowId: string, data: CreateWorkflowNodeDto) {
  // ... валидация и подготовка данных
  
  const createdNode = await this.prisma.workflowNode.create({
    data: { /* ... */ }
  });

  // ❌ НЕТ автоматического обновления updatedAt у workflow

  return createdNode;
}

async updateNode(userId: string, workflowId: string, nodeId: string, data: UpdateWorkflowNodeDto) {
  // ... валидация
  
  return this.prisma.workflowNode.update({
    where: { id: nodeId },
    data: updateData,
  });
  
  // ❌ НЕТ автоматического обновления updatedAt у workflow
}

async deleteNode(userId: string, workflowId: string, nodeId: string) {
  // ... валидация
  
  return this.prisma.workflowNode.delete({
    where: { id: nodeId },
  });
  
  // ❌ НЕТ автоматического обновления updatedAt у workflow
}

// То же самое для createEdge, updateEdge, deleteEdge
```

#### В backend-nest:
```typescript
async createNode(userId: string, workflowId: string, data: CreateWorkflowNodeDto) {
  // ... валидация и подготовка данных
  
  const createdNode = await this.prisma.workflowNode.create({
    data: { /* ... */ }
  });

  // ✅ Обновляем updatedAt у workflow
  await this.prisma.workflow.update({
    where: { id: workflowId },
    data: { updatedAt: new Date() },
  });

  return createdNode;
}

async updateNode(userId: string, workflowId: string, nodeId: string, data: UpdateWorkflowNodeDto) {
  // ... валидация
  
  const updatedNode = await this.prisma.workflowNode.update({
    where: { id: nodeId },
    data: updateData,
  });

  // ✅ Обновляем updatedAt у workflow
  await this.prisma.workflow.update({
    where: { id: workflowId },
    data: { updatedAt: new Date() },
  });

  return updatedNode;
}

// То же самое для всех операций с nodes и edges
```

**Различия:**
- ❌ **main:** НЕ обновляет `workflow.updatedAt` при изменении nodes/edges
- ✅ **backend-nest:** Автоматически обновляет `workflow.updatedAt` при любых изменениях

**Рекомендация:** Версия из backend-nest более правильная - изменение узлов/связей должно обновлять timestamp workflow.

---

## 11. Users Module - Экспорты

### Файл: `backend/src/users/users.module.ts`

#### В main:
```typescript
@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [UsersService, UsersRepository, UsersUtils],
  controllers: [UsersController],
  exports: [UsersService, UsersUtils],  // ← Экспортирует UsersUtils
})
export class UsersModule {}
```

#### В backend-nest:
```typescript
@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [UsersService, UsersRepository, UsersUtils],
  controllers: [UsersController],
  exports: [UsersService],  // ← Не экспортирует UsersUtils
})
export class UsersModule {}
```

**Различия:**
- ✅ **main:** Экспортирует `UsersUtils` (может использоваться в других модулях)
- ❌ **backend-nest:** Не экспортирует `UsersUtils`

**Рекомендация:** Проверить, используется ли `UsersUtils` в других модулях. Если да - использовать версию из main.

---

## 12. Users Repository - Название личного проекта

### Файл: `backend/src/users/users.repository.ts`

#### В main:
```typescript
await this.prisma.project.create({
  data: {
    ownerId: user.id,
    type: ProjectType.PERSONAL,
    name: 'Личный',  // ← Русское название
    description: '',
  },
});
```

#### В backend-nest:
```typescript
await this.prisma.project.create({
  data: {
    ownerId: user.id,
    type: ProjectType.PERSONAL,
    name: 'Personal',  // ← Английское название
    description: '',
  },
});
```

**Различия:**
- ✅ **main:** "Личный" (русский)
- ✅ **backend-nest:** "Personal" (английский)

**Рекомендация:** Зависит от целевой аудитории. Для международного проекта - "Personal", для русскоязычного - "Личный".

---

## 13. Database Service Test - Неиспользуемая переменная

### Файл: `backend/src/database/database.service.spec.ts`

#### В main:
```typescript
describe('DatabaseService', () => {
  let service: DatabaseService;
  const originalDatabaseUrl = process.env.DATABASE_URL;  // ← Объявлена, но не используется
  
  // ...
});
```

#### В backend-nest:
```typescript
describe('DatabaseService', () => {
  let service: DatabaseService;
  // ← Переменная удалена
  
  // ...
});
```

**Различия:**
- ❌ **main:** Неиспользуемая переменная
- ✅ **backend-nest:** Чистый код

**Рекомендация:** Использовать версию из backend-nest - удалить неиспользуемую переменную.

---

## 14. Dockerfile - npm ci флаги

### Файл: `backend/Dockerfile`

#### В main:
```dockerfile
RUN --mount=type=cache,target=/root/.npm \
    npm ci --cache /root/.npm --prefer-offline --no-audit
```

#### В backend-nest:
```dockerfile
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

**Различия:**
- ✅ **main:** Дополнительные флаги оптимизации (`--cache`, `--prefer-offline`, `--no-audit`)
- ❌ **backend-nest:** Базовая команда

**Рекомендация:** Использовать версию из main - оптимизирует Docker build время.

---

## 15. Package.json - Порядок скриптов

### Файл: `backend/package.json`

#### В main:
```json
{
  "scripts": {
    "setup": "npm run prisma:generate && npm run prisma:migrate:dev && npm run build",
    "setup:deploy": "npm run prisma:generate && npm run prisma:migrate:deploy && npm run build",
    "build": "nest build",
    // ...
    "prisma:migrate:deploy": "prisma migrate deploy",
    "studio": "prisma studio",
    "studio:wsl": "prisma studio --port 5555 --browser none",
    "prisma:generate":"prisma generate"  // ← В конце
  }
}
```

#### В backend-nest:
```json
{
  "scripts": {
    "prisma:generate": "prisma generate",  // ← В начале
    "setup": "npm run prisma:generate && npm run prisma:migrate:dev && npm run build",
    "setup:deploy": "npm run prisma:generate && npm run prisma:migrate:deploy && npm run build",
    "build": "nest build",
    // ...
    "prisma:migrate:deploy": "prisma migrate deploy",
    "studio": "prisma studio",
    "studio:wsl": "prisma studio --port 5555 --browser none"
  }
}
```

**Различия:**
- ✅ **main:** `prisma:generate` в конце (но с опечаткой в отступах)
- ✅ **backend-nest:** `prisma:generate` в начале (логичнее, так как используется в setup)

**Рекомендация:** Использовать версию из backend-nest - более логичный порядок.

---

## Сводная таблица рекомендаций

| # | Файл/Компонент | main | backend-nest | Рекомендация |
|---|----------------|------|--------------|--------------|
| 1 | schema.sql | ❌ Отсутствует | ✅ Присутствует | **Удалить** из backend-nest |
| 2 | database.service.ts | ✅ Retry логика | ❌ Простое подключение | **main** (retry критичен) |
| 3 | API Tags | ✅ Английские | ❌ Русские | **main** (стандарт API) |
| 4 | AuthResponseDto | ✅ Полный user объект | ❌ Только userId | **main** (больше данных) |
| 5 | UserResponseDto | ❌ role | ✅ globalRole | **backend-nest** (явнее) |
| 6 | ProjectResponseDto | ✅ Полная модель | ❌ Минимальная | **main** (нужны все поля) |
| 7 | WorkflowResponseDto | ✅ Полная модель | ❌ Упрощенная | **main** (соответствует схеме) |
| 8 | WorkflowGraphResponseDto | ❌ Без workflowId | ✅ С workflowId | **main** (ID из контекста) |
| 9 | List Response DTOs | ❌ extends Array | ✅ Обычный класс | **backend-nest** (правильный паттерн) |
| 10 | workflows.service.ts | ❌ Не обновляет updatedAt | ✅ Обновляет updatedAt | **backend-nest** (правильная логика) |
| 11 | users.module.ts | ✅ Экспортирует UsersUtils | ❌ Не экспортирует | **Проверить использование** |
| 12 | users.repository.ts | ✅ "Личный" | ✅ "Personal" | **Зависит от аудитории** |
| 13 | database.service.spec.ts | ❌ Неиспользуемая переменная | ✅ Чистый код | **backend-nest** |
| 14 | Dockerfile | ✅ Оптимизированный | ❌ Базовый | **main** (оптимизация) |
| 15 | package.json | ❌ Порядок скриптов | ✅ Логичный порядок | **backend-nest** |

---

## Итоговые рекомендации

### Критичные изменения (требуют синхронизации):

1. **✅ Перенести из main в backend-nest:**
   - Database retry логика (критично для production)
   - Английские API tags (стандарт)
   - Полные DTO модели (AuthResponseDto, ProjectResponseDto, WorkflowResponseDto)
   - Dockerfile оптимизации

2. **✅ Перенести из backend-nest в main:**
   - Автоматическое обновление workflow.updatedAt при изменении nodes/edges
   - Правильные List Response DTOs (без extends Array)
   - Поле `globalRole` вместо `role` в UserResponseDto
   - Чистка неиспользуемых переменных в тестах
   - Логичный порядок скриптов в package.json

3. **❌ Удалить:**
   - backend/schema.sql из backend-nest (управляется через Prisma)

### Некритичные изменения (на усмотрение):

- Название личного проекта ("Личный" vs "Personal")
- workflowId в WorkflowGraphResponseDto
- Экспорт UsersUtils (проверить использование)

---

## Предлагаемый план действий

### Вариант 1: Синхронизировать backend-nest с main
```bash
git checkout backend-nest
git merge main
# Разрешить конфликты вручную, применяя лучшие решения из обеих веток
```

### Вариант 2: Синхронизировать main с backend-nest
```bash
git checkout main
git merge backend-nest
# Разрешить конфликты вручную
```

### Вариант 3: Создать новую ветку для синхронизации
```bash
git checkout -b backend-sync
git merge main
git merge backend-nest
# Разрешить все конфликты, взяв лучшее из обеих веток
```

---

## Заключение

Обе ветки содержат ценные улучшения:

- **main** имеет более продуманную инфраструктуру (retry, оптимизации Docker) и полные DTO модели
- **backend-nest** имеет более правильную бизнес-логику (обновление updatedAt) и чистый код

Рекомендуется создать синхронизированную версию, объединяющую лучшие решения из обеих веток.
