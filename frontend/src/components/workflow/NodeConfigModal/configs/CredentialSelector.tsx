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
                const text = `[${c.name}]`;
                e.dataTransfer.setData('text/plain', text);
                e.dataTransfer.effectAllowed = 'copy';
                const el = document.createElement('div');
                el.style.cssText =
                  'position:fixed;top:-9999px;left:-9999px;padding:8px 16px;' +
                  'background:#ff4b33;border-radius:8px;' +
                  'color:#ffffff;font-family:Inter,sans-serif;font-size:14px;font-weight:600;' +
                  'white-space:nowrap;box-shadow:0 4px 16px rgba(255,75,51,0.4);';
                el.textContent = c.name;
                document.body.appendChild(el);
                const rect = el.getBoundingClientRect();
                e.dataTransfer.setDragImage(el, rect.width / 2, rect.height / 2);
                setTimeout(() => document.body.removeChild(el), 0);
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
