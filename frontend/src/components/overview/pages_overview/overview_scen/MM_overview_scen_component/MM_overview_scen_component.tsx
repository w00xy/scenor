import { JSX, useState, useRef } from "react";
import "./MM_overview_scen_component.scss";
import MM_DotsSVG from "../../../../../assets/common/Dots.svg?react";
import PersonalGray from "../../../../../assets/navigation/PersonalGray.svg?react";
import { WorkflowActionsMenu } from "./WorkflowActionsMenu";

interface MM_overview_scen_componentProps {
  name: string;
  last_update: string;
  data_created: string;
  projectName: string;
  workflowId: string;
  onOpen: () => void;
  onDelete: () => void;
}

export function MM_overview_scen_component({
  name,
  last_update,
  data_created,
  projectName,
  _workflowId,
  onOpen,
  onDelete,
}: MM_overview_scen_componentProps): JSX.Element {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const dotsRef = useRef<HTMLDivElement>(null);

  const handleDotsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (dotsRef.current) {
      const rect = dotsRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 110,
      });
    }
    
    setShowMenu(!showMenu);
  };

  const handleShare = () => {
    alert("Функция 'Поделиться' пока не реализована");
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete();
    setShowMenu(false);
  };

  const handleOpen = () => {
    onOpen();
    setShowMenu(false);
  };

  return (
    <>
      <div className="MM_overview_scen_component">
        <div className="MM_overview_scen_component_left">
          <h1>{name}</h1>
          <p>
            Последнее обновление {last_update} назад | Создано {data_created}
          </p>
        </div>
        <div className="MM_overview_scen_component_right">
          <div>
            <PersonalGray />
            <p>{projectName}</p>
          </div>
          <div ref={dotsRef} onClick={handleDotsClick} className="dots-button">
            <MM_DotsSVG />
          </div>
        </div>
      </div>
      {showMenu && (
        <WorkflowActionsMenu
          onOpen={handleOpen}
          onShare={handleShare}
          onDelete={handleDelete}
          onClose={() => setShowMenu(false)}
          position={menuPosition}
        />
      )}
    </>
  );
}
