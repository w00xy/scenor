import { JSX, useMemo, useState } from "react";
import { MM_overview_scen_div_one } from "../../../components/overview/pages_overview/overview_scen/MM_overview_scen_div_one/MM_overview_scen_div_one";
import { MM_overview_scen_component } from "../../../components/overview/pages_overview/overview_scen/MM_overview_scen_component/MM_overview_scen_component";
import { MM_overview_scen_div_two } from "../../../components/overview/pages_overview/overview_scen/MM_overview_scen_div_two/MM_overview_scen_div_two";
import "../PersonalProject.scss";

interface Scene {
  name: string;
  last_update: string;
  data_created: string;
  user: string;
}

const personalScenes: Scene[] = [
  {
    name: "Личный сценарий генерации отчёта",
    last_update: "2 часа",
    data_created: "19 Апреля",
    user: "you",
  },
  {
    name: "Личный сценарий уведомлений",
    last_update: "1 день",
    data_created: "11 Апреля",
    user: "you",
  },
];

export function PersonalScenariosPage(): JSX.Element {
  const [sortBy, setSortBy] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  const filteredAndSortedScenes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = normalizedSearch
      ? personalScenes.filter((scene) =>
          scene.name.toLowerCase().includes(normalizedSearch),
        )
      : personalScenes;

    if (!sortBy) {
      return filtered;
    }

    return [...filtered].sort(sortScenes);
  }, [searchTerm, sortBy]);

  return (
    <section className="personal-scenarios">
      <MM_overview_scen_div_one
        placeholder="Поиск"
        sortBy={sortBy}
        onSortChange={setSortBy}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
      />
      {filteredAndSortedScenes.map((scene) => (
        <MM_overview_scen_component
          key={scene.name}
          name={scene.name}
          last_update={scene.last_update}
          data_created={scene.data_created}
          user={scene.user}
        />
      ))}
      <MM_overview_scen_div_two
        count={String(filteredAndSortedScenes.length)}
        current_page="1"
      />
    </section>
  );
}
