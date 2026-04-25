import { JSX } from "react";
import { Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { LNBody } from "../../components/left_nav/left_nav_body/left_nav_body";
import { LNTDiv } from "../../components/left_nav/left_nav_top_div/Left_nav_top_div";
import { HorRule } from "../../components/left_nav/left_nav_hr/HorRule";
import { LNav } from "../../components/left_nav/left_nav_btns/left_nav_btns";
import { MainMenuBody } from "../../components/overview/main_menu_overview/MainMenuBody/MainMenuBody";
import { MMTS_div_three } from "../../components/overview/main_menu_overview/main_menu_top_section/MMTS_div_three/MMTS_div_three";
import { useProjects } from "../../context/ProjectsContext";
import "./TeamProject.scss";

export function TeamProject(): JSX.Element {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const { isLoading, teamProjects } = useProjects();

  if (isLoading) {
    return <div className="team-project">Загрузка проекта...</div>;
  }

  const currentProject = teamProjects.find((p) => p.id === projectId);

  if (!currentProject) {
    return <Navigate to="/overview/scenario" replace />;
  }

  const getActionText = () => {
    if (pathname.endsWith("/credentials")) return "Добавить данные";
    if (pathname.endsWith("/history")) return "Создать сценарий";
    if (pathname.endsWith("/data-table")) return "Создать таблицу";
    if (pathname.endsWith("/settings")) return "";
    return "Создать сценарий";
  };

  return (
    <div className="team-project">
      <LNBody>
        <LNTDiv />
        <HorRule />
        <LNav />
      </LNBody>

      <div className="team-project__main">
        <MainMenuBody>
          <div className="team-project__header">
            <div className="team-project__copy">
              <p className="team-project__title">{currentProject.name}</p>
            </div>
            {!pathname.endsWith("/settings") && (
              <button
                type="button"
                className="team-project__action"
                onClick={() => navigate(`/projects/${projectId}/scenario`)}
              >
                {getActionText()}
              </button>
            )}
          </div>

          <MMTS_div_three projectId={projectId} />
          <div className="team-project__content">
            <Outlet />
          </div>
        </MainMenuBody>
      </div>
    </div>
  );
}
