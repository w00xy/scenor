import { JSX } from "react";
import { Navigate, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { LNBody } from "../../components/left_nav/left_nav_body/left_nav_body";
import { LNTDiv } from "../../components/left_nav/left_nav_top_div/Left_nav_top_div";
import { HorRule } from "../../components/left_nav/left_nav_hr/HorRule";
import { LNav } from "../../components/left_nav/left_nav_btns/left_nav_btns";
import { MainMenuBody } from "../../components/overview/main_menu_overview/MainMenuBody/MainMenuBody";
import { MMTS_div_three } from "../../components/overview/main_menu_overview/main_menu_top_section/MMTS_div_three/MMTS_div_three";
import { useProjects } from "../../context/ProjectsContext";
import "./PersonalProject.scss";

export function PersonalProject(): JSX.Element {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const { isLoading, personalProjectId } = useProjects();

  if (isLoading) {
    return <div className="personal-project">Загрузка проекта...</div>;
  }

  if (!personalProjectId) {
    return <Navigate to="/overview/scenario" replace />;
  }

  if (projectId !== personalProjectId) {
    return <Navigate to={`/projects/${personalProjectId}/scenario`} replace />;
  }

  const getActionText = () => {
    if (pathname.endsWith("/credentials")) return "Добавить данные";
    if (pathname.endsWith("/history")) return "Новая операция";
    if (pathname.endsWith("/data-table")) return "Создать таблицу";
    return "Создать сценарий";
  };

  return (
    <div className="personal-project">
      <LNBody>
        <LNTDiv />
        <HorRule />
        <LNav />
      </LNBody>

      <div className="personal-project__main">
        <MainMenuBody>
          <div className="personal-project__header">
            <div className="personal-project__copy">
              <p className="personal-project__title">Личное</p>
              <p className="personal-project__subtitle">
                Ваши личные сценарии, данные, история операций и учетные
                данные.
              </p>
            </div>
            <button
              type="button"
              className="personal-project__action"
              onClick={() => navigate(`/projects/${personalProjectId}/scenario`)}
            >
              {getActionText()}
            </button>
          </div>

          <MMTS_div_three />
          <div className="personal-project__content">
            <Outlet />
          </div>
        </MainMenuBody>
      </div>
    </div>
  );
}
