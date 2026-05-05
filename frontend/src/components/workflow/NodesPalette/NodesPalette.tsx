import { JSX } from "react";
import { nodeIconMap, nodeDisplayNames } from "../nodeIconMap";
import "./NodesPalette.scss";

interface NodeType {
  code: string;
  displayName: string;
  category: string;
  icon?: string;
}

interface NodesPaletteProps {
  onAddNode: (typeCode: string) => void;
}

const nodeTypes: NodeType[] = [
  { code: "manual_trigger", displayName: "Manual Trigger", category: "trigger" },
  { code: "webhook_trigger", displayName: "Webhook Trigger", category: "trigger" },
  
  { code: "if", displayName: "IF", category: "logic" },
  { code: "switch", displayName: "Switch", category: "logic" },
  
  { code: "set", displayName: "Set", category: "data" },
  { code: "transform", displayName: "Transform", category: "data" },
  
  { code: "code", displayName: "Code", category: "action" },
  { code: "delay", displayName: "Delay", category: "action" },
  
  { code: "http_request", displayName: "HTTP Request", category: "integration" },
  { code: "db_select", displayName: "DB Select", category: "integration" },
  { code: "db_insert", displayName: "DB Insert", category: "integration" },
];

export function NodesPalette({ onAddNode }: NodesPaletteProps): JSX.Element {
  const categories = Array.from(new Set(nodeTypes.map((n) => n.category)));

  return (
    <div className="nodes-palette">
      <div className="nodes-palette__header">
        <h3>Узлы</h3>
      </div>
      <div className="nodes-palette__content">
        {categories.map((category) => (
          <div key={category} className="nodes-palette__category">
            <h4 className="nodes-palette__category-title">
              {category === "trigger" && "Триггеры"}
              {category === "action" && "Действия"}
              {category === "logic" && "Логика"}
              {category === "data" && "Данные"}
              {category === "integration" && "Интеграции"}
            </h4>
            <div className="nodes-palette__nodes">
              {nodeTypes
                .filter((node) => node.category === category)
                .map((node) => {
                  const NodeIcon = nodeIconMap[node.code];
                  const displayName = nodeDisplayNames[node.code] || node.displayName;
                  
                  return (
                    <button
                      key={node.code}
                      className="nodes-palette__node-button"
                      onClick={() => onAddNode(node.code)}
                      title={displayName}
                    >
                      {NodeIcon && (
                        <span className="nodes-palette__node-icon">
                          <NodeIcon />
                        </span>
                      )}
                      <span className="nodes-palette__node-name">
                        {displayName}
                      </span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
