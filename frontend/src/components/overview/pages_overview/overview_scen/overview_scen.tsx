import { JSX, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./overview_scen.scss";
import { MM_overview_scen_div_one } from "./MM_overview_scen_div_one/MM_overview_scen_div_one";
import { MM_overview_scen_component } from "./MM_overview_scen_component/MM_overview_scen_component";
import { MM_overview_scen_div_two } from "./MM_overview_scen_div_two/MM_overview_scen_div_two";
import { useProjects } from "../../../../context/ProjectsContext";
import { useWorkflows, Workflow } from "../../../../context/WorkflowsContext";
import { workflowApi } from "../../../../services/api";

interface WorkflowWithProject extends Workflow {
  projectName: string;
}

const ITEMS_PER_PAGE = 5;

export function Overview_scen(): JSX.Element {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { getProjectWorkflows } = useWorkflows();
  const [sortBy, setSortBy] = useState<string>("");
  const [searchValue, setSearchValue] = useState<string>("");
  const [allWorkflows, setAllWorkflows] = useState<WorkflowWithProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredAndSortedWorkflows = useMemo(() => {
    let result = allWorkflows;

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
  }, [allWorkflows, searchValue, sortBy]);

  // Пагинация
  const totalPages = Math.ceil(filteredAndSortedWorkflows.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedWorkflows = filteredAndSortedWorkflows.slice(startIndex, endIndex);

  // Сброс на первую страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, sortBy]);

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот сценарий?")) {
      return;
    }

    try {
      await workflowApi.deleteWorkflow(workflowId);
      // Обновляем список после удаления
      setAllWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
    } catch (error) {
      console.error("Failed to delete workflow:", error);
      alert("Не удалось удалить сценарий");
    }
  };

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
        searchValue={searchValue}
        onSearchChange={setSearchValue}
      />
      {paginatedWorkflows.map((workflow) => (
        <div key={workflow.id}>
          <MM_overview_scen_component
            name={workflow.name}
            last_update={formatTimeAgo(workflow.updatedAt)}
            data_created={formatDate(workflow.createdAt)}
            projectName={workflow.projectName}
            workflowId={workflow.id}
            onOpen={() => navigate(`/projects/${workflow.projectId}/workflows/${workflow.id}`)}
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
    </div>
  );
}
