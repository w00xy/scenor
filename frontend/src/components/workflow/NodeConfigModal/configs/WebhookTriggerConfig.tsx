import { JSX, useState } from "react";
import { ResizableNodeConfig } from "./ResizableNodeConfig";
import "./NodeConfig.scss";

interface WebhookTriggerConfigProps {
  config: any;
  onSave: (config: any) => void;
}

export function WebhookTriggerConfig({ config, onSave }: WebhookTriggerConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || { path: '/hook', method: 'POST' });

  const handleChange = (newConfig: any) => {
    setLocalConfig(newConfig);
    // TODO: Автосохранение будет реализовано позже
  };

  return (
    <ResizableNodeConfig hasInput={false} hasOutput={true}>
      <div className="node-config__section node-config__section--params">
        <h3 className="node-config__section-title">Параметры</h3>
        
        <div className="node-config__params-content">
          <div className="node-config__field">
            <label className="node-config__label">Путь webhook</label>
            <input
              type="text"
              className="node-config__input"
              value={localConfig.path || ''}
              onChange={(e) => handleChange({ ...localConfig, path: e.target.value })}
              placeholder="/hook"
            />
            <span className="node-config__hint">Например: /webhook/my-trigger</span>
          </div>

          <div className="node-config__field">
            <label className="node-config__label">HTTP метод</label>
            <select
              className="node-config__select"
              value={localConfig.method || 'POST'}
              onChange={(e) => handleChange({ ...localConfig, method: e.target.value })}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>
      </div>

      <div className="node-config__section node-config__section--output">
        <h3 className="node-config__section-title">Выход</h3>
        <div className="node-config__info">
          Узел передаёт данные из тела запроса (body), заголовков (headers) и параметров (query).
        </div>
      </div>
    </ResizableNodeConfig>
  );
}
