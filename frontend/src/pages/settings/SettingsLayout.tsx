import { Outlet } from "react-router-dom";
import "./SettingsLayout.scss";
import { LNBody } from "../../components/left_nav/left_nav_body/left_nav_body";
import { LNBtn } from "../../components/left_nav/left_nav_btns/left_nav_btn/left_nav_btn";
import ProfileSVG from "../../assets/settings_sidebar/Profile.svg?react";
import ArrowLeftSVG from "../../assets/MM_Vectors-pages/Arrow_left.svg?react";

export function SettingsLayout() {
  return (
    <div className="settings-layout">
      <LNBody variant="settings" forceExpanded>
        <LNBtn
          icon={<ArrowLeftSVG />}
          text="Настройки"
          to="/overview"
          forceExpanded
        />
        <LNBtn
          icon={<ProfileSVG />}
          text="Профиль"
          to="/settings/profile"
          forceExpanded
        />
      </LNBody>
      <div className="settings-layout__content">
        <Outlet />
      </div>
    </div>
  );
}
