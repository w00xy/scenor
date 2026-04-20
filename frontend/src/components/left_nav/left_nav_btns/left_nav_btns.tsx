import React, { JSX, useState, useRef } from "react";
import { useMenu } from "../../../context/MenuContext";
import "./left_nav_btns.scss";
import { LNBtn } from "./left_nav_btn/left_nav_btn";
import { SettingsMenu } from "../sidebar_settings_menu/SettingsMenu";

import LockSVG from "../../../assets/MM_Vectors-pages/Lock.svg?react";
import SettingSVG from "../../../assets/Settings.svg?react";
import TemplateSVG from "../../../assets/Templates.svg?react";
import ReviewSVG from "../../../assets/Review.svg?react";

export function LNav(): JSX.Element {
  const { collapsed } = useMenu();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="LNav">
      <div className="group_btn">
        <LNBtn icon={<ReviewSVG />} text="Обзор" to="/overview" />
        <LNBtn
          icon={<LockSVG />}
          text="Личный"
          to="/personal"
        />
      </div>
      <div className="group_btn">
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
