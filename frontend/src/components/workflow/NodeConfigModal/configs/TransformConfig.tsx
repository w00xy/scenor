import { JSX, useState } from "react";
import { ResizableNodeConfig } from "./ResizableNodeConfig";
import "./NodeConfig.scss";

interface TransformConfigProps {
  config: any;
  onSave: (config: any) => void;
}

export function TransformConfig({ config, onSave }: TransformConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || { script: 'return input;' });

  const handleChange = (newConfig: any) => {
    setLocalConfig(newConfig);
    // TODO: Автосохранение будет реализовано позже
  };

  return (
    <ResizableNodeConfig hasInput={true} hasOutput={true}>
      <div className="node-config__sections">
        <div className="node-config__section node-config__section--input">
          <h3 className="node-config__section-title">Вход</h3>
          <div className="node-config__info">
          Узел получает данные в переменной <code>input</code>.
        </div>
        </div>

      <div className="node-config__section node-config__section--params">
          <h3 className="node-config__section-title">Параметры</h3>
        
        <div className="node-config__params-content">
          <div className="node-config__field">
            <label className="node-config__label">Скрипт трансформации (JavaScript)</label>
            <textarea
              className="node-config__textarea node-config__textarea--code"
              value={localConfig.script || ''}
              onChange={(e) => handleChange({ ...localConfig, script: e.target.value })}
              placeholder="return input;"
              rows={12}
              spellCheck={false}
            />
            <span className="node-config__hint">
              Напишите JavaScript код для преобразования данных. Используйте <code>input</code> для доступа к входным данным.
            </span>
          </div>
        </div>
        </div>

      <div className="node-config__section node-config__section--output">
          <h3 className="node-config__section-title">Выход</h3>
          <div className="node-config__info">
          Узел возвращает преобразованные данные.
        </div>
        </div>
  </div>
    </ResizableNodeConfig>
  );
}
