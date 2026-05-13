import { JSX, useState, useRef } from "react";
import IconDots from "../../assets/common/IconDots.svg?react";
import { IconButton } from "../left_nav/left_nav_top_div/IconButton/IconButton";

interface HistoryTableRowProps {
  executionId: string;
  scenarioName: string;
  status: string;
  startTime: string;
  executionTime: string;
  execId: string;
  method: string;
  isSelected: boolean;
  onSelect: () => void;
}

export function HistoryTableRow({
  executionId,
  scenarioName,
  status,
  startTime,
  executionTime,
  execId,
  method,
  isSelected,
  onSelect,
}: HistoryTableRowProps): JSX.Element {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const dotsRef = useRef<HTMLDivElement>(null);

  const handleDotsClick = () => {
    if (dotsRef.current) {
      const rect = dotsRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 150,
      });
    }
    
    setShowMenu(!showMenu);
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить это выполнение?")) {
      return;
    }

    try {
      console.warn("Deleting execution:", executionId);
      setShowMenu(false);
    } catch (error) {
      console.error("Failed to delete execution:", error);
      alert("Не удалось удалить выполнение");
    }
  };

  return (
    <>
      <tr className={isSelected ? 'selected' : ''}>
        <td>
          <input 
            type="checkbox" 
            className="history-table__checkbox"
            checked={isSelected}
            onChange={onSelect}
          />
        </td>
        <td>{scenarioName}</td>
        <td>{status}</td>
        <td>{startTime}</td>
        <td>{executionTime}</td>
        <td>{execId}</td>
        <td>{method}</td>
        <td>
          <div ref={dotsRef}>
            <IconButton icon={<IconDots />} onClick={handleDotsClick} />
          </div>
        </td>
      </tr>

      {showMenu && (
        <>
          <div 
            className="history-table__row-menu"
            style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
          >
            <button 
              className="history-table__menu-item history-table__menu-item--delete"
              onClick={handleDelete}
            >
              Удалить
            </button>
          </div>
          <div 
            className="history-table__overlay"
            onClick={() => setShowMenu(false)}
          />
        </>
      )}
    </>
  );
}
