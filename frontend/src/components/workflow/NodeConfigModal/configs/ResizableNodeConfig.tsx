import { JSX, useState } from "react";
import "./NodeConfig.scss";

interface ResizableNodeConfigProps {
  hasInput: boolean;
  hasOutput: boolean;
  children: React.ReactNode;
}

export function ResizableNodeConfig({ hasInput, hasOutput, children }: ResizableNodeConfigProps): JSX.Element {
  // Смещение секции Параметров от левого края (в пикселях)
  const [paramsOffset, setParamsOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startOffset = paramsOffset;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Ограничиваем смещение: минимум -400px (влево), максимум +400px (вправо)
      const newOffset = Math.max(-400, Math.min(400, startOffset + deltaX));
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

  return (
    <div className="node-config" style={{ position: 'relative' }}>
      {showResizer && (
        <div 
          className={`node-config__resizer ${isDragging ? 'node-config__resizer--dragging' : ''}`}
          onMouseDown={handleMouseDown}
          style={{ left: `calc(50% + ${paramsOffset}px)` }}
        >
          <div className="node-config__resizer-handle"></div>
        </div>
      )}
      <div className="node-config__sections" style={{ '--params-offset': `${paramsOffset}px` } as React.CSSProperties}>
        {children}
      </div>
    </div>
  );
}
