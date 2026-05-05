import { JSX, useState } from "react";
import { ResizableNodeConfig } from "./ResizableNodeConfig";
import "./NodeConfig.scss";

interface IfConfigProps {
  config: any;
  onSave: (config: any) => void;
}

interface Condition {
  left: string;
  operator: string;
  right: any;
}

export function IfConfig({ config, onSave }: IfConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || { 
    mode: 'all', 
    conditions: [] as Condition[] 
  });

  const addCondition = () => {
    const newConfig = {
      ...localConfig,
      conditions: [...localConfig.conditions, { left: '', operator: 'equals', right: '' }]
    };
    setLocalConfig(newConfig);
    onSave(newConfig);
  };

  const removeCondition = (index: number) => {
    const newConfig = {
      ...localConfig,
      conditions: localConfig.conditions.filter((_: any, i: number) => i !== index)
    };
    setLocalConfig(newConfig);
    onSave(newConfig);
  };

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    const newConditions = [...localConfig.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    const newConfig = { ...localConfig, conditions: newConditions };
    setLocalConfig(newConfig);
  };

  const handleConditionBlur = () => {
    onSave(localConfig);
  };

  const handleOperatorChange = (index: number, operator: string) => {
    const newConditions = [...localConfig.conditions];
    newConditions[index] = { ...newConditions[index], operator };
    const newConfig = { ...localConfig, conditions: newConditions };
    setLocalConfig(newConfig);
    onSave(newConfig);
  };

  const handleModeChange = (mode: string) => {
    const newConfig = { ...localConfig, mode };
    setLocalConfig(newConfig);
    onSave(newConfig);
  };

  return (
    <ResizableNodeConfig hasInput={true} hasOutput={true}>
      <div className="node-config__section node-config__section--input">
        <h3 className="node-config__section-title">Вход</h3>
        <div className="node-config__info">
          Узел получает данные от предыдущего узла и проверяет условия.
        </div>
      </div>

      <div className="node-config__section node-config__section--params">
        <h3 className="node-config__section-title">Параметры</h3>
        
        <div className="node-config__params-content">
        <div className="node-config__field">
          <label className="node-config__label">Режим проверки</label>
          <select
            className="node-config__select"
            value={localConfig.mode || 'all'}
            onChange={(e) => handleModeChange(e.target.value)}
          >
            <option value="all">Все условия (AND)</option>
            <option value="any">Любое условие (OR)</option>
          </select>
        </div>

        <div className="node-config__field">
          <label className="node-config__label">Условия</label>
          {localConfig.conditions.map((condition: Condition, index: number) => (
            <div key={index} className="node-config__condition">
              <input
                type="text"
                className="node-config__input node-config__input--small"
                value={condition.left}
                onChange={(e) => updateCondition(index, 'left', e.target.value)}
                onBlur={handleConditionBlur}
                placeholder="Левая часть (например: {{input.body.completed}})"
              />
              <select
                className="node-config__select node-config__select--small"
                value={condition.operator}
                onChange={(e) => handleOperatorChange(index, e.target.value)}
              >
                <option value="equals">=</option>
                <option value="not_equals">≠</option>
                <option value="greater_than">{'>'}</option>
                <option value="less_than">{'<'}</option>
                <option value="greater_than_or_equal">{'>='}</option>
                <option value="less_than_or_equal">{'<='}</option>
                <option value="contains">содержит</option>
              </select>
              <input
                type="text"
                className="node-config__input node-config__input--small"
                value={condition.right}
                onChange={(e) => updateCondition(index, 'right', e.target.value)}
                onBlur={handleConditionBlur}
                placeholder="Правая часть (например: true)"
              />
              <button
                className="node-config__remove-btn"
                onClick={() => removeCondition(index)}
              >
                ✕
              </button>
            </div>
          ))}
          <button className="node-config__add-btn" onClick={addCondition}>
          + Добавить условие
        </button>
      </div>
    </div>
  </div>

  <div className="node-config__section node-config__section--output">
    <h3 className="node-config__section-title">Выход</h3>
    <div className="node-config__info">
      Узел имеет два выхода: true (условия выполнены) и false (условия не выполнены).
    </div>
  </div>
</ResizableNodeConfig>
  );
}
