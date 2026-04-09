import React, { JSX } from "react";
import "./MainMenu.scss";
import { MainMenuTopSection } from "../main_menu_top_section/MainMenuTopSection/MainMenuTopSection";
import { MainMenuBody } from "../MainMenuBody/MainMenuBody";
interface MainMenuProps {
  children: React.ReactNode;
  text: string;
}

export function MainMenu({ children, text }: MainMenuProps): JSX.Element {
  return (
    <div className="MainMenu">
      <MainMenuBody>
        <MainMenuTopSection text={text}/>
        {children}
      </MainMenuBody>
    </div>
  );
}
