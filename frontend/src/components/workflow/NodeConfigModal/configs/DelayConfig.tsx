import { JSX, useState } from "react";
import { ResizableNodeConfig } from "./ResizableNodeConfig";
import "./NodeConfig.scss";

interface DelayConfigProps {
  config: any;
  onSave: (config: any) => void;
}

export function DelayConfig({ config, onSave }: DelayConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || { durationMs: 1000 });

  const handleChange = (newConfig: any) => {
    setLocalConfig(newConfig);
    // TODO: Автосохранение будет реализовано позже
  };

  return (
    <ResizableNodeConfig hasInput={true} hasOutput={true}>
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
