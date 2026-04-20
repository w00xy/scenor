import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearTokens } from "../../../services/api";
import ProfileIcon from "../../../assets/settings_sidebar/Profile.svg?react";
import OpenDoorIcon from "../../../assets/settings_sidebar/OpenDoor.svg?react";
import "./SettingsMenu.scss";

interface SettingsMenuProps {
  onClose: () => void;
  collapsed?: boolean;
  ignoreRef?: React.RefObject<HTMLElement>;
}

export function SettingsMenu({
  onClose,
  collapsed,
  ignoreRef,
}: SettingsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const positionClass = collapsed
    ? "settings-menu--right"
    : "settings-menu--bottom";
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        ignoreRef?.current &&
        ignoreRef.current.contains(event.target as Node)
      ) {
        return;
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, ignoreRef]);

  const handlePersonal = () => {
    navigate("/settings/profile");
    onClose();
  };

  const handleLogout = () => {
    clearTokens();
    navigate("/auth", { replace: true });
    onClose();
  };

  return (
    <div className={`settings-menu ${positionClass}`} ref={menuRef}>
      <button className="settings-menu__item" onClick={handlePersonal}>
        <ProfileIcon className="settings-menu__icon" />
        <span>Профиль</span>
      </button>
      <button className="settings-menu__item" onClick={handleLogout}>
        <OpenDoorIcon className="settings-menu__icon" />
        <span>Выйти из аккаунта</span>
      </button>
    </div>
  );
}
