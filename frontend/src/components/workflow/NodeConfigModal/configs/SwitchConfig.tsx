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

interface SwitchConfigProps {
  config: any;
  onSave: (config: any) => void;
  inputConnections?: ConnectionInfo[];
  outputConnections?: ConnectionInfo[];
  executionResult?: ExecutionResult | null;
}

interface SwitchCase {
  value: string;
  output: string;
}

export function SwitchConfig({ 
  config, 
  onSave,
  inputConnections = [],
  outputConnections = [],
  executionResult = null
}: SwitchConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || { 
    expression: '{{input.value}}', 
    cases: [] as SwitchCase[] 
  });

  const addCase = () => {
    const newConfig = {
      ...localConfig,
      cases: [...localConfig.cases, { value: '', output: '' }]
    };
    setLocalConfig(newConfig);
    // TODO: Автосохранение будет реализовано позже
  };

  const removeCase = (index: number) => {
    const newConfig = {
      ...localConfig,
      cases: localConfig.cases.filter((_: any, i: number) => i !== index)
    };
    setLocalConfig(newConfig);
    // TODO: Автосохранение будет реализовано позже
  };

  const updateCase = (index: number, field: keyof SwitchCase, value: string) => {
    const newCases = [...localConfig.cases];
    newCases[index] = { ...newCases[index], [field]: value };
    const newConfig = { ...localConfig, cases: newCases };
    setLocalConfig(newConfig);
    // TODO: Автосохранение будет реализовано позже
  };

  const handleExpressionChange = (expression: string) => {
    const newConfig = { ...localConfig, expression };
    setLocalConfig(newConfig);
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
        Узел получает данные от предыдущего узла и направляет их в разные ветки в зависимости от значения.
      </div>
      </div>

    <div className="node-config__section node-config__section--params">
        <h3 className="node-config__section-title">Параметры</h3>
      
      <div className="node-config__params-content">
        <div className="node-config__field">
          <label className="node-config__label">Выражение для проверки</label>
          <input
            type="text"
            className="node-config__input"
            value={localConfig.expression || ''}
            onChange={(e) => handleExpressionChange(e.target.value)}
            placeholder="{{input.value}}"
          />
          <span className="node-config__hint">
            Используйте переменные в формате {`{{input.field}}`}
          </span>
        </div>

        <div className="node-config__field">
          <label className="node-config__label">Варианты (Cases)</label>
          {localConfig.cases.map((caseItem: SwitchCase, index: number) => (
            <div key={index} className="node-config__condition">
              <input
                type="text"
                className="node-config__input node-config__input--small"
                value={caseItem.value}
                onChange={(e) => updateCase(index, 'value', e.target.value)}
                placeholder="Значение (например: success)"
              />
              <input
                type="text"
                className="node-config__input node-config__input--small"
                value={caseItem.output}
                onChange={(e) => updateCase(index, 'output', e.target.value)}
                placeholder="Выход (например: output1)"
              />
              <button
                className="node-config__remove-btn"
                onClick={() => removeCase(index)}
              >
                ✕
              </button>
            </div>
          ))}
          <button className="node-config__add-btn" onClick={addCase}>
            + Добавить вариант
          </button>
        </div>
      </div>
      </div>

    <div className="node-config__section node-config__section--output">
        <h3 className="node-config__section-title">Выход</h3>
        <div className="node-config__info">
        Узел имеет несколько выходов в зависимости от настроенных вариантов и выход по умолчанию (default).
      </div>
      </div>
    </ResizableNodeConfig>
  );
}
