import { JSX, ReactNode, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LNBody } from "../../left_nav/left_nav_body/left_nav_body";
import { LNTDiv } from "../../left_nav/left_nav_top_div/Left_nav_top_div";
import { HorRule } from "../../left_nav/left_nav_hr/HorRule";
import { LNav } from "../../left_nav/left_nav_btns/left_nav_btns";
import { MainMenuBody } from "../../overview/main_menu_overview/MainMenuBody/MainMenuBody";
import { MMTS_div_three } from "../../overview/main_menu_overview/main_menu_top_section/MMTS_div_three/MMTS_div_three";
import { useWorkflows } from "../../../context/WorkflowsContext";

interface ProjectLayoutProps {
  projectId: string | null;
  projectName?: string;
  projectSubtitle?: ReactNode;
  isLoading: boolean;
  showActionButton?: boolean;
  className: string;
  onProjectNotFound?: () => void;
}

export function ProjectLayout({
  projectId,
  projectName,
  projectSubtitle,
  isLoading,
  showActionButton = true,
  className,
  onProjectNotFound,
}: ProjectLayoutProps): JSX.Element {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { createWorkflow, getProjectWorkflows } = useWorkflows();
  const [isCreating, setIsCreating] = useState(false);

  if (isLoading) {
    return <div className={className}>Загрузка проекта...</div>;
  }

  if (!projectId) {
    if (onProjectNotFound) {
      onProjectNotFound();
    }
    return <Navigate to="/overview/scenario" replace />;
  }

  const getActionText = () => {
    if (pathname.endsWith("/credentials")) return "Добавить данные";
    if (pathname.endsWith("/history")) return "Создать сценарий";
    if (pathname.endsWith("/data-table")) return "Создать таблицу";
    if (pathname.endsWith("/settings")) return "";
    return "Создать сценарий";
  };

  const handleCreateScenario = async () => {
    if (!projectId || isCreating) return;

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
    } catch (error) {
      console.error("Failed to create workflow:", error);
      alert("Не удалось создать сценарий");
    } finally {
      setIsCreating(false);
    }
  };

  const shouldShowButton = showActionButton && !pathname.endsWith("/settings");

  return (
    <div className={className}>
      <LNBody>
        <LNTDiv />
        <HorRule />
        <LNav />
      </LNBody>

      <div className={`${className}__main`}>
        <MainMenuBody>
          <div className={`${className}__header`}>
            <div className={`${className}__copy`}>
              <p className={`${className}__title`}>{projectName || "Проект"}</p>
              {projectSubtitle && (
                <p className={`${className}__subtitle`}>{projectSubtitle}</p>
              )}
            </div>
            {shouldShowButton && (
              <button
                type="button"
                className={`${className}__action`}
                onClick={pathname.endsWith("/scenario") ? handleCreateScenario : () => navigate(`/projects/${projectId}/scenario`)}
                disabled={isCreating}
              >
                {isCreating ? "Создание..." : getActionText()}
              </button>
            )}
          </div>

          <MMTS_div_three projectId={projectId || undefined} />
          <div className={`${className}__content`}>
            <Outlet />
          </div>
        </MainMenuBody>
      </div>
    </div>
  );
}
