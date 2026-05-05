import { JSX, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import PlaySVG from "../../../assets/common/Play.svg?react";
import TrashSVG from "../../../assets/common/Trash.svg?react";
import MMDotsSVG from "../../../assets/common/Dots.svg?react";
import { nodeIconMap, nodeDisplayNames } from "../nodeIconMap";
import "./DefaultNode.scss";

export const DefaultNode = memo(({ data, selected, id }: NodeProps): JSX.Element => {
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

  const nodeType = data?.typeCode || data?.type || "";
  const NodeIcon = nodeIconMap[nodeType];
  const displayName = nodeDisplayNames[nodeType] || data.label || "Node";

  return (
    <div className={`default-node ${selected ? 'selected' : ''}`}>
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
});

DefaultNode.displayName = "DefaultNode";
