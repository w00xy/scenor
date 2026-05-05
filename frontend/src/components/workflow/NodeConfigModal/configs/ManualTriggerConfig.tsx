import { JSX, useState } from "react";
import { ResizableNodeConfig } from "./ResizableNodeConfig";
import "./NodeConfig.scss";

interface ManualTriggerConfigProps {
  config: any;
  onSave: (config: any) => void;
}

export function ManualTriggerConfig({ config, onSave }: ManualTriggerConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || {});
  const [inputDataJson, setInputDataJson] = useState(
    JSON.stringify(localConfig.inputDataJson || {}, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleInputDataChange = (value: string) => {
    setInputDataJson(value);
    
    // Валидация JSON
    if (value.trim() === "") {
      setJsonError(null);
      const updated = { ...localConfig };
      delete updated.inputDataJson;
      setLocalConfig(updated);
      onSave(updated);
      return;
    }
    
    try {
      const parsed = JSON.parse(value);
      setJsonError(null);
      const updated = { ...localConfig, inputDataJson: parsed };
      setLocalConfig(updated);
      onSave(updated);
    } catch (e) {
      setJsonError("Некорректный JSON");
    }
  };

  return (
    <ResizableNodeConfig hasInput={false} hasOutput={true}>
      <div className="node-config__section node-config__section--params-trigger">
        <h3 className="node-config__section-title">Параметры</h3>
        
        <div className="node-config__params-content">
          <div className="node-config__info">
            Manual Trigger запускает workflow вручную. Вы можете задать входные данные по умолчанию, которые будут использоваться при запуске.
          </div>

          <div className="node-config__field">
            <label className="node-config__label">
              Входные данные по умолчанию (JSON):
            </label>
            <textarea
              className={`node-config__textarea ${jsonError ? 'error' : ''}`}
              value={inputDataJson}
              onChange={(e) => handleInputDataChange(e.target.value)}
              placeholder='{"key": "value"}'
              rows={8}
            />
            {jsonError && (
              <div className="node-config__error">{jsonError}</div>
            )}
            <div className="node-config__hint">
              Эти данные будут использоваться как входные при запуске workflow. Можно переопределить при запуске через модальное окно.
            </div>
          </div>
        </div>
      </div>

      <div className="node-config__section node-config__section--output-trigger">
        <h3 className="node-config__section-title">Выход</h3>
        <div className="node-config__info">
          Узел передаёт входные данные (или пустой объект, если данные не заданы) следующим узлам в цепочке.
        </div>
      </div>
    </ResizableNodeConfig>
  );
}
