import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../../context/ProjectsContext";
import VectorTwoIcon from "../../../assets/navigation/VectorTwo.svg?react";
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
  const { personalProjectId, createProject, teamProjects } = useProjects();
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
  const handleProjects = async () => {
    try {
      const projectNumbers = teamProjects
        .map((p) => {
          const match = p.name.match(/^Проект №(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((num) => num > 0);

      const nextNumber = projectNumbers.length > 0 ? Math.max(...projectNumbers) + 1 : 1;
      const newProject = await createProject(`Проект №${nextNumber}`, "");
      navigate(`/projects/${newProject.id}`);
      onClose();
    } catch (error) {
      console.error("Failed to create project:", error);
    }
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
        <CreateMenuItem label="Проект" onClick={handleProjects} />
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
          parentRef={scenariosButtonRef}
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
          parentRef={credentialsButtonRef}
        />
      )}
    </div>
  );
}
