import { JSX } from "react";
import { ProjectScenariosPageComponent } from "../components/project-pages/ProjectScenariosPageComponent";
import { ProjectCredentialsPageComponent } from "../components/project-pages/ProjectCredentialsPageComponent";
import { ProjectHistoryPageComponent } from "../components/project-pages/ProjectHistoryPageComponent";
import { ProjectDataTablePageComponent } from "../components/project-pages/ProjectDataTablePageComponent";

type PageType = "scenario" | "credentials" | "history" | "data-table";

interface ProjectPageRouterProps {
  pageType: PageType;
}

export function ProjectPageRouter({ pageType }: ProjectPageRouterProps): JSX.Element {
  switch (pageType) {
    case "scenario":
      return <ProjectScenariosPageComponent />;
    case "credentials":
      return <ProjectCredentialsPageComponent />;
    case "history":
      return <ProjectHistoryPageComponent />;
    case "data-table":
      return <ProjectDataTablePageComponent />;
  }
}
