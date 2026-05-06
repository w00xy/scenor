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
   

interface HttpRequestConfigProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  onSave: (config: any) => void;
  inputConnections?: ConnectionInfo[];
  outputConnections?: ConnectionInfo[];
  executionResult?: ExecutionResult | null;
}

export function HttpRequestConfig({ 
  config, 
  onSave,
  inputConnections = [],
  outputConnections = [],
  executionResult = null
}: HttpRequestConfigProps): JSX.Element {
  const [localConfig, setLocalConfig] = useState(config || {
    url: 'https://api.example.com/resource',
    method: 'GET',
    headers: {},
    query: {},
    body: null,
    timeout: 10000,
  });

  const [headersText, setHeadersText] = useState(
    JSON.stringify(localConfig.headers || {}, null, 2)
  );
  const [queryText, setQueryText] = useState(
    JSON.stringify(localConfig.query || {}, null, 2)
  );
  const [bodyText, setBodyText] = useState(
    localConfig.body ? JSON.stringify(localConfig.body, null, 2) : ''
  );

  const handleSave = () => {
    try {
      const headers = headersText.trim() ? JSON.parse(headersText) : {};
      const query = queryText.trim() ? JSON.parse(queryText) : {};
      const body = bodyText.trim() ? JSON.parse(bodyText) : null;

      onSave({
        ...localConfig,
        headers,
        query,
        body,
      });
    } catch (error) {
      console.error('JSON parse error:', error);
    }
  };
   

  // Обновление локального состояния без сохранения
  const handleChange = (newConfig: any) => {
    setLocalConfig(newConfig);
  };

  // Сохранение при потере фокуса
  const handleBlur = () => {
    handleSave();
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
          Узел получает данные от предыдущих узлов. Можно использовать переменные в URL, заголовках и теле запроса.
        </div>
      </div>

      <div className="node-config__section node-config__section--params">
        <h3 className="node-config__section-title">Параметры</h3>
        
        <div className="node-config__params-content">
        <div className="node-config__field">
          <label className="node-config__label">URL</label>
          <input
            type="text"
            className="node-config__input"
            value={localConfig.url || ''}
            onChange={(e) => handleChange({ ...localConfig, url: e.target.value })}
            onBlur={handleBlur}
            placeholder="https://api.example.com/resource"
          />
        </div>

        <div className="node-config__field">
          <label className="node-config__label">HTTP метод</label>
          <select
            className="node-config__select"
            value={localConfig.method || 'GET'}
            onChange={(e) => {
              const newConfig = { ...localConfig, method: e.target.value };
              handleChange(newConfig);
              onSave(newConfig);
            }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div className="node-config__field">
          <label className="node-config__label">Заголовки (JSON)</label>
          <textarea
            className="node-config__textarea"
            value={headersText}
            onChange={(e) => setHeadersText(e.target.value)}
            onBlur={handleSave}
            placeholder='{"Content-Type": "application/json"}'
            rows={4}
          />
        </div>

        <div className="node-config__field">
          <label className="node-config__label">Query параметры (JSON)</label>
          <textarea
            className="node-config__textarea"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onBlur={handleSave}
            placeholder='{"page": 1, "limit": 10}'
            rows={4}
          />
        </div>

        <div className="node-config__field">
          <label className="node-config__label">Тело запроса (JSON)</label>
          <textarea
            className="node-config__textarea"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            onBlur={handleSave}
            placeholder='{"key": "value"}'
            rows={6}
          />
        </div>

        <div className="node-config__field">
          <label className="node-config__label">Timeout (мс)</label>
          <input
            type="number"
            className="node-config__input"
            value={localConfig.timeout || 10000}
            onChange={(e) => handleChange({ ...localConfig, timeout: parseInt(e.target.value) })}
            onBlur={handleBlur}
            min={1000}
            max={60000}
          />
        </div>
      </div>
    </div>

    <div className="node-config__section node-config__section--output">
        <h3 className="node-config__section-title">Выход</h3>
        <div className="node-config__info">
          Узел возвращает объект с полями: status, headers, body (ответ от сервера).
        </div>
      </div>
    </ResizableNodeConfig>
  );
}
