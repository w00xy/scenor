import React, { JSX, useState, useRef } from "react";
import { useMenu } from "../../../context/MenuContext";
import { useProjects } from "../../../context/ProjectsContext";
import { useCurrentUser } from "../../../context/CurrentUserContext";
import "./left_nav_btns.scss";
import { LNBtn } from "./left_nav_btn/left_nav_btn";
import { SettingsMenu } from "../sidebar_settings_menu/SettingsMenu";

import LockSVG from "../../../assets/navigation/Lock.svg?react";
import ProjectSVG from "../../../assets/navigation/Project.svg?react";
import SettingSVG from "../../../assets/settings/Settings.svg?react";
import TemplateSVG from "../../../assets/navigation/Templates.svg?react";
import ReviewSVG from "../../../assets/navigation/Review.svg?react";

export function LNav(): JSX.Element {
  const { collapsed } = useMenu();
  const { personalProjectId, teamProjects } = useProjects();
  const { currentUser } = useCurrentUser();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const isAdmin = currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="LNav">
      <div className="LNav__top">
        <div className="group_btn">
          <LNBtn icon={<ReviewSVG />} text="Обзор" to="/overview" />
          {personalProjectId && (
            <LNBtn
              icon={<LockSVG />}
              text="Личный"
              to={`/projects/${personalProjectId}`}
            />
          )}
        </div>
        {teamProjects.length > 0 && (
          <div className="group_btn">
            {!collapsed && <p className="group_btn__label">Проекты</p>}
            {[...teamProjects]
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
              .map((project) => (
                <LNBtn
                  key={project.id}
                  icon={<ProjectSVG />}
                  text={project.name}
                  to={`/projects/${project.id}`}
                />
              ))}
          </div>
        )}
      </div>
      <div className="group_btn">
        {isAdmin && <LNBtn icon={<LockSVG />} text="Админ панель" to="/admin/dashboard" />}
        <LNBtn icon={<TemplateSVG />} text="Шаблоны" to="/templates" />
        <div className={`settings-wrapper ${collapsed ? "collapsed" : ""}`}>
          <button
            ref={settingsButtonRef}
            className={`left_nav_button ${collapsed ? "collapsed" : ""}`}
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          >
            <SettingSVG />
            {!collapsed && (
              <span className="left_nav_button__text">Настройки</span>
            )}
          </button>
          {isSettingsOpen && (
            <SettingsMenu
              onClose={() => setIsSettingsOpen(false)}
              collapsed={collapsed}
              ignoreRef={settingsButtonRef as React.RefObject<HTMLElement>}
            />
          )}
        </div>
      </div>
    </div>
  );
}
