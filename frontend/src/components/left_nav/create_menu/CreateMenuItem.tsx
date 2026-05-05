import React from "react";
import "./CreateMenu.scss";

interface CreateMenuItemProps {
  icon?: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  rotated?: boolean;
  disabled?: boolean;
}

export function CreateMenuItem({
  icon,
  label,
  onClick,
  active = false,
  rotated = false,
  disabled = false,
}: CreateMenuItemProps) {
  return (
    <button
      type="button"
      className={`create-menu__item ${active ? "active" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="create-menu__item-content">
        <span className="create-menu__label">{label}</span>
        {icon && (
          <span className={`create-menu__icon ${rotated ? "rotated" : ""}`}>
            {icon}
          </span>
        )}
      </div>
    </button>
  );
}
