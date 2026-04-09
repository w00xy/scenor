import { Outlet, NavLink } from "react-router-dom";
import "./SettingsLayout.scss";
import { LNBody } from "../../components/left_nav/left_nav_body/left_nav_body";
import { MenuProvider } from "../../context/MenuContext";
import { LNBtn } from "../../components/left_nav/left_nav_btns/left_nav_btn/left_nav_btn";
import PersonalSVG from "../../assets/Personal.svg?react";
import ArrowLeftSVG from "../../assets/MM_Vectors-pages/Arrow_left.svg?react"
export function SettingsLayout() {
  return (
    <MenuProvider>
      <div className="settings-layout">
        <LNBody variant="settings">
          <LNBtn icon={<ArrowLeftSVG />} text="Настройки" to="/overview" />
          <LNBtn icon={<PersonalSVG />} text="Профиль" to="/settings/profile" />
        </LNBody>
        <div className="settings-layout__content">
          <Outlet />
        </div>
      </div>
    </MenuProvider>
  );
}
