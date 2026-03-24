import React, { JSX } from "react";
import "./MainMenu.scss";
import { MainMenuTopSection } from "../main_menu-top_section/MainMenuTopSection/MainMenuTopSection";
import { MainMenuBody } from "../MainMenuBody/MainMenuBody";
interface MainMenuProps {
  children: React.ReactNode;
}

export function MainMenu({ children }: MainMenuProps): JSX.Element {
  return (
    <div className="MainMenu">
      <MainMenuBody>
        <MainMenuTopSection />
        {children}
      </MainMenuBody>
    </div>
  );
}
