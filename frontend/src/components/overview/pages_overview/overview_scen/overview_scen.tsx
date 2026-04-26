import { JSX, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./overview_scen.scss";
import { MM_overview_scen_div_one } from "./MM_overview_scen_div_one/MM_overview_scen_div_one";
import { MM_overview_scen_component } from "./MM_overview_scen_component/MM_overview_scen_component";
import { MM_overview_scen_div_two } from "./MM_overview_scen_div_two/MM_overview_scen_div_two";
import { useProjects } from "../../../../context/ProjectsContext";
import { useWorkflows, Workflow } from "../../../../context/WorkflowsContext";

interface WorkflowWithProject extends Workflow {
  projectName: string;
}

export function Overview_scen(): JSX.Element {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { getProjectWorkflows } = useWorkflows();
  const [sortBy, setSortBy] = useState<string>("");
  const [allWorkflows, setAllWorkflows] = useState<WorkflowWithProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllWorkflows = async () => {
      if (projects.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const workflowsPromises = projects.map(async (project) => {
          try {
            const workflows = await getProjectWorkflows(project.id);
            return workflows.map((workflow) => ({
              ...workflow,
              projectName: project.name,
            }));
          } catch (error) {
            console.error(`Failed to load workflows for project ${project.id}:`, error);
            return [];
          }
        });

        const workflowsArrays = await Promise.all(workflowsPromises);
        const flatWorkflows = workflowsArrays.flat();
        setAllWorkflows(flatWorkflows);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAllWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "менее часа";
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "час" : "часов"}`;
    return `${diffDays} ${diffDays === 1 ? "день" : "дней"}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const sortWorkflows = (a: WorkflowWithProject, b: WorkflowWithProject) => {
    switch (sortBy) {
      case "Name":
        return a.name.localeCompare(b.name);
      case "Creation date":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "Update date":
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      default:
        return 0;
    }
  };

  const sortedWorkflows = useMemo(() => {
    if (!sortBy) return allWorkflows;
    return [...allWorkflows].sort(sortWorkflows);
  }, [sortBy, allWorkflows]);

  if (isLoading) {
    return (
      <div className="MM_overview_scen">
        <div>Загрузка сценариев...</div>
      </div>
    );
  }

  return (
    <div className="MM_overview_scen">
      <MM_overview_scen_div_one
        placeholder="Поиск"
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      {sortedWorkflows.map((workflow) => (
        <div
          key={workflow.id}
          onClick={() => navigate(`/projects/${workflow.projectId}/workflows/${workflow.id}`)}
          style={{ cursor: "pointer" }}
        >
          <MM_overview_scen_component
            name={workflow.name}
            last_update={formatTimeAgo(workflow.updatedAt)}
            data_created={formatDate(workflow.createdAt)}
            projectName={workflow.projectName}
          />
        </div>
      ))}
      <MM_overview_scen_div_two count={sortedWorkflows.length.toString()} current_page="1" />
    </div>
  );
}
