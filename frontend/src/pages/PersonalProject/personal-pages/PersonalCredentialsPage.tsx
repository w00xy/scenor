import { JSX } from "react";
import { ProjectEmptyState } from "../../../components/project_empty_state/ProjectEmptyState";
import { useCurrentUsername } from "../../../hooks/useCurrentUsername";
import "../PersonalProject.scss";

export function PersonalCredentialsPage(): JSX.Element {
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
