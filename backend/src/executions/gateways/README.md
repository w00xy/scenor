# WebSocket Gateway для Execution Updates

## Обзор

WebSocket Gateway предоставляет real-time обновления о выполнении workflow через WebSocket соединение. Клиенты могут подписываться на конкретные executions и получать обновления статуса и логи узлов в реальном времени.

## Функциональность

### ✅ Реализованные возможности

1. **JWT аутентификация**
   - Проверка access token при подключении
   - Токен передается через query параметр или Authorization header
   - Автоматическое отклонение неавторизованных подключений

2. **Проверка прав доступа**
   - Верификация доступа к execution через членство в проекте
   - Поддержка ролей: OWNER, EDITOR, VIEWER
   - Проверка владельца проекта

3. **Rate limiting**
   - Максимум 10 подписок на одного клиента
   - Защита от спама подписками
   - Ограничение частоты запросов

4. **Heartbeat/ping-pong**
   - Автоматический ping каждые 30 секунд
   - Отключение неактивных клиентов
   - Ручной ping/pong для проверки соединения

5. **Real-time обновления**
   - Broadcast обновлений статуса execution
   - Broadcast логов выполнения узлов
   - Поддержка множественных подписчиков

## Подключение

### Endpoint

```
ws://localhost:3000/executions
```

### Аутентификация

Токен можно передать двумя способами:

**1. Query параметр (рекомендуется для браузеров):**
```javascript
const token = 'your-jwt-token';
const ws = new WebSocket(`ws://localhost:3000/executions?token=${encodeURIComponent(token)}`);
```

**2. Authorization header:**
```javascript
// Не поддерживается нативным WebSocket API браузера
// Используйте библиотеки типа socket.io-client или ws (Node.js)
```

### Пример подключения

```javascript
// 1. Получить токен через API
const loginResponse = await fetch('http://localhost:3000/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'user', password: 'pass' })
});
const { accessToken } = await loginResponse.json();

// 2. Подключиться к WebSocket
const ws = new WebSocket(`ws://localhost:3000/executions?token=${accessToken}`);

