import { JSX, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { HistoryTableRow } from "./HistoryTableRow";
import { workflowApi } from "../../services/api";
import "./ProjectHistoryPageComponent.scss";

interface Execution {
  id: string;
  workflowId: string;
  startedByUserId: string;
  triggerType: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  inputDataJson: any;
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
              <input type="checkbox" className="history-table__checkbox" />
            </th>
            <th>Сценарий</th>
            <th>Статус</th>
            <th>Начало</th>
            <th>Время выполнения</th>
            <th>Exec. id</th>
            <th>Способ</th>
            <th></th>
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
                scenarioName={workflows.get(execution.workflowId)?.name || "Неизвестный сценарий"}
                status={getStatusText(execution.status)}
                startTime={formatDate(execution.startedAt)}
                executionTime={calculateDuration(execution.startedAt, execution.finishedAt)}
                execId={execution.id.slice(0, 8)}
                method={getTriggerTypeText(execution.triggerType)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
