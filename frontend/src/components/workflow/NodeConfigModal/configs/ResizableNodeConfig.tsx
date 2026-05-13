// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { JSX, useState, useRef } from "react";
import "./NodeConfig.scss";

interface ConnectionInfo {
  nodeId: string;
  nodeName: string;
  nodeType: string;
}

interface ExecutionResult {
  status: string;
  inputDataJson: unknown;
  outputDataJson: unknown;
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
}

export function ResizableNodeConfig({ 
  hasInput, 
  hasOutput, 
  children,
  inputConnections = [],
  outputConnections = [],
  executionResult = null
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
          if (React.isValidElement(child) && typeof child.props === 'object' && child.props && 'className' in child.props && typeof child.props.className === 'string' && child.props.className.includes('node-config__section--params')) {
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
          if (React.isValidElement(child) && typeof child.props === 'object' && child.props && 'className' in child.props && typeof child.props.className === 'string' && child.props.className.includes('node-config__section--input')) {
            const childProps = child.props as { className: string; children: React.ReactNode };
            return (
              <div className={childProps.className}>
                {childProps.children}
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
                     <details className="node-config__data-details" open>
                       <summary>Показать данные</summary>
                       <pre className="node-config__data-json">{JSON.stringify(executionResult.inputDataJson, null, 2)}</pre>
                     </details>
                   </div>
                 )}
              </div>
            );
          }
          
          // Добавляем информацию о подключениях и результатах в секцию Выход
          if (React.isValidElement(child) && typeof child.props === 'object' && child.props && 'className' in child.props && typeof child.props.className === 'string' && child.props.className.includes('node-config__section--output')) {
            const childProps = child.props as { className: string; children: React.ReactNode };
            return (
              <div className={childProps.className}>
                {childProps.children}
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
                     <details className="node-config__data-details" open>
                       <summary>Показать данные</summary>
                       <pre className="node-config__data-json">{JSON.stringify(executionResult.outputDataJson, null, 2)}</pre>
                     </details>
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
