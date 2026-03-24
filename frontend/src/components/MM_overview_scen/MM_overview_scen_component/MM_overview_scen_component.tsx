import { JSX } from "react";
import "./MM_overview_scen_component.scss";
import MM_DotsSVG from "../../../assets/MM_DotsSVG.svg?react";
import PersonalGray from "../../../assets/Personal_gray.svg?react"

interface MM_overview_scen_componentProps {
  name: string;
  last_update: string;
  data_created: string;
  user: string;
}

export function MM_overview_scen_component({
  name,
  last_update,
  data_created,
  user,
}: MM_overview_scen_componentProps): JSX.Element {
  return (
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
            <p>{user}</p>
        </div>
        <MM_DotsSVG />
      </div>
    </div>
  );
}
