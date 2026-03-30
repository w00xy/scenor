import { JSX, useState, useMemo } from "react";
import "./overview_scen.scss";
import { MM_overview_scen_div_one } from "./MM_overview_scen_div_one/MM_overview_scen_div_one";
import { MM_overview_scen_component } from "./MM_overview_scen_component/MM_overview_scen_component";
import { MM_overview_scen_div_two } from "./MM_overview_scen_div_two/MM_overview_scen_div_two";

// Тип для сценария
interface Scene {
  name: string;
  last_update: string;
  data_created: string;
  user: string;
}

// Данные сценариев
const scenes: Scene[] = [
  {
    name: "Cценарий генерации видео veo3",
    last_update: "5 часов",
    data_created: "23 Июля",
    user: "w00xy",
  },
  {
    name: "My workwlow",
    last_update: "1 час",
    data_created: "02 Марта",
    user: "l0yzi",
  },
];

export function Overview_scen(): JSX.Element {
  const [sortBy, setSortBy] = useState<string>("");

  const sortScenes = (a: Scene, b: Scene) => {
    switch (sortBy) {
      case "Name":
        return a.name.localeCompare(b.name);
      case "Creation date":
        return a.data_created.localeCompare(b.data_created);
      case "Update date":
        return a.last_update.localeCompare(b.last_update);
      default:
        return 0;
    }
  };

  const sortedScenes = useMemo(() => {
    if (!sortBy) return scenes;
    return [...scenes].sort(sortScenes);
  }, [sortBy]);

  return (
    <div className="MM_overview_scen">
      <MM_overview_scen_div_one
        placeholder="Поиск"
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      {sortedScenes.map((scene, idx) => (
        <MM_overview_scen_component
          key={idx}
          name={scene.name}
          last_update={scene.last_update}
          data_created={scene.data_created}
          user={scene.user}
        />
      ))}
      <MM_overview_scen_div_two count="2" current_page="1" />
    </div>
  );
}