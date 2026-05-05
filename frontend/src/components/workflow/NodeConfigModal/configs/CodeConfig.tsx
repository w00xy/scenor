import { JSX, useState } from "react";
import { ResizableNodeConfig } from "./ResizableNodeConfig";
import "./NodeConfig.scss";

interface CodeConfigProps {
  config: any;
  onSave: (config: any) => void;
}

export function CodeConfig({ config, onSave }: CodeConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || { 
    language: 'javascript', 
    source: 'return input;' 
  });

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
            <label className="node-config__label">Язык программирования</label>
            <select
              className="node-config__select"
              value={localConfig.language || 'javascript'}
              onChange={(e) => handleChange({ ...localConfig, language: e.target.value })}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </div>

          <div className="node-config__field">
            <label className="node-config__label">Код</label>
            <textarea
              className="node-config__textarea node-config__textarea--code"
              value={localConfig.source || ''}
              onChange={(e) => handleChange({ ...localConfig, source: e.target.value })}
              placeholder="return input;"
              rows={15}
              spellCheck={false}
            />
            <span className="node-config__hint">
              Используйте переменную <code>input</code> для доступа к входным данным. 
              Верните результат через <code>return</code>.
            </span>
          </div>
        </div>
        </div>

      <div className="node-config__section node-config__section--output">
          <h3 className="node-config__section-title">Выход</h3>
          <div className="node-config__info">
          Узел возвращает результат выполнения кода.
        </div>
        </div>
  </div>
    </ResizableNodeConfig>
  );
}
