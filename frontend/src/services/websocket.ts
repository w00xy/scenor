import { getAccessToken } from './api';

export type ExecutionStatus = 'pending' | 'running' | 'success' | 'failed';

export interface ExecutionUpdate {
  id: string;
  status: ExecutionStatus;
  startedAt: string;
  finishedAt: string | null;
  error: string | null;
}

export interface NodeLog {
  id: string;
  nodeId: string;
  status: 'running' | 'success' | 'failed';
  startedAt: string;
  finishedAt: string | null;
  inputDataJson: any;
  outputDataJson: any;
  errorMessage: string | null;
}

export interface WebSocketMessage {
  type: 'connected' | 'subscribed' | 'unsubscribed' | 'execution-update' | 'node-log' | 'error' | 'pong';
  userId?: string;
  executionId?: string;
  data?: ExecutionUpdate;
  nodeLog?: NodeLog;
  message?: string;
  timestamp?: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ExecutionWebSocketCallbacks {
  onConnectionChange?: (status: ConnectionStatus) => void;
  onExecutionUpdate?: (executionId: string, data: ExecutionUpdate) => void;
  onNodeLog?: (executionId: string, log: NodeLog) => void;
  onError?: (message: string) => void;
}

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

export class ExecutionWebSocketService {
  private ws: WebSocket | null = null;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private callbacks: ExecutionWebSocketCallbacks = {};
  private subscriptions: Set<string> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(callbacks?: ExecutionWebSocketCallbacks) {
    if (callbacks) {
      this.callbacks = callbacks;
    }
  }

  public connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    const token = getAccessToken();
    if (!token) {
      console.error('[WebSocket] No access token available');
      this.updateConnectionStatus('error');
      this.callbacks.onError?.('Требуется авторизация');
      return;
    }

    try {
      this.updateConnectionStatus('connecting');
      const wsUrl = `${WS_BASE_URL}/executions?token=${encodeURIComponent(token)}`;
      
      console.log('[WebSocket] Connecting to:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected');
        this.updateConnectionStatus('connected');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        
        // Переподписаться на все execution, если были подписки
        this.subscriptions.forEach(executionId => {
          this.subscribe(executionId);
        });
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        this.updateConnectionStatus('error');
        this.callbacks.onError?.('Ошибка WebSocket соединения');
      };

      this.ws.onclose = (event) => {
        console.log('[WebSocket] Closed:', event.code, event.reason);
        this.updateConnectionStatus('disconnected');
        this.stopHeartbeat();
        
        // Попытка переподключения
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.connect();
          }, delay);
        } else {
          console.error('[WebSocket] Max reconnection attempts reached');
          this.callbacks.onError?.('Не удалось подключиться к серверу');
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.updateConnectionStatus('error');
      this.callbacks.onError?.('Не удалось установить соединение');
    }
  }

  public disconnect(): void {
    console.log('[WebSocket] Disconnecting');
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.subscriptions.clear();
    this.updateConnectionStatus('disconnected');
  }

  public subscribe(executionId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot subscribe: not connected');
      this.subscriptions.add(executionId);
      return;
    }

    console.log('[WebSocket] Subscribing to execution:', executionId);
    this.subscriptions.add(executionId);
    
    this.send({
      event: 'subscribe-execution',
      data: { executionId },
    });
  }

  public unsubscribe(executionId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot unsubscribe: not connected');
      this.subscriptions.delete(executionId);
      return;
    }

    console.log('[WebSocket] Unsubscribing from execution:', executionId);
    this.subscriptions.delete(executionId);
    
    this.send({
      event: 'unsubscribe-execution',
      data: { executionId },
    });
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public isConnected(): boolean {
    return this.connectionStatus === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  private send(data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send: not connected');
      return;
    }

    try {
      this.ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('[WebSocket] Send error:', error);
    }
  }

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      console.log('[WebSocket] Message received:', message.type, message);

      switch (message.type) {
        case 'connected':
          console.log('[WebSocket] Server confirmed connection, userId:', message.userId);
          break;

        case 'subscribed':
          console.log('[WebSocket] Subscribed to execution:', message.executionId);
          break;

        case 'unsubscribed':
          console.log('[WebSocket] Unsubscribed from execution:', message.executionId);
          break;

        case 'execution-update':
          if (message.executionId && message.data) {
            console.log('[WebSocket] Execution update:', message.executionId, message.data.status);
            this.callbacks.onExecutionUpdate?.(message.executionId, message.data);
          }
          break;

        case 'node-log':
          if (message.executionId && message.nodeLog) {
            console.log('[WebSocket] Node log:', message.executionId, message.nodeLog.nodeId, message.nodeLog.status);
            this.callbacks.onNodeLog?.(message.executionId, message.nodeLog);
          }
          break;

        case 'error':
          console.error('[WebSocket] Server error:', message.message);
          this.callbacks.onError?.(message.message || 'Неизвестная ошибка');
          break;

        case 'pong':
          console.log('[WebSocket] Pong received');
          break;

        default:
          console.warn('[WebSocket] Unknown message type:', message);
      }
    } catch (error) {
      console.error('[WebSocket] Message parsing error:', error);
    }
  }

  private updateConnectionStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      console.log('[WebSocket] Connection status changed:', status);
      this.callbacks.onConnectionChange?.(status);
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    // Отправляем ping каждые 25 секунд (сервер ожидает каждые 30 секунд)
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('[WebSocket] Sending ping');
        this.send({ event: 'ping' });
      }
    }, 25000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

// Singleton instance
let wsServiceInstance: ExecutionWebSocketService | null = null;

export const getWebSocketService = (callbacks?: ExecutionWebSocketCallbacks): ExecutionWebSocketService => {
  if (!wsServiceInstance) {
    wsServiceInstance = new ExecutionWebSocketService(callbacks);
  } else if (callbacks) {
    // Обновляем callbacks если они переданы
    wsServiceInstance['callbacks'] = { ...wsServiceInstance['callbacks'], ...callbacks };
  }
  return wsServiceInstance;
};

export const resetWebSocketService = (): void => {
  if (wsServiceInstance) {
    wsServiceInstance.disconnect();
    wsServiceInstance = null;
  }
};
