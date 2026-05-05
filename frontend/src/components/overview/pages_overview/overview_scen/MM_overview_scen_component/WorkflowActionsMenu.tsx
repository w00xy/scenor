import { JSX, useEffect, useRef } from "react";
import "./WorkflowActionsMenu.scss";

interface WorkflowActionsMenuProps {
  onOpen: () => void;
  onShare: () => void;
  onDelete: () => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export function WorkflowActionsMenu({
  onOpen,
  onShare,
  onDelete,
  onClose,
  position,
}: WorkflowActionsMenuProps): JSX.Element {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="workflow-actions-menu"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <button className="workflow-actions-menu__item" onClick={onOpen}>
        Открыть
      </button>
      <button className="workflow-actions-menu__item" onClick={onShare}>
        Поделиться
      </button>
      <button className="workflow-actions-menu__item workflow-actions-menu__item--delete" onClick={onDelete}>
        Удалить
      </button>
    </div>
  );
}
