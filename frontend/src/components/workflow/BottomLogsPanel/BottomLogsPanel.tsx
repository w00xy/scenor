import { JSX, useState, useRef, useEffect } from "react";
import { workflowApi } from "../../../services/api";
import { NodeLog } from "../../../services/websocket";
import "./BottomLogsPanel.scss";

interface BottomLogsPanelProps {
  workflowId: string;
  lastExecutionId: string | null;
  onHeightChange?: (height: number) => void;
  nodes?: Array<{ id: string; data: { label?: string; typeCode?: string } }>;
  realtimeLogs?: NodeLog[];
}

interface ExecutionLog {
  id: string;
  executionId: string;
  nodeId: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  inputDataJson: any;
  outputDataJson: any;
  errorMessage: string | null;
}

export function BottomLogsPanel({ workflowId, lastExecutionId, onHeightChange, nodes = [], realtimeLogs = [] }: BottomLogsPanelProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState(40);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startHeight = useRef(0);

  const minHeight = 40;
  const maxHeight = 600;

  useEffect(() => {
    if (onHeightChange) {
      onHeightChange(height);
    }
  }, [height, onHeightChange]);

  useEffect(() => {
    if (lastExecutionId && isExpanded) {
      loadLogs();
    }
  }, [lastExecutionId, isExpanded]);

  // Обновляем логи из WebSocket в реальном времени
  useEffect(() => {
    if (realtimeLogs.length > 0) {
      setLogs((prevLogs) => {
        const updatedLogs = [...prevLogs];
        
        realtimeLogs.forEach((wsLog) => {
          const existingIndex = updatedLogs.findIndex(log => log.id === wsLog.id);
          
          // Преобразуем NodeLog в ExecutionLog
          const executionLog: ExecutionLog = {
            id: wsLog.id,
            executionId: lastExecutionId || '',
            nodeId: wsLog.nodeId,
            status: wsLog.status,
            startedAt: wsLog.startedAt,
            finishedAt: wsLog.finishedAt,
            inputDataJson: wsLog.inputDataJson,
            outputDataJson: wsLog.outputDataJson,
            errorMessage: wsLog.errorMessage,
          };
          
          if (existingIndex >= 0) {
            // Обновляем существующий лог
            updatedLogs[existingIndex] = executionLog;
          } else {
            // Добавляем новый лог
            updatedLogs.push(executionLog);
          }
        });
        
        return updatedLogs;
      });
      
      // Автоматически раскрываем панель только при первом логе
      // и только если панель была свёрнута (не была вручную закрыта)
      if (!isExpanded && realtimeLogs.length === 1) {
        setIsExpanded(true);
        setHeight(300);
      }
    }
  }, [realtimeLogs, lastExecutionId, isExpanded]);

  const loadLogs = async () => {
    if (!lastExecutionId) return;

    setIsLoading(true);
    try {
      const fetchedLogs = await workflowApi.getExecutionLogs(workflowId, lastExecutionId);
      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startHeight.current = height;
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaY = startY.current - e.clientY;
      const newHeight = Math.min(maxHeight, Math.max(minHeight, startHeight.current + deltaY));
      setHeight(newHeight);
      setIsExpanded(newHeight > minHeight);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const toggleExpand = () => {
    if (isExpanded) {
      setHeight(minHeight);
      setIsExpanded(false);
    } else {
      setHeight(300);
      setIsExpanded(true);
    }
  };

  const getNodeName = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node?.data?.label) {
      return node.data.label;
    }
    if (node?.data?.typeCode) {
      return node.data.typeCode;
    }
    return nodeId;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const calculateDuration = (startedAt: string, finishedAt: string | null) => {
    if (!finishedAt) return "выполняется...";
    const start = new Date(startedAt).getTime();
    const end = new Date(finishedAt).getTime();
    const duration = end - start;
    
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "#4CAF50";
      case "error":
        return "#FF4B33";
      case "running":
        return "#FFA726";
      default:
        return "#999";
    }
  };

  return (
    <div className="bottom-logs-panel" style={{ height: `${height}px` }}>
      <div className="bottom-logs-panel__resize-handle" onMouseDown={handleMouseDown} />
      
      <div className="bottom-logs-panel__header" onClick={toggleExpand}>
        <span className="bottom-logs-panel__title">Логи</span>
        <span className="bottom-logs-panel__toggle">{isExpanded ? "▼" : "▲"}</span>
      </div>

      {isExpanded && (
        <div className="bottom-logs-panel__content">
          {isLoading ? (
            <div className="bottom-logs-panel__loading">Загрузка логов...</div>
          ) : logs.length === 0 ? (
            <div className="bottom-logs-panel__empty">Нет логов для отображения</div>
          ) : (
            <div className="bottom-logs-panel__logs">
              {logs.map((log) => (
                <div key={log.id} className="log-item">
                  <div className="log-item__header">
                    <span 
                      className="log-item__status" 
                      style={{ color: getStatusColor(log.status) }}
                    >
                      ● {log.status}
                    </span>
                    <span className="log-item__time">{formatDate(log.startedAt)}</span>
                  </div>
                  <div className="log-item__details">
                    <span className="log-item__node-name">{getNodeName(log.nodeId)}</span>
                    <span className="log-item__duration">
                      {calculateDuration(log.startedAt, log.finishedAt)}
                    </span>
                  </div>
                  {log.errorMessage && (
                    <div className="log-item__error">{log.errorMessage}</div>
                  )}
                  {log.inputDataJson && Object.keys(log.inputDataJson).length > 0 && (
                    <details className="log-item__input" open>
                      <summary>Входные данные</summary>
                      <div className="log-item__data-block">
                        <button className="log-item__copy-btn" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(JSON.stringify(log.inputDataJson, null, 2)); }}>📋</button>
                        <pre>{JSON.stringify(log.inputDataJson, null, 2)}</pre>
                      </div>
                    </details>
                  )}
                  {log.outputDataJson && (
                    <details className="log-item__output" open>
                      <summary>Результат выполнения</summary>
                      <div className="log-item__data-block">
                        <button className="log-item__copy-btn" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(JSON.stringify(log.outputDataJson, null, 2)); }}>📋</button>
                        <pre>{JSON.stringify(log.outputDataJson, null, 2)}</pre>
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
