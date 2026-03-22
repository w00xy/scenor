import React, { JSX } from "react";
import { NavLink } from "react-router-dom";
import "./left_nav_btn.scss";
import { useMenu } from "../../../../context/MenuContext"; 

interface LNBtnProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  end?: boolean;
}

export function LNBtn({ icon, text, to, end }: LNBtnProps): JSX.Element {
  const { collapsed } = useMenu();

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `left_nav_button ${isActive ? "active" : ""} ${collapsed ? "collapsed" : ""}`
      }
    >
      {icon}
      {!collapsed && <span className="left_nav_button__text">{text}</span>}
    </NavLink>
  );
}