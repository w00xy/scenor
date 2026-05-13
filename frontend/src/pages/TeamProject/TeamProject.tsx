import { JSX } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useProjects } from "../../hooks/useProjectsContext";
import { ProjectLayout } from "../../components/shared/ProjectLayout/ProjectLayout";
import "./TeamProject.scss";

export function TeamProject(): JSX.Element {
  const { projectId } = useParams<{ projectId: string }>();
  const { isLoading, teamProjects } = useProjects();

  const currentProject = teamProjects.find((p) => p.id === projectId);

  if (!isLoading && !currentProject) {
    return <Navigate to="/overview/scenario" replace />;
  }

  return (
    <ProjectLayout
      projectId={projectId || null}
      projectName={currentProject?.name}
      isLoading={isLoading}
      showActionButton={true}
      className="team-project"
    />
  );
}
