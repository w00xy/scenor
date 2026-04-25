import { JSX } from "react";
import { ProjectEmptyState } from "./project_empty_state/ProjectEmptyState";
import { useCurrentUsername } from "../../hooks/useCurrentUsername";

export function ProjectScenariosPageComponent(): JSX.Element {
  const username = useCurrentUsername();

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