ws.onopen = () => {
  console.log('Connected to WebSocket');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = (event) => {
  console.log('Disconnected:', event.code, event.reason);
};
```

## Протокол сообщений

### Формат сообщений от клиента

Все сообщения должны быть в JSON формате:

```json
{
  "event": "event-name",
  "data": { /* event-specific data */ }
}
```

### Формат сообщений от сервера

```json
{
  "type": "message-type",
  /* type-specific fields */
}
```

## События клиента

### 1. subscribe-execution

Подписаться на обновления execution.

**Запрос:**
```json
{
  "event": "subscribe-execution",
  "data": {
    "executionId": "cm5x1y2z3..."
  }
}
```

**Ответ (успех):**
```json
{
  "type": "subscribed",
  "executionId": "cm5x1y2z3..."
}
```

**Ответ (ошибка):**
```json
{
  "type": "error",
  "message": "Access denied to this execution"
}
```

**Возможные ошибки:**
- `Not authenticated` - клиент не аутентифицирован
- `Invalid execution ID` - неверный формат ID
- `Rate limit exceeded` - превышен лимит запросов
- `Maximum 10 subscriptions per client` - превышен лимит подписок
- `Already subscribed to this execution` - уже подписан
- `Access denied to this execution` - нет доступа к execution

### 2. unsubscribe-execution

Отписаться от обновлений execution.

**Запрос:**
```json
{
  "event": "unsubscribe-execution",
  "data": {
    "executionId": "cm5x1y2z3..."
  }
}
```

**Ответ:**
```json
{
  "type": "unsubscribed",
  "executionId": "cm5x1y2z3..."
}
```

### 3. ping

Проверить соединение.

**Запрос:**
```json
{
  "event": "ping"
}
```

**Ответ:**
```json
{
  "type": "pong",
  "timestamp": 1714943709208
}
```

## События сервера

### 1. connected

Отправляется при успешном подключении.

```json
{
  "type": "connected",
  "userId": "user-id"
}
```

### 2. execution-update

Обновление статуса execution.

```json
{
  "type": "execution-update",
  "executionId": "cm5x1y2z3...",
  "data": {
    "id": "cm5x1y2z3...",
    "status": "running",
    "startedAt": "2026-05-05T22:30:00.000Z",
    "finishedAt": null,
    "error": null
  }
}
```

**Возможные статусы:**
- `running` - выполняется
- `success` - успешно завершено
- `failed` - завершено с ошибкой

### 3. node-log

Лог выполнения узла.

```json
{
  "type": "node-log",
  "executionId": "cm5x1y2z3...",
  "nodeLog": {
    "id": "log-id",
    "nodeId": "node-id",
    "status": "success",
    "startedAt": "2026-05-05T22:30:01.000Z",
    "finishedAt": "2026-05-05T22:30:02.000Z",
    "inputData": { /* input */ },
    "outputData": { /* output */ },
    "error": null
  }
}
```

**Возможные статусы узла:**
- `running` - выполняется
- `success` - успешно выполнен
- `failed` - выполнен с ошибкой

### 4. error

Ошибка обработки запроса.

```json
{
  "type": "error",
  "message": "Error description"
}
```

## Ограничения и лимиты

- **Максимум подписок на клиента:** 10
- **Rate limit:** 5 подписок в секунду
- **Heartbeat интервал:** 30 секунд
- **Timeout неактивного клиента:** 60 секунд (2 пропущенных pong)

## Коды закрытия соединения

- `1000` - Нормальное закрытие
- `1008` - Policy violation (ошибка аутентификации)
- `1011` - Internal server error

## Тестирование

### Тест-клиент

Откройте файл `websocket-test.html` в браузере для интерактивного тестирования:

```bash
# Из папки backend/src/executions/gateways/
open websocket-test.html
# или
xdg-open websocket-test.html
```

**Возможности тест-клиента:**
- Логин через API
- Подключение с JWT токеном
- Подписка/отписка от executions
- Просмотр всех сообщений в реальном времени
- Статистика сообщений
- Отправка ping

### Пример использования

1. **Запустите backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Откройте тест-клиент в браузере**

3. **Залогиньтесь:**
   - Username: `admin`
   - Password: `admin123`
   - Нажмите "Login"

4. **Подключитесь к WebSocket:**
   - Токен автоматически заполнится
   - Нажмите "Connect"

5. **Создайте и запустите execution через API:**
   ```bash
   # Получить список workflows
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/workflows

   # Запустить workflow
   curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3000/workflows/WORKFLOW_ID/executions
   ```

6. **Подпишитесь на execution:**
   - Вставьте execution ID
   - Нажмите "Subscribe"
   - Наблюдайте обновления в реальном времени

## Интеграция с ExecutionsService

### Отправка обновлений из сервиса

```typescript
import { ExecutionGateway } from './gateways/execution.gateway';

@Injectable()
export class ExecutionsService {
  constructor(
    private readonly executionGateway: ExecutionGateway,
  ) {}

  async executeWorkflow(workflowId: string) {
    const execution = await this.createExecution(workflowId);
    
    // Отправить обновление статуса
    this.executionGateway.broadcastExecutionUpdate(execution.id, {
      id: execution.id,
      status: 'running',
      startedAt: execution.startedAt,
    });

    // Выполнить узлы...
    for (const node of nodes) {
      const log = await this.executeNode(node);
      
      // Отправить лог узла
      this.executionGateway.broadcastNodeLog(execution.id, log);
    }

    // Отправить финальный статус
    this.executionGateway.broadcastExecutionUpdate(execution.id, {
      id: execution.id,
      status: 'success',
      finishedAt: new Date(),
    });
  }
}
```

## Безопасность

### Реализованные меры безопасности

1. **Аутентификация:** JWT токены проверяются при каждом подключении
2. **Авторизация:** Проверка прав доступа к execution через членство в проекте
3. **Rate limiting:** Защита от спама и DoS атак
4. **Валидация входных данных:** Проверка формата всех сообщений
5. **Изоляция подписок:** Клиенты получают только данные, к которым имеют доступ
6. **Автоматическое отключение:** Неактивные клиенты отключаются автоматически

### Рекомендации

- Используйте HTTPS/WSS в production
- Храните токены безопасно (не в localStorage для критичных приложений)
- Обновляйте токены перед истечением срока действия
- Обрабатывайте переподключения при разрыве соединения
- Логируйте подозрительную активность

## Troubleshooting

### Проблема: Соединение сразу закрывается

**Причина:** Неверный или истекший токен

**Решение:**
- Проверьте, что токен валидный
- Получите новый токен через `/users/login`
- Убедитесь, что токен правильно закодирован в URL

### Проблема: "Access denied to this execution"

**Причина:** Нет прав доступа к execution

**Решение:**
- Убедитесь, что вы член проекта, которому принадлежит workflow
- Проверьте, что execution существует
- Проверьте роль в проекте (нужна минимум VIEWER)

### Проблема: "Rate limit exceeded"

**Причина:** Слишком много запросов подписки

**Решение:**
- Подождите 1 секунду перед следующей попыткой
- Не отправляйте дублирующиеся запросы подписки

### Проблема: Не приходят обновления

**Причина:** Execution уже завершен или не запущен

**Решение:**
- Подпишитесь до запуска execution
- Проверьте, что execution действительно выполняется
- Проверьте логи сервера на наличие ошибок

## Архитектура

```
┌─────────────┐         WebSocket          ┌──────────────────┐
│   Client    │◄──────────────────────────►│ ExecutionGateway │
│  (Browser)  │    JWT Authentication      │                  │
└─────────────┘                             └────────┬─────────┘
                                                     │
                                                     │ broadcasts
                                                     │
                                            ┌────────▼─────────┐
                                            │ ExecutionsService│
                                            │                  │
                                            └────────┬─────────┘
                                                     │
                                                     │ queries
                                                     │
                                            ┌────────▼─────────┐
                                            │    Database      │
                                            │   (PostgreSQL)   │
                                            └──────────────────┘
```

## Дальнейшее развитие

### Возможные улучшения

- [ ] Поддержка комнат (rooms) для групповых подписок
- [ ] Сжатие сообщений (compression)
- [ ] Reconnection с автоматическим восстановлением подписок
- [ ] Буферизация сообщений при временном разрыве соединения
- [ ] Метрики и мониторинг WebSocket соединений
- [ ] Horizontal scaling с Redis pub/sub
- [ ] Фильтрация событий на стороне клиента
- [ ] Binary protocol для уменьшения трафика

## Ссылки

- [NestJS WebSockets](https://docs.nestjs.com/websockets/gateways)
- [ws Library](https://github.com/websockets/ws)
- [WebSocket API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [RFC 6455 - WebSocket Protocol](https://tools.ietf.org/html/rfc6455)
