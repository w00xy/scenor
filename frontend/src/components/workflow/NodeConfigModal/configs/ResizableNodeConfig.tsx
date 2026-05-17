import React, { JSX, useState, useCallback } from "react";
import { CredentialSelector } from "./CredentialSelector";
import "./NodeConfig.scss";

interface ConnectionInfo {
  nodeId: string;
  nodeName: string;
  nodeType: string;
}

interface ExecutionResult {
  status: string;
  inputDataJson: any;
  outputDataJson: any;
  errorMessage: string | null;
  finishedAt: string | null;
}

interface ResizableNodeConfigProps {
  hasInput: boolean;
  hasOutput: boolean;
  children: React.ReactNode;
  inputConnections?: ConnectionInfo[];
  outputConnections?: ConnectionInfo[];
  executionResult?: ExecutionResult | null;
  credentials?: Array<{ id: string; name: string; type: string }>;
}

function JsonDataBlock({ data }: { data: unknown }) {
  const [copied, setCopied] = useState(false);
  const jsonStr = JSON.stringify(data, null, 2);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = jsonStr;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [jsonStr]);

  return (
    <div className="node-config__data-block">
      <button className="node-config__copy-btn" onClick={handleCopy}>
        {copied ? '✓ Скопировано' : '📋 Копировать'}
      </button>
      <pre className="node-config__data-json">{jsonStr}</pre>
    </div>
  );
}

export function ResizableNodeConfig({ 
  hasInput, 
  hasOutput, 
  children,
  inputConnections = [],
  outputConnections = [],
  executionResult = null,
  credentials = [],
}: ResizableNodeConfigProps): JSX.Element {
  
  // Смещение секции Параметров от центра (в пикселях)
  const [paramsOffset, setParamsOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startOffset = paramsOffset;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Ограничиваем смещение: минимум -300px (влево), максимум +300px (вправо)
      const newOffset = Math.max(-300, Math.min(300, startOffset + deltaX));
      setParamsOffset(newOffset);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const showResizer = hasInput && hasOutput;

  // Вычисляем flex-basis для Вход и Выход на основе смещения
  // Используем calc для точного позиционирования
  const inputFlexBasis = `calc(50% - 300px + ${paramsOffset}px)`;
  const outputFlexBasis = `calc(50% - 300px - ${paramsOffset}px)`;

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
    <div className="node-config">
      <div 
        className="node-config__sections" 
        style={{ 
          '--input-flex-basis': inputFlexBasis,
          '--output-flex-basis': outputFlexBasis
        } as React.CSSProperties}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.props.className?.includes('node-config__section--params')) {
            // Оборачиваем секцию Параметров в контейнер с язычком
            return (
              <div className="node-config__params-wrapper">
                {showResizer && (
                  <div 
                    className={`node-config__resizer ${isDragging ? 'node-config__resizer--dragging' : ''}`}
                    onMouseDown={handleMouseDown}
                  >
                    <div className="node-config__resizer-handle"></div>
                  </div>
                )}
                {child}
              </div>
            );
          }
          
          // Добавляем информацию о подключениях в секцию Вход
          if (React.isValidElement(child) && child.props.className?.includes('node-config__section--input')) {
            return (
              <div className={child.props.className}>
                {credentials.length > 0 && (
                  <CredentialSelector
                    credentials={credentials}
                  />
                )}
                {child.props.children}
                {inputConnections.length > 0 && (
                  <div className="node-config__connections">
                    <h4 className="node-config__connections-title">Входящие подключения:</h4>
                    <ul className="node-config__connections-list">
                      {inputConnections.map((conn, index) => (
                        <li key={index} className="node-config__connection-item">
                          <span className="node-config__connection-type">{conn.nodeType}</span>
                          <span className="node-config__connection-name">{conn.nodeName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                 )}
                 {executionResult && executionResult.inputDataJson && (
                   <div className="node-config__data-display">
                     <h4 className="node-config__data-title">Входные данные (последнее выполнение):</h4>
                     <JsonDataBlock data={executionResult.inputDataJson} />
                   </div>
                 )}
              </div>
            );
          }
          
          // Добавляем информацию о подключениях и результатах в секцию Выход
          if (React.isValidElement(child) && child.props.className?.includes('node-config__section--output')) {
            return (
              <div className={child.props.className}>
                {child.props.children}
                {outputConnections.length > 0 && (
                  <div className="node-config__connections">
                    <h4 className="node-config__connections-title">Исходящие подключения:</h4>
                    <ul className="node-config__connections-list">
                      {outputConnections.map((conn, index) => (
                        <li key={index} className="node-config__connection-item">
                          <span className="node-config__connection-type">{conn.nodeType}</span>
                          <span className="node-config__connection-name">{conn.nodeName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                 )}
                 {executionResult && executionResult.outputDataJson && (
                   <div className="node-config__data-display">
                     <h4 className="node-config__data-title">Выходные данные (последнее выполнение):</h4>
                     <JsonDataBlock data={executionResult.outputDataJson} />
                   </div>
                 )}
                {executionResult && (
                  <div className="node-config__execution-result">
                    <h4 className="node-config__execution-title">Статус выполнения:</h4>
                    <div className="node-config__execution-status">
                      <span 
                        className="node-config__status-badge"
                        style={{ color: getStatusColor(executionResult.status) }}
                      >
                        ● {executionResult.status}
                      </span>
                      {executionResult.finishedAt && (
                        <span className="node-config__execution-time">
                          {formatDate(executionResult.finishedAt)}
                        </span>
                      )}
                    </div>
                    {executionResult.errorMessage && (
                      <div className="node-config__execution-error">
                        {executionResult.errorMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }
          
          return child;
        })}
      </div>
    </div>
  );
}
