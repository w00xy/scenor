import React, { JSX } from "react";
import "./Left_nav_top_div.scss";
import { IconButton } from "./IconButton/IconButton";
import { useMenu } from "../../../context/MenuContext";

import Logo from "../../../assets/logo.svg?react";
import Search from "../../../assets/search.svg?react";
import Decrease from "../../../assets/decrease.svg?react";

export function LNTDiv(): JSX.Element {
  const { collapsed, toggleMenu } = useMenu(); 

  return (
    <div className={`LMTDiv ${collapsed ? 'collapsed' : ''}`}> 
      <div className="logo-name__div">
        <Logo />
        {!collapsed && <p>SCENOR</p>} 
      </div>
      <div className="menu-buttons__top">
        <IconButton icon={<Search />} to="/home" />
        <IconButton icon={<Decrease />} onClick={toggleMenu} />
      </div>
    </div>
  );
}