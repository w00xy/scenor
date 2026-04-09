import React, { JSX } from "react";
import "./MMTS_div_three.scss";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Сценарии", path: "scenario" },
  { label: "Учётные данные", path: "credentials" },
  { label: "История операций", path: "history" },        
  { label: "Таблица данных", path: "data-table" },
];

export function MMTS_div_three(): JSX.Element {
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