import "./profile-settings.scss";
import { ProfileSettingsTitleH1 } from "./profile-settings__title/profile-settings__title_H1/profile-settings__title_H1";
import { ProfileSettingsTitleH2 } from "./profile-settings__title/profile-settings__title_H2/profile-settings__title_H2";
import { ProfileSettingsField } from "./profile-settings__field/profile-settings__field";
import { useProfile } from "../../../hooks/useProfile";

export function ProfileSettings() {
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
      <div className="profile-settings__label-link">Изменить пароль</div>

      <button
        className="profile-settings__button"
        onClick={handleSave}
        disabled={!canSave}
        style={!canSave ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      >
        Сохранить
      </button>
    </div>
  );
}