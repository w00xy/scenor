import "./Overview.scss";
import React, { JSX } from "react";
import { Outlet } from "react-router-dom";
import { LNBody } from "../../components/left_nav/left_nav_body/left_nav_body";
import { LNTDiv } from "../../components/left_nav/left_nav_top_div/Left_nav_top_div";
import { HorRule } from "../../components/left_nav/left_nav_hr/HorRule";
import { LNav } from "../../components/left_nav/left_nav_btns/left_nav_btns";
import { MenuProvider } from "../../context/MenuContext";
import { MainMenu } from "../../components/overview/main_menu_overview/MainMenu/MainMenu";
import { MMTS_div_three } from "../../components/overview/main_menu_overview/main_menu_top_section/MMTS_div_three/MMTS_div_three";
import Cookies from "universal-cookie";

const cookies = new Cookies();

export function Overview(): JSX.Element {
  const getButtonText = () => {
    switch (location.pathname) {
      case "/overview/scenario":
        return "Создать сценарий";
      case "/overview/credentials":
        return "Добавить данные";
      default:
        return "Создать сценарий";
    }
  };

  return (
    <div className="overview">
      <MenuProvider>
        <LNBody>
          <LNTDiv />
          <HorRule />
          <LNav />
        </LNBody>
        <MainMenu text={getButtonText()}>
          <MMTS_div_three />
          <Outlet />
        </MainMenu>
      </MenuProvider>
    </div>
  );
}