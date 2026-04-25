import { JSX } from "react";
import "../../pages/PersonalProject/personal-pages/PersonalHistoryPage.scss";
import { HistoryTableRow } from "./HistoryTableRow";

export function ProjectHistoryPageComponent(): JSX.Element {
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
          <HistoryTableRow
            scenarioName="Мой сценарий 2"
            status="Успешно"
            startTime="Mar 22, 14:08:41"
            executionTime="32ms"
            execId={5}
            method="Manual"
          />
        </tbody>
      </table>
    </div>
  );
}
