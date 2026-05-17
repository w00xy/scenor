# Интеграция фронтенда с WebSocket и асинхронным выполнением workflow

**Для:** Фронтенд-разработчика  
**Дата:** 17 мая 2026  
**Приоритет:** High — разблокирует real-time анимацию узлов при выполнении

---

## Что изменилось на бэкенде

Раньше `POST /workflows/:id/executions/manual` выполнял workflow **синхронно**: HTTP-запрос висел до полного завершения, все WebSocket-события улетали до того, как фронтенд получал `executionId`. Пошаговая анимация была невозможна.

Теперь endpoint работает **асинхронно в две фазы**:

### Фаза 1: HTTP-ответ (мгновенный)
```
POST /workflows/:id/executions/manual  →  201 Created
{
  "id": "execution-uuid",
  "status": "queued",       // ← новый статус
  "workflowId": "...",
  "startedAt": "...",
  ...
}
```
HTTP-ответ возвращается **сразу** (status: `queued`). Выполнение запускается в фоне.

### Фаза 2: Выполнение в фоне
Бэкенд выполняет граф узлов и отправляет события через WebSocket по мере прохождения каждого узла.

---

## WebSocket: протокол событий

**Endpoint:** `ws://localhost:3000/executions?token=<JWT_ACCESS_TOKEN>`

### Формат сообщений (от сервера → клиент)

Все сообщения — JSON с полем `type`:

```typescript
type ServerMessage =
  | { type: 'connected'; userId: string }
  | { type: 'subscribed'; executionId: string }
  | { type: 'unsubscribed'; executionId: string }
  | { type: 'execution-update'; executionId: string; data: ExecutionUpdate }
  | { type: 'node-log'; executionId: string; nodeLog: NodeLog; nodeMeta?: NodeMeta }
  | { type: 'error'; message: string }
  | { type: 'pong'; timestamp?: number }
```

### ExecutionUpdate (execution-update)
```typescript
interface ExecutionUpdate {
  id: string;
  status: 'queued' | 'running' | 'success' | 'failed';
  workflowId?: string;
  startedAt?: string | null;
  finishedAt?: string | null;
  totalNodes?: number;          // всего активных узлов
  completedNodes?: number;       // сколько завершено
  executedSteps?: number;        // сколько шагов выполнено
  outputDataJson?: any;          // финальный результат (только при success)
  error?: string | null;         // ошибка (только при failed)
}
```

### NodeLog (node-log)
```typescript
interface NodeLog {
  id: string;
  nodeId: string;
  status: 'running' | 'success' | 'failed' | 'skipped';
  startedAt: string;
  finishedAt: string | null;
  // ВАЖНО: бэкенд отправляет inputJson / outputJson (не inputDataJson/outputDataJson)
  inputJson?: any;
  outputJson?: any;
  errorMessage: string | null;
}
```

### NodeMeta (приходит вместе с node-log)
```typescript
interface NodeMeta {
  nodeName?: string | null;    // label узла (человекочитаемое имя)
  nodeType?: string | null;    // typeCode узла (manual_trigger, http_request, …)
}
```

### Порядок событий при выполнении
```
execution-update  { status: "queued" }         // фаза 1: создан
execution-update  { status: "running" }        // фаза 2: началось выполнение
node-log          { nodeId: "n1", status: "running",  nodeMeta: { nodeName: "Start", nodeType: "manual_trigger" } }
node-log          { nodeId: "n1", status: "success",  nodeMeta: { ... } }
execution-update  { status: "running", completedNodes: 1, totalNodes: 5 }
node-log          { nodeId: "n2", status: "running",  nodeMeta: { nodeName: "HTTP Request", nodeType: "http_request" } }
node-log          { nodeId: "n2", status: "success",  nodeMeta: { ... } }
execution-update  { status: "running", completedNodes: 2, totalNodes: 5 }
...
execution-update  { status: "success", finishedAt: "...", outputDataJson: {...} }
```

---

## Что нужно изменить во фронтенде

### 1. `frontend/src/services/websocket.ts` — обновить интерфейсы

**Добавить статус `'queued'`:**
```diff
- export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed';
+ export type ExecutionStatus = 'queued' | 'running' | 'success' | 'failed';
```

**Расширить `ExecutionUpdate`:**
```diff
  export interface ExecutionUpdate {
    id: string;
    status: ExecutionStatus;
-   startedAt: string;
+   workflowId?: string;
+   startedAt?: string | null;
-   finishedAt: string | null;
+   finishedAt?: string | null;
+   totalNodes?: number;
+   completedNodes?: number;
+   executedSteps?: number;
+   outputDataJson?: any;
-   error: string | null;
+   error?: string | null;
  }
```

