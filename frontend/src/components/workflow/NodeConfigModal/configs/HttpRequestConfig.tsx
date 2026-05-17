import { JSX, useState, useRef, useCallback } from "react";
import { ResizableNodeConfig } from "./ResizableNodeConfig";
import "./NodeConfig.scss";
import { credentialsApi } from "../../../../services/api";

interface ConnectionInfo {
  nodeId: string;
  nodeName: string;
  nodeType: string;
}

interface ExecutionResult {
  status: string;
  inputDataJson: any;
  outputDataJson: any;
  errorMessage: string | null;
  finishedAt: string | null;
}

interface HttpRequestConfigProps {
  config: any;
  onSave: (config: any) => void;
  inputConnections?: ConnectionInfo[];
  outputConnections?: ConnectionInfo[];
  executionResult?: ExecutionResult | null;
  credentials?: Array<{ id: string; name: string; type: string }>;
}

export function HttpRequestConfig({ 
  config, 
  onSave,
  inputConnections = [],
  outputConnections = [],
  executionResult = null,
  credentials = [],
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

  const headersRef = useRef(headersText);
  const queryRef = useRef(queryText);
  const bodyRef = useRef(bodyText);
  const urlRef = useRef(localConfig.url);

  const updateHeaders = (v: string) => { headersRef.current = v; setHeadersText(v); };
  const updateQuery = (v: string) => { queryRef.current = v; setQueryText(v); };
  const updateBody = (v: string) => { bodyRef.current = v; setBodyText(v); };
  const updateUrl = (v: string) => { urlRef.current = v; setLocalConfig(prev => ({ ...prev, url: v })); };

  const handleSave = async () => {
    try {
      let hText = headersRef.current;
      let qText = queryRef.current;
      let bText = bodyRef.current;
      let rUrl = urlRef.current || '';

      // Резолвим [CredentialName] в сырых строках
      const nameRe = /\[(.+?)\]/g;
      const allText = hText + qText + bText + rUrl;
      const foundNames = [...new Set([...allText.matchAll(nameRe)].map(m => m[1]))];

      if (foundNames.length > 0 && credentials.length > 0) {
        const nameToCred = new Map(credentials.map(c => [c.name, c]));
        for (const credName of foundNames) {
          const cred = nameToCred.get(credName);
          if (!cred) continue;
          try {
            const resp = await credentialsApi.getCredentialData(cred.id);
            const inner = (resp as any)?.data;
            const secret = inner?.apiKey || inner?.password || inner?.token || '';
            const esc = credName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp(`\\[${esc}\\]`, 'g');
            hText = hText.replace(re, secret);
            qText = qText.replace(re, secret);
            bText = bText.replace(re, secret);
            rUrl = rUrl.replace(re, secret);
          } catch { /* skip if credential not found */ }
        }
      }

      const headers = hText.trim() ? JSON.parse(hText) : {};
      const query = qText.trim() ? JSON.parse(qText) : {};
      const body = bText.trim() ? JSON.parse(bText) : null;

      onSave({
        ...localConfig,
        url: rUrl,
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
    void handleSave();
  };

  return (
    <ResizableNodeConfig 
      hasInput={true} 
      hasOutput={true}
      inputConnections={inputConnections}
      outputConnections={outputConnections}
      executionResult={executionResult}
      credentials={credentials}
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
            onChange={(e) => updateUrl(e.target.value)}
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
            onChange={(e) => updateHeaders(e.target.value)}
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
            onChange={(e) => updateQuery(e.target.value)}
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
            onChange={(e) => updateBody(e.target.value)}
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
