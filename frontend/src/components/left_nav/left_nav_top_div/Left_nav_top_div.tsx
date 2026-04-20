import React, { JSX, useRef, useState } from "react";
import "./Left_nav_top_div.scss";
import { IconButton } from "./IconButton/IconButton";
import { useMenu } from "../../../context/MenuContext";
import { CreateMenu } from "../create_menu/CreateMenu";

import Logo from "../../../assets/logo.svg?react";
import PlusSVG from "../../../assets/MM_Vectors-pages/Plus.svg?react";
import Decrease from "../../../assets/decrease.svg?react";

export function LNTDiv(): JSX.Element {
  const { collapsed, toggleMenu } = useMenu();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const plusButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={`LMTDiv ${collapsed ? "collapsed" : ""}`}>
      <div className="logo-name__div">
        <Logo />
        {!collapsed && <p>Scenor</p>}
      </div>
      <div className="menu-buttons__top">
        <IconButton
          icon={<PlusSVG />}
          buttonRef={plusButtonRef}
          onClick={() => setIsCreateMenuOpen((prev) => !prev)}
        />
        {isCreateMenuOpen && (
          <CreateMenu
            onClose={() => setIsCreateMenuOpen(false)}
            ignoreRef={plusButtonRef}
            collapsed={collapsed}
          />
        )}
        <IconButton icon={<Decrease />} onClick={toggleMenu} />
      </div>
    </div>
  );
}
