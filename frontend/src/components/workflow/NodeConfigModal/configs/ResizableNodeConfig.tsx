import { JSX, useState } from "react";
import "./NodeConfig.scss";

interface ResizableNodeConfigProps {
  hasInput: boolean;
  hasOutput: boolean;
  children: React.ReactNode;
}

export function ResizableNodeConfig({ hasInput, hasOutput, children }: ResizableNodeConfigProps): JSX.Element {
  const [paramsWidth, setParamsWidth] = useState(550);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startX = e.clientX;
    const startWidth = paramsWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(300, Math.min(1200, startWidth + deltaX));
      setParamsWidth(newWidth);
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
          style={{ left: `calc(50% - ${paramsWidth / 2}px)` }}
        >
          <div className="node-config__resizer-handle"></div>
        </div>
      )}
      <div className="node-config__sections" style={{ '--params-width': `${paramsWidth}px` } as React.CSSProperties}>
        {children}
      </div>
    </div>
  );
}
