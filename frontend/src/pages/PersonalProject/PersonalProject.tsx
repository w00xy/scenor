import { JSX } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useProjects } from "../../hooks/useProjectsContext";
import { ProjectLayout } from "../../components/shared/ProjectLayout/ProjectLayout";
import "./PersonalProject.scss";

export function PersonalProject(): JSX.Element {
  const { projectId } = useParams<{ projectId: string }>();
  const { isLoading, personalProjectId } = useProjects();

  if (projectId && projectId !== personalProjectId) {
    return <Navigate to={`/projects/${personalProjectId}/scenario`} replace />;
  }

  return (
    <ProjectLayout
      projectId={personalProjectId}
      projectName="Личный проект"
      projectSubtitle="Ваши личные сценарии, учётные данные и история операций."
      isLoading={isLoading}
      showActionButton={true}
      className="personal-project"
    />
  );
}
