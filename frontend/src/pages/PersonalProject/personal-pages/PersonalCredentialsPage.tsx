import { JSX } from "react";
import "../PersonalProject.scss";

export function PersonalCredentialsPage(): JSX.Element {
  return (
    <section className="personal-page">
      <h2 className="personal-page__title">Учётные данные</h2>
      <p className="personal-page__text">
        В этом разделе будут ваши личные учётные данные для подключений и
        сервисов.
      </p>
    </section>
  );
}
