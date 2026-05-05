import React, { JSX } from "react";
import { NavLink } from "react-router-dom";
import "./left_nav_btn.scss";
import { useMenu } from "../../../../context/MenuContext"; 

interface LNBtnProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  end?: boolean;
  forceExpanded?: boolean;
}

export function LNBtn({
  icon,
  text,
  to,
  end,
  forceExpanded = false,
}: LNBtnProps): JSX.Element {
  const { collapsed } = useMenu();
  const isCollapsed = forceExpanded ? false : collapsed;

  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `left_nav_button ${isActive ? "active" : ""} ${isCollapsed ? "collapsed" : ""}`
      }
    >
      {icon}
      {!isCollapsed && <span className="left_nav_button__text">{text}</span>}
    </NavLink>
  );
}
