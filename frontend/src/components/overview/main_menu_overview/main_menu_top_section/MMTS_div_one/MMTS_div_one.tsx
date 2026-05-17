import React, { JSX, useState } from "react";
import "./MMTS_div_one.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useProjects } from "../../../../../context/ProjectsContext";
import { useWorkflows } from "../../../../../context/WorkflowsContext";

interface MMTS_div_oneProps{
    text: string;
}

export function MMTS_div_one({ text }: MMTS_div_oneProps): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { personalProjectId } = useProjects();
  const { createWorkflow, getProjectWorkflows } = useWorkflows();
  const [isCreating, setIsCreating] = useState(false);
  const isCredentialsPage = location.pathname === '/overview/credentials';

  const handleClick = async () => {
    if (isCredentialsPage) {
      window.dispatchEvent(new CustomEvent('open-credential-form'));
      return;
    }

    if (!personalProjectId) {
      alert("Личный проект не найден");
      return;
    }

    setIsCreating(true);
    try {
      const existingWorkflows = await getProjectWorkflows(personalProjectId);
      const workflowNumber = existingWorkflows.length + 1;
      
      const newWorkflow = await createWorkflow(personalProjectId, {
        name: `Сценарий №${workflowNumber}`,
        description: "",
        status: "draft",
        isPublic: false,
      });
      navigate(`/projects/${personalProjectId}/workflows/${newWorkflow.id}`);
    } catch (error) {
      console.error("Failed to create workflow:", error);
      alert("Не удалось создать сценарий");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="MMTS_div_one">
      <div className="MMTS_div_one_txt">
        <p className="a1">Обзор</p>
        <p>Все сценарии, учетные данные и таблицы данных, к которым у вас есть доступ.</p>
      </div>
      <button className="module_call" onClick={handleClick} disabled={isCreating}>
        {isCreating ? "Создание..." : text}
      </button>
    </div>
  );
}
