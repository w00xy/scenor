import "./Overview_scen.scss";
import React, { JSX } from "react";
import { LNBody } from "../../components/left_nav/left_nav_body/left_nav_body";
import { LNTDiv } from "../../components/left_nav/left_nav_top_div/Left_nav_top_div";
import { HorRule } from "../../components/left_nav/left_nav_hr/HorRule";
import { LNav } from "../../components/left_nav/left_nav_btns/left_nav_btns";
import { MenuProvider } from "../../context/MenuContext";

import { MainMenuBody } from "../../components/main_menu_overview/MainMenuBody/MainMenuBody";
import { MainMenu } from "../../components/main_menu_overview/MainMenu/MainMenu";
import { MM_overview_scen } from "../../components/MM_overview_scen/MM_overview_scen";

export function Overview_Scen(): JSX.Element {
  return (
    <div className="overview_scen">
      <MenuProvider>
        <LNBody>
          <LNTDiv />
          <HorRule />
          <LNav />
        </LNBody>
        <MainMenu>
          <MM_overview_scen />
        </MainMenu>
      </MenuProvider>
    </div>
  );
}
