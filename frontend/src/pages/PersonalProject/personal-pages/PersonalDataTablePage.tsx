import { JSX } from "react";
import "../PersonalProject.scss";

export function PersonalDataTablePage(): JSX.Element {
  return (
    <section className="personal-page">
      <h2 className="personal-page__title">Таблица данных</h2>
      <p className="personal-page__text">
        Раздел для личных таблиц и наборов данных, которые используются в
        сценариях.
      </p>
    </section>
  );
}
