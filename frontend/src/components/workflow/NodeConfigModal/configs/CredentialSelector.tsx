import { JSX, useState } from 'react';
import './CredentialSelector.scss';

interface Credential {
  id: string;
  name: string;
  type: string;
}

interface CredentialSelectorProps {
  credentials: Credential[];
}

export function CredentialSelector({
  credentials,
}: CredentialSelectorProps): JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const typeLabels: Record<string, string> = {
    api_key: 'API Key',
    basic_auth: 'Basic Auth',
    oauth: 'OAuth',
  };

  return (
    <div className="credential-selector">
      <button
        className="credential-selector__toggle"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`credential-selector__arrow ${expanded ? 'credential-selector__arrow--open' : ''}`}>▸</span>
        <span className="credential-selector__label">Учётные данные</span>
        <span className="credential-selector__hint">перетяните в поле</span>
      </button>
      {expanded && (
        <div className="credential-selector__dropdown">
          {credentials.length === 0 && (
            <div className="credential-selector__option credential-selector__option--empty">
              Нет доступных учётных данных
            </div>
          )}
          {credentials.map(c => (
            <div
              key={c.id}
              className="credential-selector__option"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', `[${c.name}]`);
                e.dataTransfer.effectAllowed = 'copy';
              }}
            >
              <span className="credential-selector__option-type">{typeLabels[c.type] || c.type}</span>
              <span className="credential-selector__option-name">{c.name}</span>
              <span className="credential-selector__drag-icon">⠿</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
