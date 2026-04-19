import "./profile-settings.scss";
import { JSX, useState } from "react";
import { ChangePasswordModal } from "./profile-settings__modal/profile-settings__modal-сhange_password/profile-settings__modal-сhange_password";
import { ConfirmPasswordModal } from "./profile-settings__modal/profile-settings__modal-confirm_password/profile-settings__modal-confirm_password";
import { ProfileSettingsTitleH1 } from "./profile-settings__title/profile-settings__title_H1/profile-settings__title_H1";
import { ProfileSettingsTitleH2 } from "./profile-settings__title/profile-settings__title_H2/profile-settings__title_H2";
import { ProfileSettingsField } from "./profile-settings__field/profile-settings__field";
import { useProfile } from "../../../hooks/useProfile";

export function ProfileSettings(): JSX.Element {
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const {
    name,
    setName,
    lastname,
    setLastname,
    email,
    setEmail,
    phone,
    setPhone,
    handleSave,
    isLoading,
    canSave,
    isPasswordModalOpen, 
    setIsPasswordModalOpen, 
    confirmPassword,
  } = useProfile();

  if (isLoading) {
    return <div className="profile-settings__loading">Загрузка...</div>;
  }

  return (
    <div className="profile_settings">
      <ProfileSettingsTitleH1 />

      <ProfileSettingsTitleH2 text="Основная информация" />

      <div className="profile-settings__group">
        <ProfileSettingsField
          text="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <ProfileSettingsField
          text="Фамилия"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
        />
        <ProfileSettingsField
          text="Электронная почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />
        <ProfileSettingsField
          text="Номер телефона"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+7 (___) ___-__-__"
          isPhone={true}
        />
      </div>

      <ProfileSettingsTitleH2 text="Безопасность" />
      <div className="profile-settings__title_H3">Пароль</div>
      <div
        className="profile-settings__label-link"
        onClick={() => setShowPasswordModal(true)}
      >
        Изменить пароль
      </div>
      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => {}}
        />
      )}

      <button
        className="profile-settings__button"
        onClick={handleSave}
        disabled={!canSave}
        style={!canSave ? { opacity: 0.6, cursor: "not-allowed" } : {}}
      >
        Сохранить
      </button>

      {isPasswordModalOpen && (
        <ConfirmPasswordModal
          onClose={() => {
            setIsPasswordModalOpen(false);
          }}
          onConfirm={confirmPassword}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
