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
   

interface DbInsertNodeConfig {
  table?: string;
  values?: Record<string, unknown>;
}

interface DbInsertConfigProps {
  config: DbInsertNodeConfig;
  onSave: (config: DbInsertNodeConfig) => void;
  inputConnections?: ConnectionInfo[];
  outputConnections?: ConnectionInfo[];
  executionResult?: ExecutionResult | null;
}

export function DbInsertConfig({ 
  config, 
  onSave: _onSave,
  inputConnections = [],
  outputConnections = [],
  executionResult = null
}: DbInsertConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || { table: '', values: {} });
  const [valuesText, setValuesText] = useState(
    JSON.stringify(localConfig.values || {}, null, 2)
  );

  const handleTableChange = (table: string) => {
    const newConfig = { ...localConfig, table };
    setLocalConfig(newConfig);
    // TODO: Автосохранение будет реализовано позже
  };

  const handleValuesChange = (text: string) => {
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
        Узел может использовать данные от предыдущих узлов в значениях для вставки.
      </div>
      </div>

    <div className="node-config__section node-config__section--params">
        <h3 className="node-config__section-title">Параметры</h3>
      
      <div className="node-config__params-content">
        <div className="node-config__field">
          <label className="node-config__label">Таблица</label>
          <input
            type="text"
            className="node-config__input"
            value={localConfig.table || ''}
            onChange={(e) => handleTableChange(e.target.value)}
            placeholder="users"
          />
        </div>

        <div className="node-config__field">
          <label className="node-config__label">Значения (JSON)</label>
          <textarea
            className="node-config__textarea"
            value={valuesText}
            onChange={(e) => handleValuesChange(e.target.value)}
            placeholder='{"name": "John", "email": "john@example.com"}'
            rows={8}
          />
          <span className="node-config__hint">
            Укажите значения для вставки в формате JSON.
          </span>
        </div>
      </div>
      </div>

    <div className="node-config__section node-config__section--output">
        <h3 className="node-config__section-title">Выход</h3>
        <div className="node-config__info">
        Узел возвращает ID вставленной записи и количество затронутых строк.
      </div>
      </div>
    </ResizableNodeConfig>
  );
}
