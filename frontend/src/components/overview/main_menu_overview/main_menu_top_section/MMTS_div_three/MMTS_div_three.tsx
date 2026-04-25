import React, { JSX } from "react";
import "./MMTS_div_three.scss";
import { NavLink } from "react-router-dom";
import { useProjects } from "../../../../../context/ProjectsContext";

const baseNavItems = [
  { label: "Сценарии", path: "scenario" },
  { label: "Учётные данные", path: "credentials" },
  { label: "История операций", path: "history" },        
  { label: "Таблица данных", path: "data-table" },
];

interface MMTS_div_threeProps {
  projectId?: string;
}

export function MMTS_div_three({ projectId }: MMTS_div_threeProps): JSX.Element {
  const { teamProjects } = useProjects();
  
  const isTeamProject = projectId && teamProjects.some((p) => p.id === projectId);
  
  const navItems = isTeamProject
    ? [...baseNavItems, { label: "Настройки проекта", path: "settings" }]
    : baseNavItems;

  return (
    <nav className="top-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === ""}
          className={({ isActive }) =>
            `top-nav__item ${isActive ? "active" : ""}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}