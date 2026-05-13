import { JSX, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HistoryTableRow } from "./HistoryTableRow";
import { workflowApi } from "../../services/api";
import MM_DotsSVG from "../../assets/common/Dots.svg?react";
import "./ProjectHistoryPageComponent.scss";

interface Execution {
  id: string;
  workflowId: string;
  startedByUserId: string;
  triggerType: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputDataJson: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  outputDataJson: any;
  errorMessage: string | null;
}

interface Workflow {
  id: string;
  name: string;
}

export function ProjectHistoryPageComponent(): JSX.Element {
  const { projectId } = useParams<{ projectId: string }>();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [workflows, setWorkflows] = useState<Map<string, Workflow>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExecutions, setSelectedExecutions] = useState<Set<string>>(new Set());
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [headerMenuPosition, setHeaderMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const loadExecutions = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        
        // Загружаем все workflow проекта
        const projectWorkflows = await workflowApi.getProjectWorkflows(projectId);
        const workflowsMap = new Map(projectWorkflows.map(w => [w.id, w]));
        setWorkflows(workflowsMap);

        // Загружаем executions для каждого workflow
        const allExecutions: Execution[] = [];
        for (const workflow of projectWorkflows) {
          try {
            const workflowExecutions = await workflowApi.getExecutions(workflow.id, { limit: 50, offset: 0 });
            allExecutions.push(...workflowExecutions);
          } catch (error) {
            console.error(`Failed to load executions for workflow ${workflow.id}:`, error);
          }
        }

        // Сортируем по дате (новые сверху)
        allExecutions.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
        setExecutions(allExecutions);
      } catch (error) {
        console.error("Failed to load executions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExecutions();
  }, [projectId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const calculateDuration = (startedAt: string, finishedAt: string | null) => {
    if (!finishedAt) return "выполняется...";
    const start = new Date(startedAt).getTime();
    const end = new Date(finishedAt).getTime();
    const duration = end - start;
    
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success":
        return "Успешно";
      case "error":
        return "Ошибка";
      case "running":
        return "Выполняется";
      default:
        return status;
    }
  };

  const getTriggerTypeText = (triggerType: string) => {
    switch (triggerType) {
      case "manual":
        return "Manual";
      case "webhook":
        return "Webhook";
      case "schedule":
        return "Schedule";
      default:
        return triggerType;
    }
  };

  const handleSelectAll = () => {
    if (selectedExecutions.size === executions.length) {
      setSelectedExecutions(new Set());
    } else {
      setSelectedExecutions(new Set(executions.map(e => e.id)));
    }
  };

  const handleSelectExecution = (executionId: string) => {
    const newSelected = new Set(selectedExecutions);
    if (newSelected.has(executionId)) {
      newSelected.delete(executionId);
    } else {
      newSelected.add(executionId);
    }
    setSelectedExecutions(newSelected);
  };

  const handleHeaderDotsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setHeaderMenuPosition({
      top: rect.bottom + 4,
      left: rect.right - 150,
    });
    setShowHeaderMenu(!showHeaderMenu);
  };

  const handleDeleteSelected = async () => {
    if (selectedExecutions.size === 0) return;
    
    if (!confirm(`Вы уверены, что хотите удалить ${selectedExecutions.size} выполнений?`)) {
      return;
    }

    try {
      console.warn("Deleting executions:", Array.from(selectedExecutions));
      
      setExecutions(executions.filter(e => !selectedExecutions.has(e.id)));
      setSelectedExecutions(new Set());
      setShowHeaderMenu(false);
    } catch (error) {
      console.error("Failed to delete executions:", error);
      alert("Не удалось удалить выполнения");
    }
  };

  if (isLoading) {
    return (
      <div className="history-table">
        <div className="history-table__loading">Загрузка истории выполнений...</div>
      </div>
    );
  }

  return (
    <div className="history-table">
      <table className="history-table__table">
        <thead>
          <tr className="history-table__header-row">
            <th>
              <input 
                type="checkbox" 
                className="history-table__checkbox"
                checked={selectedExecutions.size === executions.length && executions.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>Сценарий</th>
            <th>Статус</th>
            <th>Начало</th>
            <th>Время выполнения</th>
            <th>Exec. id</th>
            <th>Способ</th>
            <th>
              <div 
                className="history-table__header-dots"
                onClick={handleHeaderDotsClick}
              >
                <MM_DotsSVG />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {executions.length === 0 ? (
            <tr>
              <td colSpan={8} className="history-table__empty">
                Нет выполнений для отображения
              </td>
            </tr>
          ) : (
            executions.map((execution) => (
              <HistoryTableRow
                key={execution.id}
                executionId={execution.id}
                scenarioName={workflows.get(execution.workflowId)?.name || "Неизвестный сценарий"}
                status={getStatusText(execution.status)}
                startTime={formatDate(execution.startedAt)}
                executionTime={calculateDuration(execution.startedAt, execution.finishedAt)}
                execId={execution.id.slice(0, 8)}
                method={getTriggerTypeText(execution.triggerType)}
                isSelected={selectedExecutions.has(execution.id)}
                onSelect={() => handleSelectExecution(execution.id)}
              />
            ))
          )}
        </tbody>
      </table>

      {showHeaderMenu && (
        <div 
          className="history-table__header-menu"
          style={{ top: `${headerMenuPosition.top}px`, left: `${headerMenuPosition.left}px` }}
        >
          <button 
            className="history-table__menu-item"
            onClick={handleDeleteSelected}
            disabled={selectedExecutions.size === 0}
          >
            Удалить выбранные ({selectedExecutions.size})
          </button>
        </div>
      )}

      {showHeaderMenu && (
        <div 
          className="history-table__overlay"
          onClick={() => setShowHeaderMenu(false)}
        />
      )}
    </div>
  );
}
