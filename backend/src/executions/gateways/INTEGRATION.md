# Интеграция WebSocket Gateway с ExecutionsService

## Обзор

Этот документ описывает, как ExecutionsService интегрирован с ExecutionGateway для отправки real-time обновлений клиентам через WebSocket.

## Текущая интеграция

### ExecutionsService

ExecutionsService уже использует ExecutionGateway для отправки обновлений:

```typescript
// backend/src/executions/executions.service.ts

@Injectable()
export class ExecutionsService {
  constructor(
    private readonly executionGateway: ExecutionGateway,
  ) {}

  async executeWorkflow(workflowId: string, userId: string) {
    // 1. Создать execution
    const execution = await this.createExecution(workflowId);
    
    // 2. Отправить начальный статус
    this.executionGateway.broadcastExecutionUpdate(execution.id, {
      id: execution.id,
      status: 'running',
      startedAt: execution.startedAt,
    });

    // 3. Выполнить узлы
    for (const node of sortedNodes) {
      const nodeLog = await this.executeNode(node, execution.id);
      
      // 4. Отправить лог узла
      this.executionGateway.broadcastNodeLog(execution.id, nodeLog);
    }

    // 5. Обновить финальный статус
    const finalExecution = await this.updateExecutionStatus(
      execution.id,
      'success'
    );
    
    // 6. Отправить финальный статус
    this.executionGateway.broadcastExecutionUpdate(execution.id, finalExecution);
  }
}
```

## Точки интеграции

### 1. Начало выполнения

**Когда:** После создания execution записи в БД  
**Метод:** `broadcastExecutionUpdate(executionId, data)`  
**Данные:**
```typescript
{
  id: string;
  status: 'running';
  startedAt: Date;
  finishedAt: null;
  error: null;
}
```

### 2. Выполнение узла

**Когда:** После выполнения каждого узла  
**Метод:** `broadcastNodeLog(executionId, nodeLog)`  
**Данные:**
```typescript
{
  id: string;
  nodeId: string;
  status: 'running' | 'success' | 'failed';
  startedAt: Date;
  finishedAt: Date | null;
  inputData: any;
  outputData: any;
  error: string | null;
}
```

### 3. Завершение выполнения

**Когда:** После завершения всех узлов или при ошибке  
**Метод:** `broadcastExecutionUpdate(executionId, data)`  
**Данные:**
```typescript
{
  id: string;
  status: 'success' | 'failed';
  startedAt: Date;
  finishedAt: Date;
  error: string | null;
}
```

## Пример полного flow

```typescript
// 1. Клиент подключается к WebSocket
const ws = new WebSocket('ws://localhost:3000/executions?token=JWT_TOKEN');

// 2. Клиент подписывается на execution
ws.send(JSON.stringify({
  event: 'subscribe-execution',
  data: { executionId: 'exec-123' }
}));

// 3. Сервер запускает workflow
POST /workflows/:id/executions

// 4. ExecutionsService отправляет обновления:

// 4.1. Начало выполнения
this.executionGateway.broadcastExecutionUpdate('exec-123', {
  id: 'exec-123',
  status: 'running',
  startedAt: new Date(),
});
// → Клиент получает: { type: 'execution-update', executionId: 'exec-123', data: {...} }

// 4.2. Выполнение узла 1
this.executionGateway.broadcastNodeLog('exec-123', {
  id: 'log-1',
  nodeId: 'node-1',
  status: 'success',
  outputData: { result: 'ok' },
});
// → Клиент получает: { type: 'node-log', executionId: 'exec-123', nodeLog: {...} }

// 4.3. Выполнение узла 2
this.executionGateway.broadcastNodeLog('exec-123', {
  id: 'log-2',
  nodeId: 'node-2',
  status: 'success',
  outputData: { result: 'ok' },
});
// → Клиент получает: { type: 'node-log', executionId: 'exec-123', nodeLog: {...} }

// 4.4. Завершение выполнения
this.executionGateway.broadcastExecutionUpdate('exec-123', {
  id: 'exec-123',
  status: 'success',
  finishedAt: new Date(),
});
// → Клиент получает: { type: 'execution-update', executionId: 'exec-123', data: {...} }
```

