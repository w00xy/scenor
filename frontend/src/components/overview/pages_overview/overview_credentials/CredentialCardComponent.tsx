import { JSX, useState, useRef, useEffect } from 'react';
import './CredentialCardComponent.scss';
import DotsSVG from '../../../../assets/common/Dots.svg?react';
import PersonalGray from '../../../../assets/navigation/PersonalGray.svg?react';

interface CredentialCardComponentProps {
  name: string;
  type: string;
  projectName: string;
  createdAt: string;
  onDelete: () => void;
}

const typeLabels: Record<string, string> = {
  api_key: 'API Key',
  basic_auth: 'Basic Auth',
  oauth: 'OAuth',
};

export function CredentialCardComponent({
  name,
  type,
  projectName,
  createdAt,
  onDelete,
}: CredentialCardComponentProps): JSX.Element {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const dotsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleDotsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (dotsRef.current) {
      const rect = dotsRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.right - 110 });
    }
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

  const handleDelete = () => { onDelete(); setShowMenu(false); };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня",
      "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  return (
    <div className="credential-card">
      <div className="credential-card__left">
        <h1>{name}</h1>
        <p>
          <span className="credential-card__type-badge">{typeLabels[type] || type}</span>
          Создано {formatDate(createdAt)}
        </p>
      </div>
      <div className="credential-card__right">
        <div>
          <PersonalGray />
          <p>{projectName}</p>
        </div>
        <div ref={dotsRef} onClick={handleDotsClick} className="dots-button">
          <DotsSVG />
        </div>
      </div>
      {showMenu && (
        <div ref={menuRef} className="workflow-actions-menu" style={{ top: menuPos.top, left: menuPos.left }}>
          <button className="workflow-actions-menu__item workflow-actions-menu__item--delete" onClick={handleDelete}>
            Удалить
          </button>
        </div>
      )}
    </div>
  );
}
