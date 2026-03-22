import React, { JSX } from "react";
import "./left_nav_btns.scss";
import { LNBtn } from "./left_nav_btn/left_nav_btn";

import PersonalSVG from "../../../assets/Personal.svg?react";
import SettingSVG from "../../../assets/Settings.svg?react";
import TemplateSVG from "../../../assets/Templates.svg?react";
import ReviewSVG from "../../../assets/Review.svg?react";

export function LNav(): JSX.Element {
  return (
    <div className="LNav">
      <div className="group_btn">
        <LNBtn icon={<ReviewSVG />} text="Обзор" to="/overview_scen" end></LNBtn>
        <LNBtn icon={<PersonalSVG />} text="Личное" to="/home"></LNBtn>
      </div>
      <div className="group_btn">
        <LNBtn icon={<TemplateSVG />} text="Шаблоны" to="/home"></LNBtn>
        <LNBtn icon={<SettingSVG />} text="Настройки" to="/home"></LNBtn>
      </div>
    </div>
  );
}