## Проверка интеграции

### Шаг 1: Запустить backend

```bash
cd backend
npm run dev
```

### Шаг 2: Открыть тест-клиент

Откройте `backend/src/executions/gateways/websocket-test.html` в браузере.

### Шаг 3: Залогиниться

- Username: `admin`
- Password: `admin123`
- Нажмите "Login"

### Шаг 4: Подключиться к WebSocket

- Нажмите "Connect"
- Должно появиться сообщение "Connected! User ID: ..."

### Шаг 5: Создать и запустить workflow

```bash
# Получить access token
TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.accessToken')

# Получить список workflows
WORKFLOW_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/workflows \
  | jq -r '.items[0].id')

# Запустить workflow
EXECUTION_ID=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/workflows/$WORKFLOW_ID/executions \
  | jq -r '.id')

echo "Execution ID: $EXECUTION_ID"
```

### Шаг 6: Подписаться на execution

- Вставьте `EXECUTION_ID` в поле "Execution ID"
- Нажмите "Subscribe"
- Должно появиться сообщение "Subscribed to execution: ..."

### Шаг 7: Наблюдать обновления

В тест-клиенте вы должны увидеть:
1. `execution-update` с status: 'running'
2. Несколько `node-log` сообщений
3. `execution-update` с status: 'success' или 'failed'

## Отладка

### Включить логирование WebSocket

```typescript
// backend/src/executions/gateways/execution.gateway.ts

afterInit(server: Server) {
  this.logger.log('WebSocket Gateway initialized');
  this.logger.debug(`Server clients: ${server.clients.size}`);
}

broadcastExecutionUpdate(executionId: string, data: unknown) {
  const subscribers = this.executionSubscribers.get(executionId);
  this.logger.debug(`Broadcasting execution update to ${subscribers?.size || 0} subscribers`);
  // ...
}
```

### Проверить подписчиков

```typescript
// Добавить endpoint для отладки
@Get('debug/subscribers/:executionId')
getSubscribers(@Param('executionId') executionId: string) {
  const subscribers = this.executionGateway.executionSubscribers.get(executionId);
  return {
    executionId,
    subscriberCount: subscribers?.size || 0,
  };
}
```

### Логи сервера

```bash
# Смотреть логи в реальном времени
cd backend
npm run dev

# Вы должны видеть:
# [ExecutionGateway] WebSocket Gateway initialized
# [ExecutionGateway] Heartbeat started (30s interval)
# [ExecutionGateway] Client connected: userId=...
# [ExecutionGateway] User ... subscribed to execution ...
```

## Обработка ошибок

### Ошибка выполнения узла

```typescript
try {
  const result = await this.executeNode(node);
  this.executionGateway.broadcastNodeLog(executionId, {
    id: logId,
    nodeId: node.id,
    status: 'success',
    outputData: result,
  });
} catch (error) {
  this.executionGateway.broadcastNodeLog(executionId, {
    id: logId,
    nodeId: node.id,
    status: 'failed',
    error: error.message,
  });
}
```

### Ошибка выполнения workflow

```typescript
try {
  await this.executeWorkflow(workflowId);
} catch (error) {
  this.executionGateway.broadcastExecutionUpdate(executionId, {
    id: executionId,
    status: 'failed',
    finishedAt: new Date(),
    error: error.message,
  });
}
```

## Best Practices

### 1. Отправлять обновления асинхронно

```typescript
// ✅ Правильно - не блокирует выполнение
this.executionGateway.broadcastNodeLog(executionId, nodeLog);
await this.executeNextNode();

// ❌ Неправильно - ждет отправки
await this.executionGateway.broadcastNodeLog(executionId, nodeLog);
```

### 2. Обрабатывать ошибки broadcast

```typescript
try {
  this.executionGateway.broadcastExecutionUpdate(executionId, data);
} catch (error) {
  this.logger.error(`Failed to broadcast update: ${error.message}`);
  // Продолжить выполнение - broadcast не критичен
}
```

### 3. Не отправлять чувствительные данные

