import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../../context/ProjectsContext";
import { useWorkflows } from "../../../context/WorkflowsContext";
import { CreateMenuItem } from "./CreateMenuItem";
import "./CreateMenu.scss";

interface CreateSubMenuProps {
  title: "Сценарии" | "Учётные данные";
  onClose: () => void;
  ignoreRefs?: Array<React.RefObject<HTMLElement | null>>;
  parentRef?: React.RefObject<HTMLElement | null>;
}

export function CreateSubMenu({
  title,
  onClose,
  ignoreRefs = [],
  parentRef,
}: CreateSubMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { personalProjectId, teamProjects } = useProjects();
  const { createWorkflow, getProjectWorkflows } = useWorkflows();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [topOffset, setTopOffset] = useState(0);

  useEffect(() => {
    if (parentRef?.current && menuRef.current) {
      const parentRect = parentRef.current.getBoundingClientRect();
      const menuRect = menuRef.current.getBoundingClientRect();
      
      // Вычисляем смещение чтобы выровнять по верхнему краю родителя
      setTopOffset(parentRect.top - menuRect.top);
    }
  }, [parentRef]);

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

  const handleCreateScenario = async (projectId: string) => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const existingWorkflows = await getProjectWorkflows(projectId);
      const workflowNumber = existingWorkflows.length + 1;
      
      const workflow = await createWorkflow(projectId, {
        name: `Сценарий №${workflowNumber}`,
        description: "",
        status: "draft",
        isPublic: false,
      });
      
      navigate(`/projects/${projectId}/workflows/${workflow.id}`);
      onClose();
    } catch (error) {
      console.error("Failed to create workflow:", error);
      alert("Не удалось создать сценарий");
    } finally {
      setIsCreating(false);
    }
  };

  const handlePersonal = () => {
    if (!personalProjectId) {
      return;
    }

    if (title === "Сценарии") {
      handleCreateScenario(personalProjectId);
    } else {
      navigate(`/projects/${personalProjectId}/credentials`);
      onClose();
    }
  };

  const handleTeamProject = (projectId: string) => {
    if (title === "Сценарии") {
      handleCreateScenario(projectId);
    } else {
      navigate(`/projects/${projectId}/credentials`);
      onClose();
    }
  };

  return (
    <div 
      className="create-submenu" 
      ref={menuRef}
      style={{ top: `${topOffset}px` }}
    >
      <div className="create-submenu__header">Создать в</div>
      <CreateMenuItem 
        label="Личный" 
        onClick={handlePersonal}
        disabled={isCreating}
      />
      {teamProjects.map((project) => (
        <CreateMenuItem
          key={project.id}
          label={project.name}
          onClick={() => handleTeamProject(project.id)}
          disabled={isCreating}
        />
      ))}
    </div>
  );
}
