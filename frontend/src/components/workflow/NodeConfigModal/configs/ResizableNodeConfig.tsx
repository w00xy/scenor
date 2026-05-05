import React, { JSX, useState, useRef } from "react";
import "./NodeConfig.scss";

interface ResizableNodeConfigProps {
  hasInput: boolean;
  hasOutput: boolean;
  children: React.ReactNode;
}

export function ResizableNodeConfig({ hasInput, hasOutput, children }: ResizableNodeConfigProps): JSX.Element {
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
          return child;
        })}
      </div>
    </div>
  );
}
