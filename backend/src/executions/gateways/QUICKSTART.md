# WebSocket Gateway - Quick Start Guide

## Быстрый старт за 5 минут

### 1. Запустить backend (1 мин)

```bash
cd backend
npm run dev
```

Дождитесь сообщения:
```
App started on http://0.0.0.0:3000
[ExecutionGateway] WebSocket Gateway initialized
[ExecutionGateway] Heartbeat started (30s interval)
```

### 2. Открыть тест-клиент (30 сек)

Откройте в браузере:
```
backend/src/executions/gateways/websocket-test.html
```

### 3. Залогиниться (30 сек)

В секции **Authentication**:
- API URL: `http://localhost:3000`
- Username: `admin`
- Password: `admin123`
- Нажмите **Login**

Должно появиться: `✓ Logged in as admin`

### 4. Подключиться к WebSocket (30 сек)

В секции **Connection**:
- WebSocket URL: `ws://localhost:3000/executions`
- JWT Token: (автоматически заполнен)
- Нажмите **Connect**

Статус должен стать: **Connected**

В логах появится:
```
[HH:MM:SS.mmm] SUCCESS Connected! User ID: <user-id>
```

### 5. Создать и запустить workflow (2 мин)

#### Вариант A: Через Swagger UI

1. Откройте http://localhost:3000/api
2. Нажмите **Authorize**, вставьте токен из тест-клиента
3. Найдите `POST /workflows/{id}/executions`
4. Выберите любой workflow ID из `GET /workflows`
5. Нажмите **Execute**
6. Скопируйте `id` из ответа

#### Вариант B: Через curl

```bash
# Получить токен
TOKEN=$(curl -s -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.accessToken')

# Получить первый workflow
WORKFLOW_ID=$(curl -s -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/workflows \
  | jq -r '.items[0].id')

# Запустить execution
EXECUTION_ID=$(curl -s -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/workflows/$WORKFLOW_ID/executions \
  | jq -r '.id')

echo "Execution ID: $EXECUTION_ID"
```

### 6. Подписаться и наблюдать (1 мин)

В тест-клиенте:
1. Вставьте `EXECUTION_ID` в поле **Execution ID**
2. Нажмите **Subscribe**

Вы увидите в реальном времени:

```
[HH:MM:SS.mmm] SUCCESS Subscribed to execution: <execution-id>
[HH:MM:SS.mmm] INFO Execution Update: running
[HH:MM:SS.mmm] INFO Node Log: running (Node: <node-id>)
[HH:MM:SS.mmm] SUCCESS Node Log: success (Node: <node-id>)
[HH:MM:SS.mmm] INFO Node Log: running (Node: <node-id>)
[HH:MM:SS.mmm] SUCCESS Node Log: success (Node: <node-id>)
[HH:MM:SS.mmm] INFO Execution Update: success
```

**Статистика** обновится автоматически:
- Messages Received: 6+
- Execution Updates: 2
- Node Logs: 4+
- Errors: 0

## Готово! 🎉

WebSocket Gateway работает и отправляет real-time обновления.

---

## Что дальше?

### Интеграция с Frontend

```typescript
// frontend/src/services/websocket.ts

class ExecutionWebSocket {
  private ws: WebSocket | null = null;
  
  connect(token: string) {
    this.ws = new WebSocket(
      `ws://localhost:3000/executions?token=${encodeURIComponent(token)}`
    );
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };
  }
  
  subscribe(executionId: string) {
    this.ws?.send(JSON.stringify({
      event: 'subscribe-execution',
      data: { executionId }
    }));
  }
  
  private handleMessage(message: any) {
    switch (message.type) {
      case 'execution-update':
        // Обновить UI статуса execution
        break;
      case 'node-log':
        // Добавить лог узла в список
        break;
    }
  }
}
```

### React Hook

```typescript
// frontend/src/hooks/useExecutionWebSocket.ts

import { useEffect, useState } from 'react';

export function useExecutionWebSocket(executionId: string, token: string) {
  const [status, setStatus] = useState<string>('pending');
  const [logs, setLogs] = useState<any[]>([]);
  
  useEffect(() => {
    const ws = new WebSocket(
      `ws://localhost:3000/executions?token=${encodeURIComponent(token)}`
    );
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        event: 'subscribe-execution',
        data: { executionId }
      }));
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'execution-update') {
        setStatus(message.data.status);
      } else if (message.type === 'node-log') {
        setLogs(prev => [...prev, message.nodeLog]);
      }
    };
    
    return () => ws.close();
  }, [executionId, token]);
  
  return { status, logs };
}

// Использование в компоненте
function ExecutionView({ executionId }: { executionId: string }) {
  const token = useAuthToken();
  const { status, logs } = useExecutionWebSocket(executionId, token);
  
  return (
    <div>
      <h2>Status: {status}</h2>
      <ul>
        {logs.map(log => (
          <li key={log.id}>
            Node {log.nodeId}: {log.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Troubleshooting

**Проблема:** Connection closed immediately

**Решение:**
- Проверьте, что токен валидный
- Получите новый токен через `/users/login`
- Убедитесь, что backend запущен

**Проблема:** "Access denied to this execution"

**Решение:**
- Убедитесь, что вы член проекта
- Проверьте, что execution существует
- Используйте execution из вашего проекта

**Проблема:** Не приходят обновления

**Решение:**
- Подпишитесь ДО запуска execution
- Проверьте, что execution действительно выполняется
- Посмотрите логи сервера

---

## Полная документация

- **README.md** - полное описание API и функциональности
- **INTEGRATION.md** - интеграция с ExecutionsService
- **CHANGELOG.md** - история изменений

## Поддержка

Если возникли проблемы:
1. Проверьте логи backend
2. Проверьте консоль браузера
3. Убедитесь, что все зависимости установлены
4. Перезапустите backend

---

**Версия:** 1.0.0  
**Дата:** 2026-05-06
