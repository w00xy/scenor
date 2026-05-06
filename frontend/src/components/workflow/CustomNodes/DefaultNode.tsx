import { JSX } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import PlaySVG from "../../../assets/common/Play.svg?react";
import TrashSVG from "../../../assets/common/Trash.svg?react";
import MMDotsSVG from "../../../assets/common/Dots.svg?react";
import { nodeIconMap, nodeDisplayNames } from "../nodeIconMap";
import "./DefaultNode.scss";

export function DefaultNode({ data, selected, id }: NodeProps): JSX.Element {
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data?.onDelete) {
      await data.onDelete(id);
    }
  };

  const handleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('DefaultNode double click:', id, 'has handler:', !!data?.onDoubleClick);
    if (data?.onDoubleClick) {
      data.onDoubleClick(id);
    } else {
      console.warn('No onDoubleClick handler in node data');
    }
  };

  const nodeType = data?.typeCode || data?.type || "";
  const NodeIcon = nodeIconMap[nodeType];
  const displayName = nodeDisplayNames[nodeType] || data.label || "Node";
  const executionStatus = data?.executionStatus || null;

  // Определяем CSS класс на основе статуса выполнения
  const getStatusClass = () => {
    if (executionStatus === 'success') return 'success';
    if (executionStatus === 'failed') return 'failed';
    if (executionStatus === 'running') return 'running';
    return '';
  };

  return (
    <div 
      className={`default-node ${selected ? 'selected' : ''} ${getStatusClass()}`}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      
      {selected && (
        <div className="default-node__actions">
          <button className="node-action-btn" onClick={handlePlay} title="Запустить">
            <PlaySVG />
          </button>
          <button className="node-action-btn" onClick={handleDelete} title="Удалить">
            <TrashSVG />
          </button>
          <button className="node-action-btn node-action-btn--rotated" onClick={handleMenu} title="Меню">
            <MMDotsSVG />
          </button>
        </div>
      )}
      
      <div className="default-node__content">
        {NodeIcon && (
          <div className="default-node__icon">
            <NodeIcon />
          </div>
        )}
      </div>
      
      <div className="default-node__label">
        {displayName}
      </div>
    </div>
  );
}
