import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getWebSocketService,
  ExecutionUpdate,
  NodeLog,
  ConnectionStatus,
} from '../services/websocket';

export interface UseExecutionWebSocketOptions {
  executionId?: string;
  autoConnect?: boolean;
  autoSubscribe?: boolean;
}

export interface UseExecutionWebSocketReturn {
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  executionStatus: string | null;
  logs: NodeLog[];
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  subscribe: (executionId: string) => void;
  unsubscribe: (executionId: string) => void;
}

export function useExecutionWebSocket(
  options: UseExecutionWebSocketOptions = {}
): UseExecutionWebSocketReturn {
  const { executionId, autoConnect = true, autoSubscribe = true } = options;

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [logs, setLogs] = useState<NodeLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  const wsServiceRef = useRef(getWebSocketService());
  const subscribedExecutionsRef = useRef<Set<string>>(new Set());

  const handleConnectionChange = useCallback((status: ConnectionStatus) => {
    console.warn('[useExecutionWebSocket] Connection status:', status);
    setConnectionStatus(status);
  }, []);

  const handleExecutionUpdate = useCallback((execId: string, data: ExecutionUpdate) => {
    console.warn('[useExecutionWebSocket] Execution update:', execId, data.status);
    setExecutionStatus(data.status);
    
    // Если execution завершен, можно показать уведомление
    if (data.status === 'success' || data.status === 'failed') {
      console.warn(`[useExecutionWebSocket] Execution ${execId} finished with status: ${data.status}`);
    }
  }, []);

  const handleNodeLog = useCallback((execId: string, log: NodeLog) => {
    console.warn('[useExecutionWebSocket] Node log:', execId, log.nodeId, log.status);
    setLogs((prevLogs) => {
      // Проверяем, есть ли уже лог с таким ID
      const existingIndex = prevLogs.findIndex(l => l.id === log.id);
      
      if (existingIndex >= 0) {
        // Обновляем существующий лог
        const newLogs = [...prevLogs];
        newLogs[existingIndex] = log;
        return newLogs;
      } else {
        // Добавляем новый лог
        return [...prevLogs, log];
      }
    });
  }, []);

  const handleError = useCallback((message: string) => {
    console.error('[useExecutionWebSocket] Error:', message);
    setError(message);
  }, []);

  // Инициализация WebSocket сервиса с callbacks
  useEffect(() => {
    const service = getWebSocketService({
      onConnectionChange: handleConnectionChange,
      onExecutionUpdate: handleExecutionUpdate,
      onNodeLog: handleNodeLog,
      onError: handleError,
    });

    wsServiceRef.current = service;
    const subscriptionsToClean = subscribedExecutionsRef.current;

    if (autoConnect) {
      service.connect();
    }

    return () => {
      // Отписываемся от всех execution при размонтировании
      const currentSubscriptions = Array.from(subscriptionsToClean);
      currentSubscriptions.forEach(execId => {
        service.unsubscribe(execId);
      });
      subscriptionsToClean.clear();
    };
  }, [autoConnect, handleConnectionChange, handleExecutionUpdate, handleNodeLog, handleError]);

  // Автоматическая подписка на executionId
  useEffect(() => {
    if (executionId && autoSubscribe && wsServiceRef.current.isConnected()) {
      console.warn('[useExecutionWebSocket] Auto-subscribing to:', executionId);
      wsServiceRef.current.subscribe(executionId);
      subscribedExecutionsRef.current.add(executionId);

      const currentExecutionId = executionId;
      const subscriptionsToClean = subscribedExecutionsRef.current;

      return () => {
        if (subscriptionsToClean.has(currentExecutionId)) {
          console.warn('[useExecutionWebSocket] Auto-unsubscribing from:', currentExecutionId);
          wsServiceRef.current.unsubscribe(currentExecutionId);
          subscriptionsToClean.delete(currentExecutionId);
        }
      };
    }
  }, [executionId, autoSubscribe, connectionStatus]);

  const connect = useCallback(() => {
    wsServiceRef.current.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsServiceRef.current.disconnect();
  }, []);

  const subscribe = useCallback((execId: string) => {
    console.warn('[useExecutionWebSocket] Subscribing to:', execId);
    wsServiceRef.current.subscribe(execId);
    subscribedExecutionsRef.current.add(execId);
    
    // Сбрасываем состояние при новой подписке
    setExecutionStatus(null);
    setLogs([]);
    setError(null);
  }, []);

  const unsubscribe = useCallback((execId: string) => {
    console.warn('[useExecutionWebSocket] Unsubscribing from:', execId);
    wsServiceRef.current.unsubscribe(execId);
    subscribedExecutionsRef.current.delete(execId);
  }, []);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    executionStatus,
    logs,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
  };
}
