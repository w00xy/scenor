import { JSX } from "react";
import { ProjectEmptyState } from "../../../components/project_empty_state/ProjectEmptyState";
import { useCurrentUsername } from "../../../hooks/useCurrentUsername";
import "../PersonalProject.scss";

export function PersonalScenariosPage(): JSX.Element {
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
