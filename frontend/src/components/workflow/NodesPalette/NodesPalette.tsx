import { JSX } from "react";
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
  { code: "webhook_trigger", displayName: "Webhook", category: "trigger" },
  { code: "http_request", displayName: "HTTP Request", category: "action" },
  { code: "if", displayName: "IF", category: "logic" },
  { code: "switch", displayName: "Switch", category: "logic" },
  { code: "set", displayName: "Set", category: "data" },
  { code: "code", displayName: "Code", category: "action" },
  { code: "delay", displayName: "Delay", category: "action" },
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
            </h4>
            <div className="nodes-palette__nodes">
              {nodeTypes
                .filter((node) => node.category === category)
                .map((node) => (
                  <button
                    key={node.code}
                    className="nodes-palette__node-button"
                    onClick={() => onAddNode(node.code)}
                    title={node.displayName}
                  >
                    <span className="nodes-palette__node-icon">
                      {node.icon || "📦"}
                    </span>
                    <span className="nodes-palette__node-name">
                      {node.displayName}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
