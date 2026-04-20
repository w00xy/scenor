import { JSX } from "react";
import "../PersonalProject.scss";

export function PersonalHistoryPage(): JSX.Element {
  return (
    <section className="personal-page">
      <h2 className="personal-page__title">История операций</h2>
      <p className="personal-page__text">
        Здесь будет журнал ваших запусков и операций по личным сценариям.
      </p>
    </section>
  );
}
