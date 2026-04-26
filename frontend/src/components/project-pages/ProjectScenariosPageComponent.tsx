import { JSX, useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProjectEmptyState } from "./project_empty_state/ProjectEmptyState";
import { useCurrentUsername } from "../../hooks/useCurrentUsername";
import { useWorkflows, Workflow } from "../../context/WorkflowsContext";
import { useProjects } from "../../context/ProjectsContext";
import { MM_overview_scen_component } from "../overview/pages_overview/overview_scen/MM_overview_scen_component/MM_overview_scen_component";
import { MM_overview_scen_div_one } from "../overview/pages_overview/overview_scen/MM_overview_scen_div_one/MM_overview_scen_div_one";
import { MM_overview_scen_div_two } from "../overview/pages_overview/overview_scen/MM_overview_scen_div_two/MM_overview_scen_div_two";

export function ProjectScenariosPageComponent(): JSX.Element {
  const username = useCurrentUsername();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { getProjectWorkflows } = useWorkflows();
  const { projects } = useProjects();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");

  const currentProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    const loadWorkflows = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        const loadedWorkflows = await getProjectWorkflows(projectId);
        setWorkflows(loadedWorkflows);
      } catch (error) {
        console.error("Failed to load workflows:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

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

  const sortWorkflows = (a: Workflow, b: Workflow) => {
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

  const filteredAndSortedWorkflows = useMemo(() => {
    let result = workflows;

    // Фильтрация по поиску
    if (searchValue.trim()) {
      result = result.filter((workflow) =>
        workflow.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Сортировка
    if (sortBy) {
      result = [...result].sort(sortWorkflows);
    }

    return result;
  }, [workflows, searchValue, sortBy]);

  if (isLoading) {
    return (
      <section className="personal-scenarios">
        <div>Загрузка сценариев...</div>
      </section>
    );
  }

  if (workflows.length === 0) {
    return (
      <section className="personal-scenarios">
        <ProjectEmptyState
          title={`${username},`}
          subtitle="давайте создадим первый сценарий."
          description="Этот контейнер можно временно использовать для сценариев, пока наполнение страницы ещё не подключено."
          actionText="Создать первый сценарий"
        />
      </section>
    );
  }

  return (
    <section className="personal-scenarios">
      <MM_overview_scen_div_one
        placeholder="Поиск"
        sortBy={sortBy}
        onSortChange={setSortBy}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
      {filteredAndSortedWorkflows.map((workflow) => (
        <div
          key={workflow.id}
          onClick={() => navigate(`/projects/${projectId}/workflows/${workflow.id}`)}
          style={{ cursor: "pointer" }}
        >
          <MM_overview_scen_component
            name={workflow.name}
            last_update={formatTimeAgo(workflow.updatedAt)}
            data_created={formatDate(workflow.createdAt)}
            projectName={currentProject?.name || "Проект"}
          />
        </div>
      ))}
      <MM_overview_scen_div_two count={filteredAndSortedWorkflows.length.toString()} current_page="1" />
    </section>
  );
}
