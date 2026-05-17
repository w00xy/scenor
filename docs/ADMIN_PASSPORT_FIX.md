# Admin Panel PassportModule Fix

**Для:** Backend-разработчика  
**Дата:** 16 мая 2026  
**Приоритет:** Critical (блокирует админ-панель)

---

## Проблема

Все админ-контроллеры (`/admin/*`) возвращают 500 с ошибкой:

```
Error: Unknown authentication strategy "jwt"
```

## Причина

Админ-контроллеры используют `AuthGuard('jwt')` из `@nestjs/passport`, но `PassportModule` **не зарегистрирован** в `AdminModule`. Без регистрации NestJS не знает о стратегии `jwt`.

## Решение

### 1. `backend/src/admin/admin.module.ts`

Добавить `PassportModule` в imports и заменить `AuthGuard('jwt')` на локальный `AuthGuard`:

```typescript
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';  // ← добавить
import { AuthModule } from '../auth/auth.module.js'; // ← добавить
import { DatabaseModule } from '../database/database.module.js';
// ... остальные импорты

@Module({
  imports: [
    DatabaseModule,
    AuthModule,                                     // ← добавить
    PassportModule.register({ defaultStrategy: 'jwt' }), // ← добавить
  ],
  controllers: [
    AdminUsersController,
    AdminProjectsController,
    AdminAnalyticsController,
    AdminAuditController,
    AdminWorkflowsController,
  ],
  providers: [
    AdminUsersService,
    AdminProjectsService,
    AdminAnalyticsService,
    AdminAuditService,
    AdminWorkflowsService,
    AdminGuard,
  ],
})
export class AdminModule {}
```

### 2. Все админ-контроллеры (5 шт.)

Заменить импорт:

```typescript
// ❌ Было
import { AuthGuard } from '@nestjs/passport';

// ✅ Стало
import { AuthGuard } from '../../auth/auth.guard.js';
```

Заменить использование (с аргументом на без):

```typescript
// ❌ Было
@UseGuards(AuthGuard('jwt'), AdminGuard)

// ✅ Стало
@UseGuards(AuthGuard, AdminGuard)
```

### 3. Тесты контроллеров (4 файла .spec.ts)

Заменить `AuthGuard('jwt')` на `AuthGuard` в секциях `providers`:

```typescript
// ❌ Было
{ provide: AuthGuard('jwt'), useValue: { canActivate: () => true } }

// ✅ Стало
{ provide: AuthGuard, useValue: { canActivate: () => true } }
```

---

## Файлы, требующие правок (9 шт.)

| Файл | Что менять |
|------|-----------|
| `admin.module.ts` | Добавить `PassportModule`, `AuthModule` |
| `users/admin-users.controller.ts` | Импорт + `@UseGuards` |
| `projects/admin-projects.controller.ts` | Импорт + `@UseGuards` |
| `analytics/admin-analytics.controller.ts` | Импорт + `@UseGuards` |
| `audit/admin-audit.controller.ts` | Импорт + `@UseGuards` |
| `workflows/admin-workflows.controller.ts` | Импорт + `@UseGuards` |
| `users/admin-users.controller.spec.ts` | `providers` — `AuthGuard('jwt')` → `AuthGuard` |
| `projects/admin-projects.controller.spec.ts` | `providers` — `AuthGuard('jwt')` → `AuthGuard` |
| `analytics/admin-analytics.controller.spec.ts` | `providers` — `AuthGuard('jwt')` → `AuthGuard` |
| `audit/admin-audit.controller.spec.ts` | `providers` — `AuthGuard('jwt')` → `AuthGuard` |

---

## Проверка

После правок админ-эндпоинты должны отвечать 200:

```bash
curl -s http://localhost:3000/admin/analytics/platform \
  -H "Authorization: Bearer <admin-token>"
```
