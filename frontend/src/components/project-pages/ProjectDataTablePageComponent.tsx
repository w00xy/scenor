import { JSX } from "react";
import { ProjectEmptyState } from "./project_empty_state/ProjectEmptyState";
import { useCurrentUsername } from "../../hooks/useCurrentUsername";

export function ProjectDataTablePageComponent(): JSX.Element {
  const username = useCurrentUsername();

  return (
    <ProjectEmptyState
      title={`${username},`}
      subtitle="давайте настроим таблицу данных"
      description="Используйте таблицы данных для сохранения результатов выполнения, обмена данными между рабочими процессами и отслеживания метрик для оценки."
      actionText="Создать первую таблицу данных"
    />
  );
}
