import React, { JSX } from "react";
import { MMTS_div_one } from "../MMTS_div_one/MMTS_div_one";
import { MMTS_div_two } from "../MMTS_div_two/MMTS_div_two";

interface MainMenuTopSectionProps{
  text: string;
}

export function MainMenuTopSection({text}: MainMenuTopSectionProps): JSX.Element {
  return (
    <div>
      <MMTS_div_one text={text}/>
      <MMTS_div_two />
    </div>
  );
}
