import React, { JSX } from "react";
import "./MainMenuTopSection.scss";
import { MMTS_div_one } from "../MMTS_div_one/MMTS_div_one";
import { MMTS_div_two } from "../MMTS_div_two/MMTS_div_two";
import { MMTS_div_three } from "../MMTS_div_three/MMTS_div_three";

export function MainMenuTopSection(): JSX.Element {
  return (
    <div>
      <MMTS_div_one text="Создать сценарий" />
      <MMTS_div_two />
      <MMTS_div_three />
    </div>
  );
}
