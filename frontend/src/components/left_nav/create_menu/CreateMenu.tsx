import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import VectorTwoIcon from "../../../assets/MM_Vectors-pages/Vector_Two.svg?react";
import { CreateMenuItem } from "./CreateMenuItem";
import { CreateSubMenu } from "./CreateSubMenu";
import "./CreateMenu.scss";

interface CreateMenuProps {
  onClose: () => void;
  ignoreRef?: React.RefObject<HTMLElement | null>;
  collapsed?: boolean;
}

export function CreateMenu({
  onClose,
  ignoreRef,
  collapsed,
}: CreateMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const scenariosButtonRef = useRef<HTMLDivElement>(null);
  const credentialsButtonRef = useRef<HTMLDivElement>(null);
  const [openSubmenu, setOpenSubmenu] = useState<
    "scenarios" | "credentials" | null
  >(null);
  const navigate = useNavigate();
  const positionClass = collapsed
    ? "create-menu--right"
    : "create-menu--bottom";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (ignoreRef?.current && ignoreRef.current.contains(target)) {
        return;
      }

      if (
        scenariosButtonRef.current &&
        scenariosButtonRef.current.contains(target)
      ) {
        return;
      }

      if (
        credentialsButtonRef.current &&
        credentialsButtonRef.current.contains(target)
      ) {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ignoreRef, onClose]);
  const handleProjects = () => {
    navigate("/personal");
    onClose();
  };

  return (
    <div className={`create-menu ${positionClass}`} ref={menuRef}>
        <div ref={scenariosButtonRef}>
          <CreateMenuItem
            icon={<VectorTwoIcon />}
            label="Сценарии"
            active={openSubmenu === "scenarios"}
            rotated={openSubmenu === "scenarios"}
            onClick={() =>
              setOpenSubmenu((prev) =>
                prev === "scenarios" ? null : "scenarios",
              )
            }
          />
        </div>
        <div ref={credentialsButtonRef}>
          <CreateMenuItem
            icon={<VectorTwoIcon />}
            label="Учётные данные"
            active={openSubmenu === "credentials"}
            rotated={openSubmenu === "credentials"}
            onClick={() =>
              setOpenSubmenu((prev) =>
                prev === "credentials" ? null : "credentials",
              )
            }
          />
        </div>
        <CreateMenuItem label="Проекты" onClick={handleProjects} />
      {openSubmenu === "scenarios" && (
        <CreateSubMenu
          title="Сценарии"
          onClose={onClose}
          ignoreRefs={[
            ignoreRef ?? { current: null },
            menuRef,
            scenariosButtonRef,
            credentialsButtonRef,
          ]}
        />
      )}

      {openSubmenu === "credentials" && (
        <CreateSubMenu
          title="Учётные данные"
          onClose={onClose}
          ignoreRefs={[
            ignoreRef ?? { current: null },
            menuRef,
            scenariosButtonRef,
            credentialsButtonRef,
          ]}
        />
      )}
    </div>
  );
}
