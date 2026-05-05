import { JSX, useState } from "react";
import { ResizableNodeConfig } from "./ResizableNodeConfig";
import "./NodeConfig.scss";

interface IfConfigProps {
  config: any;
  onSave: (config: any) => void;
}

interface Condition {
  field: string;
  operator: string;
  value: string;
}

export function IfConfig({ config, onSave }: IfConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || { 
    mode: 'all', 
    conditions: [] as Condition[] 
  });

  const addCondition = () => {
    const newConfig = {
      ...localConfig,
      conditions: [...localConfig.conditions, { field: '', operator: '==', value: '' }]
    };
    setLocalConfig(newConfig);
    // TODO: Автосохранение будет реализовано позже
  };

  const removeCondition = (index: number) => {
    const newConfig = {
      ...localConfig,
      conditions: localConfig.conditions.filter((_: any, i: number) => i !== index)
    };
    setLocalConfig(newConfig);
    // TODO: Автосохранение будет реализовано позже
  };

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    const newConditions = [...localConfig.conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    const newConfig = { ...localConfig, conditions: newConditions };
    setLocalConfig(newConfig);
    // TODO: Автосохранение будет реализовано позже
  };

  const handleModeChange = (mode: string) => {
    const newConfig = { ...localConfig, mode };
    setLocalConfig(newConfig);
    // TODO: Автосохранение будет реализовано позже
  };

  return (
    <ResizableNodeConfig hasInput={true} hasOutput={true}>
      <div className="node-config__sections">
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
                  value={condition.field}
                  onChange={(e) => updateCondition(index, 'field', e.target.value)}
                  placeholder="Поле (например: input.value)"
                />
                <select
                  className="node-config__select node-config__select--small"
                  value={condition.operator}
                  onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                >
                  <option value="==">=</option>
                  <option value="!=">≠</option>
                  <option value=">">{'>'}</option>
                  <option value="<">{'<'}</option>
                  <option value=">=">{'>='}</option>
                  <option value="<=">{'<='}</option>
                  <option value="contains">содержит</option>
                </select>
                <input
                  type="text"
                  className="node-config__input node-config__input--small"
                  value={condition.value}
                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                  placeholder="Значение"
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
  </div>
</ResizableNodeConfig>
  );
}
