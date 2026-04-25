import { JSX } from "react";
import IconDots from "../../assets/MM_Vectors-pages/IconDots.svg?react";
import { IconButton } from "../left_nav/left_nav_top_div/IconButton/IconButton";

interface HistoryTableRowProps {
  scenarioName: string;
  status: string;
  startTime: string;
  executionTime: string;
  execId: number;
  method: string;
}

export function HistoryTableRow({
  scenarioName,
  status,
  startTime,
  executionTime,
  execId,
  method,
}: HistoryTableRowProps): JSX.Element {
  return (
    <tr>
      <td>
        <input type="checkbox" className="history-table__checkbox" />
      </td>
      <td>{scenarioName}</td>
      <td>{status}</td>
      <td>{startTime}</td>
      <td>{executionTime}</td>
      <td>{execId}</td>
      <td>{method}</td>
      <td>
        <IconButton icon={<IconDots />} onClick={() => {}} />
      </td>
    </tr>
  );
}
