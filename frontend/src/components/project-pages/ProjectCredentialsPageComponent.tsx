import { JSX } from "react";
import { ProjectEmptyState } from "./project_empty_state/ProjectEmptyState";
import { useCurrentUsername } from "../../hooks/useCurrentUsername";

export function ProjectCredentialsPageComponent(): JSX.Element {
  const username = useCurrentUsername();

  return (
    <ProjectEmptyState
      title={`${username},`}
      subtitle="давайте настроим учётные данные"
      description="Учетные данные позволяют рабочим процессам взаимодействовать с вашими приложениями и сервисами."
      actionText="Добавить первый учётный параметр"
    />
  );
}
