import { JSX, useState } from "react";
import { ResizableNodeConfig } from "./ResizableNodeConfig";
import "./NodeConfig.scss";

interface ManualTriggerConfigProps {
  config: any;
  onSave: (config: any) => void;
}

export function ManualTriggerConfig({ config, onSave }: ManualTriggerConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || {});

  const handleSave = () => {
    onSave(localConfig);
  };

  return (
    <ResizableNodeConfig hasInput={false} hasOutput={true}>
      <div className="node-config__section node-config__section--params-trigger">
        <h3 className="node-config__section-title">Параметры</h3>
        
        <div className="node-config__params-content">
          <div className="node-config__info">
            Manual Trigger не требует настройки. Нажмите кнопку "Запустить" для активации workflow.
          </div>
        </div>
      </div>

      <div className="node-config__section node-config__section--output-trigger">
        <h3 className="node-config__section-title">Выход</h3>
        <div className="node-config__info">
          Узел передаёт пустой объект данных следующим узлам в цепочке.
        </div>
      </div>
    </ResizableNodeConfig>
  );
}
