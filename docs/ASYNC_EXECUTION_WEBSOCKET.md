# Асинхронное выполнение workflow через WebSocket

**Для:** Backend-разработчика  
**Дата:** 16 мая 2026  
**Приоритет:** High (разблокирует real-time анимацию на фронтенде)

---

## Проблема

Сейчас метод `POST /workflows/:id/executions/manual` выполняет workflow **синхронно** внутри HTTP-запроса:

```
1. Создаёт execution (status: "running")
2. Выполняет все узлы последовательно
3. WebSocket broadcast для каждого узла (execution-update, node-log)
4. Возвращает HTTP 200 с результатом
```

Фронтенд получает `executionId` только в HTTP-ответе (шаг 4) и подписывается на WebSocket ПОСЛЕ всех событий. Все `broadcastNodeLog` уже улетели — клиент их не получает.

**Результат:** пошаговая анимация выполнения невозможна, узлы не подсвечиваются в реальном времени.

---

## Решение: двухфазное выполнение

Разделить endpoint на две фазы:

### Фаза 1: `POST /workflows/:id/executions/manual` — создать и запланировать

```
1. Валидация доступа (requireWorkflowGraphAccess)
2. Создать execution (status: "queued")  
3. Broadcast "queued" через executionGateway
4. Вернуть HTTP 201 с executionId (без ожидания выполнения)
5. Запустить выполнение АСИНХРОННО (process.nextTick / setImmediate)
```

### Фаза 2: Асинхронное выполнение (в фоне)

Фронтенд уже подписан на WebSocket и получает события:
```
execution-update { status: "running" }
node-log { nodeId: "...", status: "running" }
node-log { nodeId: "...", status: "success" }
node-log { nodeId: "...", status: "running" }
...
execution-update { status: "success", finishedAt: "..." }
```

---

## Конкретные изменения

### 1. `backend/src/executions/executions.service.ts`

**Текущий метод `runManualWorkflow`** (строка 37):

```typescript
async runManualWorkflow(userId, workflowId, inputDataJson?) {
    // 1. Проверка доступа
    // 2. Создание execution (status: "running")
    // 3. Broadcast "running"
    // 4. executeGraph(...) — СИНХРОННО
    // 5. Обновление статуса success/failed
    // 6. Broadcast финального статуса
    // 7. Возврат результата
}
```

**Нужно разбить на два метода:**

```typescript
// Фаза 1: создать execution и вернуть ID
async createManualExecution(userId, workflowId, inputDataJson?) {
    const workflow = await this.requireWorkflowGraphAccess(userId, workflowId, [
        ProjectMemberRole.OWNER,
        ProjectMemberRole.EDITOR,
    ]);

    const execution = await this.prisma.workflowExecution.create({
        data: {
            workflowId,
            startedByUserId: userId,
            triggerType: TriggerType.manual,
            status: ExecutionStatus.queued,  // ← queued вместо running
            startedAt: new Date(),
            inputDataJson: this.toNullablePrismaJson(inputDataJson ?? {}),
        },
    });

    // Broadcast начального статуса
    this.executionGateway.broadcastExecutionUpdate(execution.id, {
        status: 'queued',
        workflowId: execution.workflowId,
    });

    // Запуск асинхронно — НЕ await
    this.executeWorkflowAsync(execution.id, workflow, inputDataJson);

    return execution; // ← возвращаем СРАЗУ
}

// Фаза 2: выполнение в фоне
private async executeWorkflowAsync(
    executionId: string,
    workflow: WorkflowWithGraph,
    inputDataJson?: Record<string, unknown>,
) {
    // Обновить статус → running
    await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: { status: ExecutionStatus.running },
    });

    this.executionGateway.broadcastExecutionUpdate(executionId, {
        status: 'running',
        startedAt: new Date(),
        workflowId: workflow.id,
    });

    try {
        const result = await this.executeGraph(
            executionId,
            workflow.nodes,
            workflow.edges,
            inputDataJson ?? {},
        );

        const finishedExecution = await this.prisma.workflowExecution.update({
            where: { id: executionId },
            data: {
                status: ExecutionStatus.success,
                finishedAt: new Date(),
                outputDataJson: this.toNullablePrismaJson({
                    nodeOutputs: result.outputs,
                    executedSteps: result.executedSteps,
                }),
            },
        });

        this.executionGateway.broadcastExecutionUpdate(executionId, {
            status: 'success',
            finishedAt: finishedExecution.finishedAt,
            outputDataJson: finishedExecution.outputDataJson,
            executedSteps: result.executedSteps,
        });
    } catch (error: any) {
        await this.prisma.workflowExecution.update({
            where: { id: executionId },
            data: {
                status: ExecutionStatus.failed,
                finishedAt: new Date(),
                errorMessage: error.message || 'Unknown error',
            },
        });

        this.executionGateway.broadcastExecutionUpdate(executionId, {
            status: 'failed',
            finishedAt: new Date(),
            errorMessage: error.message || 'Unknown error',
        });
    }
}
```

### 2. `backend/src/executions/executions.controller.ts`

**Текущий эндпоинт** (строка 37):

```typescript
@Post('manual')
async runManual(...) {
    return this.executionsService.runManualWorkflow(userId, workflowId, data.inputDataJson);
}
```

**Заменить на:**

```typescript
@Post('manual')
@ApiResponse({ status: 201, description: 'Execution created, running in background' })
async runManual(...) {
    const userId = this.requireUserId(request);
    const execution = await this.executionsService.createManualExecution(
        userId,
        workflowId,
        data.inputDataJson,
    );
    return execution; // статус: "queued", вернётся мгновенно
}
```

### 3. DTO ответа (опционально)

Можно добавить статус `"queued"` в `ExecutionResponseDto` и обновить Swagger-документацию.

---

## Фронтенд (уже готов, пояснение для бэкендера)

После этих изменений фронтенд работает так:

```typescript
// 1. Подписаться на WebSocket ДО вызова API
wsService.subscribe(executionId); // executionId известен заранее

// 2. Вызвать API — вернётся мгновенно с executionId
const { id: executionId } = await api.executeManual(workflowId);

// 3. Получать события через WebSocket:
//    - "queued" → execution создан
//    - "running" → выполнение началось
//    - "node-log" → каждый узел (running → success/failed)
//    - "success"/"failed" → выполнение завершено
```

---

## Минимальный вариант (меньше изменений)

Если разбиение метода — слишком радикально, альтернатива:

**Принимать `executionId` от клиента:**

Фронтенд генерирует UUID, подписывается на WebSocket по этому UUID, и передаёт его в теле запроса:

```json
POST /workflows/:id/executions/manual
{
    "inputDataJson": {},
    "executionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Бэкенд использует переданный `executionId` вместо авто-генерации. Поскольку клиент уже подписан на этот ID, он получит все broadcast-события во время синхронного выполнения.

**Изменения в коде:**

1. `RunWorkflowManualDto` — добавить опциональное поле `executionId?: string`
2. `executions.service.ts` — если `executionId` передан, использовать его в `prisma.workflowExecution.create({ data: { id: executionId, ... } })`
3. `executions.controller.ts` — пробросить `executionId` в сервис

**Плюсы:** минимум изменений (5-10 строк).  
**Минусы:** выполнение всё ещё синхронное (HTTP-запрос висит до завершения), но WebSocket-события доходят.

---

## Рекомендация

**Минимальный вариант** (передача executionId от клиента) проще и быстрее в реализации. Двухфазное выполнение — правильнее архитектурно, но требует больше изменений и тестирования.

Выберите подход по договорённости с фронтенд-разработчиком.