```typescript
// ✅ Правильно - фильтруем секреты
const sanitizedOutput = this.sanitizeOutput(nodeLog.outputData);
this.executionGateway.broadcastNodeLog(executionId, {
  ...nodeLog,
  outputData: sanitizedOutput,
});

// ❌ Неправильно - отправляем все данные
this.executionGateway.broadcastNodeLog(executionId, nodeLog);
```

### 4. Ограничивать размер данных

```typescript
// ✅ Правильно - ограничиваем размер
const MAX_OUTPUT_SIZE = 10000; // 10KB
const outputStr = JSON.stringify(output);
const truncatedOutput = outputStr.length > MAX_OUTPUT_SIZE
  ? outputStr.substring(0, MAX_OUTPUT_SIZE) + '... (truncated)'
  : output;

this.executionGateway.broadcastNodeLog(executionId, {
  ...nodeLog,
  outputData: truncatedOutput,
});
```

## Производительность

### Метрики

- **Latency:** < 50ms от события до получения клиентом
- **Throughput:** > 1000 сообщений/сек на сервер
- **Concurrent connections:** > 1000 одновременных подключений

### Оптимизация

1. **Батчинг сообщений:**
   ```typescript
   // Группировать несколько логов в одно сообщение
   const logs = await this.executeNodesInParallel(nodes);
   this.executionGateway.broadcastNodeLogs(executionId, logs);
   ```

2. **Сжатие:**
   ```typescript
   // Использовать permessage-deflate
   @WebSocketGateway({
     perMessageDeflate: true,
   })
   ```

3. **Фильтрация на сервере:**
   ```typescript
   // Отправлять только изменения
   if (hasChanged(previousState, currentState)) {
     this.executionGateway.broadcastExecutionUpdate(executionId, currentState);
   }
   ```

## Масштабирование

### Horizontal Scaling с Redis

Для масштабирования на несколько серверов используйте Redis pub/sub:

```typescript
// backend/src/executions/gateways/execution.gateway.ts

import { Redis } from 'ioredis';

@Injectable()
export class ExecutionGateway {
  private redis: Redis;
  private redisSub: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.redisSub = new Redis(process.env.REDIS_URL);
    
    // Подписаться на события из других серверов
    this.redisSub.subscribe('execution-updates');
    this.redisSub.on('message', (channel, message) => {
      const { executionId, data } = JSON.parse(message);
      this.broadcastToLocalClients(executionId, data);
    });
  }

  broadcastExecutionUpdate(executionId: string, data: unknown) {
    // Отправить локальным клиентам
    this.broadcastToLocalClients(executionId, data);
    
    // Отправить другим серверам через Redis
    this.redis.publish('execution-updates', JSON.stringify({
      executionId,
      data,
    }));
  }
}
```

## Тестирование

### Unit тесты

```typescript
describe('ExecutionGateway', () => {
  it('should broadcast execution update to subscribers', () => {
    const gateway = new ExecutionGateway(authService, prisma);
    const mockClient = createMockWebSocket();
    
    gateway.executionSubscribers.set('exec-123', new Set([mockClient]));
    gateway.broadcastExecutionUpdate('exec-123', { status: 'running' });
    
    expect(mockClient.send).toHaveBeenCalledWith(
      expect.stringContaining('execution-update')
    );
  });
});
```

### Integration тесты

```typescript
describe('WebSocket Integration', () => {
  it('should receive execution updates in real-time', async () => {
    const ws = new WebSocket('ws://localhost:3000/executions?token=TOKEN');
    
    await waitForConnection(ws);
    
    ws.send(JSON.stringify({
      event: 'subscribe-execution',
      data: { executionId: 'exec-123' }
    }));
    
    // Запустить execution
    await executeWorkflow('workflow-123');
    
    // Проверить получение сообщений
    const messages = await collectMessages(ws, 5000);
    expect(messages).toContainEqual(
      expect.objectContaining({ type: 'execution-update' })
    );
  });
});
```

## Заключение

WebSocket Gateway полностью интегрирован с ExecutionsService и готов к использованию. Все обновления автоматически отправляются подписанным клиентам в реальном времени.

Для тестирования используйте `websocket-test.html` клиент или интегрируйте WebSocket в ваш frontend.
