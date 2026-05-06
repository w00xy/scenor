import { JSX, useState } from "react";
import { ResizableNodeConfig } from "./ResizableNodeConfig";
import "./NodeConfig.scss";

interface ConnectionInfo {
  nodeId: string;
  nodeName: string;
  nodeType: string;
}

interface ExecutionResult {
  status: string;
  inputDataJson: any;
  outputDataJson: any;
  errorMessage: string | null;
  finishedAt: string | null;
}

interface DelayConfigProps {
  config: any;
  onSave: (config: any) => void;
  inputConnections?: ConnectionInfo[];
  outputConnections?: ConnectionInfo[];
  executionResult?: ExecutionResult | null;
}

export function DelayConfig({ 
  config, 
  onSave,
  inputConnections = [],
  outputConnections = [],
  executionResult = null
}: DelayConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || { durationMs: 1000 });

  const handleChange = (newConfig: any) => {
    setLocalConfig(newConfig);
  };

  const handleBlur = () => {
    onSave(localConfig);
  };

  return (
    <ResizableNodeConfig 
      hasInput={true} 
      hasOutput={true}
      inputConnections={inputConnections}
      outputConnections={outputConnections}
      executionResult={executionResult}
    >
      <div className="node-config__section node-config__section--input">
        <h3 className="node-config__section-title">Вход</h3>
        <div className="node-config__info">
        Узел получает данные от предыдущего узла и передаёт их дальше после задержки.
      </div>
      </div>

    <div className="node-config__section node-config__section--params">
        <h3 className="node-config__section-title">Параметры</h3>
      
      <div className="node-config__params-content">
        <div className="node-config__field">
          <label className="node-config__label">Задержка (миллисекунды)</label>
          <input
            type="number"
            className="node-config__input"
            value={localConfig.durationMs || 1000}
            onChange={(e) => handleChange({ ...localConfig, durationMs: parseInt(e.target.value) })}
            onBlur={handleBlur}
            min={100}
            max={60000}
          />
          <span className="node-config__hint">
            1000 мс = 1 секунда
          </span>
        </div>
      </div>
      </div>

    <div className="node-config__section node-config__section--output">
        <h3 className="node-config__section-title">Выход</h3>
        <div className="node-config__info">
        Узел возвращает те же данные, что получил на входе, после указанной задержки.
      </div>
      </div>
    </ResizableNodeConfig>
  );
}
