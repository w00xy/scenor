import { JSX, memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import "./DefaultNode.scss";

export const DefaultNode = memo(({ data }: NodeProps): JSX.Element => {
  return (
    <div className="default-node">
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      <div className="default-node__content">
        {data.label || "Node"}
      </div>
    </div>
  );
});

DefaultNode.displayName = "DefaultNode";
