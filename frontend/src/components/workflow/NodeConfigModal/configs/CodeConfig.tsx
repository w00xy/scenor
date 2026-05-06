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
   

interface CodeConfigProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  onSave: (config: any) => void;
  inputConnections?: ConnectionInfo[];
  outputConnections?: ConnectionInfo[];
  executionResult?: ExecutionResult | null;
}

export function CodeConfig({ 
  config, 
  onSave,
  inputConnections = [],
  outputConnections = [],
  executionResult = null
}: CodeConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || { 
    language: 'javascript', 
    source: 'return input;' 
  });

  const handleLanguageChange = (language: string) => {
    const newConfig = { ...localConfig, language };
    setLocalConfig(newConfig);
    onSave(newConfig);
  };

  const handleSourceChange = (source: string) => {
    setLocalConfig({ ...localConfig, source });
  };

  const handleSourceBlur = () => {
    onSave(localConfig);
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
            onChange={(e) => handleLanguageChange(e.target.value)}
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
            onChange={(e) => handleSourceChange(e.target.value)}
            onBlur={handleSourceBlur}
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
    </ResizableNodeConfig>
  );
}
