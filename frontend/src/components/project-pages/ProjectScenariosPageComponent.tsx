import { JSX, useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProjectEmptyState } from "./project_empty_state/ProjectEmptyState";
import { useCurrentUsername } from "../../hooks/useCurrentUsername";
import { useWorkflows, Workflow } from "../../context/WorkflowsContext";
import { useProjects } from "../../hooks/useProjectsContext";
import { MM_overview_scen_component } from "../overview/pages_overview/overview_scen/MM_overview_scen_component/MM_overview_scen_component";
import { MM_overview_scen_div_one } from "../overview/pages_overview/overview_scen/MM_overview_scen_div_one/MM_overview_scen_div_one";
import { MM_overview_scen_div_two } from "../overview/pages_overview/overview_scen/MM_overview_scen_div_two/MM_overview_scen_div_two";
import { workflowApi } from "../../services/api";
import { formatTimeAgo } from "../../utils/timeFormat";

const ITEMS_PER_PAGE = 5;

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
  const [currentPage, setCurrentPage] = useState(1);

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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  };

  const filteredAndSortedWorkflows = useMemo(() => {
    let result = workflows;

    if (searchValue.trim()) {
      result = result.filter((workflow) =>
        workflow.name.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    if (sortBy) {
      result = [...result].sort((a, b) => {
        switch (sortBy) {
          case "Name":
            return a.name.localeCompare(b.name);
          case "Creation date":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "Update date":
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          default:
            return 0;
        }
      });
    }

    return result;
  }, [workflows, searchValue, sortBy]);

  const totalPages = Math.ceil(filteredAndSortedWorkflows.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedWorkflows = filteredAndSortedWorkflows.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, sortBy]);

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот сценарий?")) {
      return;
    }

    try {
      await workflowApi.deleteWorkflow(workflowId);
      setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
    } catch (error) {
      console.error("Failed to delete workflow:", error);
      alert("Не удалось удалить сценарий");
    }
  };

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
      {paginatedWorkflows.map((workflow) => (
        <div key={workflow.id}>
          <MM_overview_scen_component
            name={workflow.name}
            last_update={formatTimeAgo(workflow.updatedAt)}
            data_created={formatDate(workflow.createdAt)}
            projectName={currentProject?.name || "Проект"}
            workflowId={workflow.id}
            onOpen={() => navigate(`/projects/${projectId}/workflows/${workflow.id}`)}
            onDelete={() => handleDeleteWorkflow(workflow.id)}
          />
        </div>
      ))}
      <MM_overview_scen_div_two 
        count={filteredAndSortedWorkflows.length} 
        currentPage={currentPage}
        totalPages={totalPages || 1}
        onPageChange={setCurrentPage}
      />
    </section>
  );
}
