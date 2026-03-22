import "./Overview_scen.scss";
import React, { JSX } from "react";
import { LNBody } from "../../components/left_nav/left_nav_body/left_nav_body";
import { LNTDiv } from "../../components/left_nav/left_nav_top_div/Left_nav_top_div";
import { HorRule } from "../../components/left_nav/left_nav_hr/HorRule";
import { LNav } from "../../components/left_nav/left_nav_btns/left_nav_btns";
import { MenuProvider } from "../../context/MenuContext";

export function Overview_Scen(): JSX.Element {
  return (
    <div className="overview_scen">
      <MenuProvider>
        <LNBody>
          <LNTDiv />
          <HorRule />
          <LNav />
        </LNBody>
      </MenuProvider>
    </div>
  );
}
