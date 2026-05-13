import { JSX } from "react";
import { useParams } from "react-router-dom";
import { useProjects } from "../hooks/useProjectsContext";
import { PersonalProject } from "./PersonalProject/PersonalProject";
import { TeamProject } from "./TeamProject/TeamProject";

export function ProjectRouter(): JSX.Element {
  const { projectId } = useParams<{ projectId: string }>();
  const { personalProjectId, teamProjects } = useProjects();

  const isPersonalProject = projectId === personalProjectId;
  const isTeamProject = teamProjects.some((p) => p.id === projectId);

  if (isPersonalProject) {
    return <PersonalProject />;
  }

  if (isTeamProject) {
    return <TeamProject />;
  }

  return <div>Проект не найден</div>;
}
