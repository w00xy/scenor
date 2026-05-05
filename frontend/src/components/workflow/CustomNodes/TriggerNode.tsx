import { JSX, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import PlaySVG from "../../../assets/common/Play.svg?react";
import TrashSVG from "../../../assets/common/Trash.svg?react";
import MMDotsSVG from "../../../assets/common/Dots.svg?react";
import { nodeIconMap, nodeDisplayNames } from "../nodeIconMap";
import "./TriggerNode.scss";

export const TriggerNode = memo(({ data, selected, id }: NodeProps): JSX.Element => {
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data?.onPlay) {
      data.onPlay();
    }
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
    console.log('TriggerNode double click:', id, 'has handler:', !!data?.onDoubleClick);
    if (data?.onDoubleClick) {
      data.onDoubleClick(id);
    } else {
      console.warn('No onDoubleClick handler in node data');
    }
  };

  const isTriggered = data?.isTriggered || false;
  const nodeType = data?.typeCode || data?.type || "";
  const NodeIcon = nodeIconMap[nodeType];
  const displayName = nodeDisplayNames[nodeType] || data.label || "Trigger";

  return (
    <div 
      className={`trigger-node ${selected ? 'selected' : ''} ${isTriggered ? 'triggered' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="source" position={Position.Right} id="right" />
      
      {selected && (
        <div className="trigger-node__actions">
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
      
      <div className="trigger-node__content">
        {NodeIcon && (
          <div className="trigger-node__icon">
            <NodeIcon />
          </div>
        )}
      </div>
      
      <div className="trigger-node__label">
        {displayName}
      </div>
    </div>
  );
});

TriggerNode.displayName = "TriggerNode";
