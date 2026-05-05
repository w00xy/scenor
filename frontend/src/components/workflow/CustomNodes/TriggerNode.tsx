import { JSX, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import PlaySVG from "../../../assets/PlaySVG.svg?react";
import TrashSVG from "../../../assets/TrashSVG.svg?react";
import MMDotsSVG from "../../../assets/MM_DotsSVG.svg?react";
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

  const isTriggered = data?.isTriggered || false;

  return (
    <div className={`trigger-node ${selected ? 'selected' : ''} ${isTriggered ? 'triggered' : ''}`}>
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
        {data.label || "Trigger"}
      </div>
    </div>
  );
});

TriggerNode.displayName = "TriggerNode";