**Расширить `NodeLog`:**
```diff
  export interface NodeLog {
    id: string;
    nodeId: string;
-   status: 'running' | 'success' | 'failed';
+   status: 'running' | 'success' | 'failed' | 'skipped';
    startedAt: string;
    finishedAt: string | null;
-   inputDataJson: any;
-   outputDataJson: any;
+   inputJson?: any;
+   outputJson?: any;
    errorMessage: string | null;
  }
```

**Добавить `NodeMeta` в `WebSocketMessage`:**
```diff
  export interface WebSocketMessage {
    type: 'connected' | 'subscribed' | 'unsubscribed' | 'execution-update' | 'node-log' | 'error' | 'pong';
    userId?: string;
    executionId?: string;
    data?: ExecutionUpdate;
    nodeLog?: NodeLog;
+   nodeMeta?: { nodeName?: string | null; nodeType?: string | null };
    message?: string;
    timestamp?: number;
  }
```

**В `handleMessage` — смержить `nodeMeta` в `nodeLog`:**
```diff
  case 'node-log':
    if (message.executionId && message.nodeLog) {
+     if (message.nodeMeta) {
+       message.nodeLog.nodeName = message.nodeMeta.nodeName;
+       message.nodeLog.nodeType = message.nodeMeta.nodeType;
+     }
      this.callbacks.onNodeLog?.(message.executionId, message.nodeLog);
    }
    break;
```

### 2. `frontend/src/pages/WorkflowEditor/WorkflowEditor.tsx` — двухфазное выполнение

Это ключевое изменение. Вместо синхронного `await executionsApi.executeManual(workflowId, inputDataJson)` нужна двухфазная схема.

**Текущая логика (синхронная):**
```typescript
const handleRunWorkflow = async () => {
  // ...
  const result = await executionsApi.executeManual(workflowId, inputDataJson);
  // result.status уже "success"/"failed", все узлы выполнены
  // WebSocket-события уже улетели
  setExecutionState({ isExecuting: false, ... });
};
```

**Новая логика (асинхронная):**
```typescript
const handleRunWorkflow = async () => {
  // 1. Вызвать API — вернётся МГНОВЕННО
  const result = await executionsApi.executeManual(workflowId, inputDataJson);
  // result.status === "queued"

  // 2. Подписаться на WebSocket по result.id
  wsSubscribe(result.id);

  // 3. Подсветить manual_trigger как "running"
  const triggerNode = nodes.find(n => n.data.typeCode === 'manual_trigger');
  if (triggerNode) {
    setNodes(prev => prev.map(n =>
      n.id === triggerNode.id
        ? { ...n, data: { ...n.data, executionStatus: 'running', isTriggered: true } }
        : n
    ));
  }

  // 4. Оставить isExecuting: true — WebSocket-колбэк сбросит его
  setExecutionState({
    isExecuting: true,
    triggeredNodeId: triggerNode?.id || null,
    executedEdges: [],
    lastExecutionId: result.id,
  });
};
```

**Отслеживание завершения через WebSocket:**
```typescript
// Добавить useEffect для отслеживания финального статуса
useEffect(() => {
  if (wsExecutionStatus === 'success' || wsExecutionStatus === 'failed') {
    setExecutionState(prev => ({
      ...prev,
      isExecuting: false,
    }));
    // Дозагрузить финальные логи через REST если нужно
    if (executionState.lastExecutionId && workflowId) {
      loadExecutionLogs();
    }
  }
}, [wsExecutionStatus]);
```

**Подсветка узлов в реальном времени через node-log колбэк:**
```typescript
// В useExecutionWebSocket колбэке onNodeLog:
const handleNodeLog = useCallback((execId: string, log: NodeLog) => {
  setNodes(prev => prev.map(node => {
    if (node.id === log.nodeId) {
      return {
        ...node,
        data: {
          ...node.data,
          executionStatus: log.status === 'running' ? 'running'
            : log.status === 'success' ? 'success'
            : log.status === 'failed' ? 'failed'
            : undefined,
          isTriggered: log.status !== 'skipped',
        },
      };
    }
    return node;
  }));

  // Подсветка рёбер
  if (log.status === 'success') {
    setEdges(prev => prev.map(edge =>
      edge.source === log.nodeId
        ? { ...edge, animated: true }
        : edge
    ));
  }
}, []);
```

### 3. `frontend/src/components/workflow/BottomLogsPanel/BottomLogsPanel.tsx` — поддержка nodeMeta

В `ExecutionLog` нужно добавить `nodeName`/`nodeType` из WebSocket, и учесть что поля называются `inputJson`/`outputJson` (не `inputDataJson`/`outputDataJson`).

