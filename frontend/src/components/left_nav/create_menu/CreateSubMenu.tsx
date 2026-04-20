import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CreateMenuItem } from "./CreateMenuItem";
import "./CreateMenu.scss";

interface CreateSubMenuProps {
  title: "Сценарии" | "Учётные данные";
  onClose: () => void;
  ignoreRefs?: Array<React.RefObject<HTMLElement | null>>;
}

export function CreateSubMenu({
  title,
  onClose,
  ignoreRefs = [],
}: CreateSubMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        ignoreRefs.some((ref) => ref.current && ref.current.contains(target))
      ) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ignoreRefs, onClose]);

  const handleOverview = () => {
    navigate(title === "Сценарии" ? "/overview/scenario" : "/overview/credentials");
    onClose();
  };

  const handlePersonal = () => {
    navigate(title === "Сценарии" ? "/personal/scenario" : "/personal/credentials");
    onClose();
  };

  return (
    <div className="create-submenu" ref={menuRef}>
      <CreateMenuItem label="Обзоывфр" onClick={handleOverview} />
      <CreateMenuItem label="Личное" onClick={handlePersonal} />
    </div>
  );
}
