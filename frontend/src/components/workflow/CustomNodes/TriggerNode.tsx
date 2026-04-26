import { JSX, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import "./TriggerNode.scss";

export const TriggerNode = memo(({ data }: NodeProps): JSX.Element => {
  return (
    <div className="trigger-node">
      <Handle type="source" position={Position.Right} id="right" />
      <div className="trigger-node__content">
        {data.label || "Trigger"}
      </div>
    </div>
  );
});

TriggerNode.displayName = "TriggerNode";