```diff
  interface ExecutionLog {
    id: string;
    nodeId: string;
    status: string;
    startedAt: string;
    finishedAt: string | null;
-   inputDataJson: any;
-   outputDataJson: any;
+   inputDataJson: any;    // остаётся для обратной совместимости
+   outputDataJson: any;   // остаётся для обратной совместимости
    errorMessage: string | null;
+   nodeName?: string | null;
+   nodeType?: string | null;
  }
```

При маппинге WebSocket-логов учитывать оба варианта имён полей:
```typescript
const mappedLog: ExecutionLog = {
  ...wsLog,
  inputDataJson: wsLog.inputDataJson || wsLog.inputJson,
  outputDataJson: wsLog.outputDataJson || wsLog.outputJson,
  nodeName: wsLog.nodeName,
  nodeType: wsLog.nodeType,
};
```

Метод `getNodeName` должен использовать `nodeName`/`nodeType` из лога, а не искать по `nodes` массиву:
```typescript
const getNodeName = (log: ExecutionLog) => {
  if (log.nodeName) return log.nodeName;
  if (log.nodeType) return log.nodeType;
  const node = nodes.find(n => n.id === log.nodeId);
  return node?.data?.label || node?.data?.typeCode || log.nodeId;
};
```

### 4. Хук `useExecutionWebSocket.ts` — добавить статус 'queued'

Если хук уже существует, убедиться что `executionStatus` принимает `'queued'`:
```typescript
const [executionStatus, setExecutionStatus] = useState<string | null>(null);
// Теперь может быть 'queued', 'running', 'success', 'failed'
```

---

## Полный сценарий работы (checklist для фронтендера)

1. Пользователь нажимает «Запустить»
2. Фронтенд вызывает `POST /workflows/:id/executions/manual`
3. Получает `{ id: "...", status: "queued" }` — мгновенно
4. Подписывается на WebSocket: `{ event: 'subscribe-execution', data: { executionId } }`
5. Manual trigger загорается статусом `running`
6. WebSocket присылает:
   - `execution-update { status: "running" }` — кнопка «Запустить» блокируется
   - `node-log { nodeId: "n1", status: "running" }` — узел n1 подсвечивается
   - `node-log { nodeId: "n1", status: "success" }` — узел n1 зелёный
   - `execution-update { completedNodes: 1, totalNodes: 5 }` — прогресс-бар
   - ... повторить для остальных узлов
   - `execution-update { status: "success", outputDataJson: {...} }` — финал
7. Кнопка «Запустить» разблокируется, анимация завершена

---

## Переменные окружения

Добавить в `.env` фронтенда если ещё нет:
```env
VITE_WS_URL=ws://localhost:3000
```

## REST API (для справки)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/workflows/:id/executions/manual` | Создать и запустить (асинхронно) |
| GET | `/workflows/:id/executions` | Список выполнений |
| GET | `/workflows/:id/executions/:eid` | Детали выполнения |
| GET | `/workflows/:id/executions/:eid/logs` | Логи узлов выполнения |
| DELETE | `/workflows/:id/executions/:eid` | Удалить выполнение |

---

## Проверка работоспособности

1. Запустить бэкенд: `cd backend && npm run dev`
2. Подключиться к WebSocket (можно через консоль браузера):
```javascript
const ws = new WebSocket('ws://localhost:3000/executions?token=YOUR_JWT_TOKEN');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({ event: 'subscribe-execution', data: { executionId: '...' } }));
```
3. Вызвать `POST /workflows/:id/executions/manual` через Swagger UI (`http://localhost:3000/api`)
4. Наблюдать приходящие `execution-update` и `node-log` события в реальном времени

---

## Примечания

- **Статус `queued`** — новый. Бэкенд создаёт execution с этим статусом и сразу возвращает HTTP-ответ. Через доли секунды статус меняется на `running`.
- **`inputJson`/`outputJson`** — бэкенд использует эти имена полей в WebSocket. Для REST API остаются `inputDataJson`/`outputDataJson`. Фронтенд должен обрабатывать оба варианта.
- **`nodeMeta`** содержит человекочитаемое имя узла (`nodeName`) и его тип (`nodeType`). Использовать их для отображения в BottomLogsPanel вместо поиска по `nodes` массиву.
- **`skipped`** — новый статус узла. Означает что узел отключен (`isDisabled: true`) и был пропущен при выполнении.
- **Синхронный метод `runManualWorkflow`** помечен как `@deprecated` на бэкенде. Он всё ещё работает, но не отправляет статус `queued` и выполняет workflow внутри HTTP-запроса. Для нового фронтенда использовать `createManualExecution`.
