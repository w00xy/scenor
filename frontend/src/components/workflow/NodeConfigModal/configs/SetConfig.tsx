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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputDataJson: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputDataJson: any;
  errorMessage: string | null;
  finishedAt: string | null;
}
   

interface SetConfigProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  onSave: (config: any) => void;
  inputConnections?: ConnectionInfo[];
  outputConnections?: ConnectionInfo[];
  executionResult?: ExecutionResult | null;
}

export function SetConfig({ 
  config, 
  _onSave,
  inputConnections = [],
  outputConnections = [],
     
  executionResult = null
}: SetConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || { values: {} });
  const [valuesText, setValuesText] = useState(
    JSON.stringify(localConfig.values || {}, null, 2)
  );

  const handleChange = (text: string) => {
    setValuesText(text);
    // TODO: Автосохранение будет реализовано позже
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
        Узел может использовать данные от предыдущих узлов в значениях.
      </div>
      </div>

    <div className="node-config__section node-config__section--params">
        <h3 className="node-config__section-title">Параметры</h3>
      
      <div className="node-config__params-content">
        <div className="node-config__field">
          <label className="node-config__label">Значения (JSON)</label>
          <textarea
            className="node-config__textarea"
            value={valuesText}
            onChange={(e) => handleChange(e.target.value)}
            placeholder='{"key1": "value1", "key2": 123}'
            rows={10}
          />
          <span className="node-config__hint">
            Укажите пары ключ-значение в формате JSON.
          </span>
        </div>
      </div>
      </div>

    <div className="node-config__section node-config__section--output">
        <h3 className="node-config__section-title">Выход</h3>
        <div className="node-config__info">
        Узел возвращает объект с указанными значениями.
      </div>
      </div>
    </ResizableNodeConfig>
  );
}
