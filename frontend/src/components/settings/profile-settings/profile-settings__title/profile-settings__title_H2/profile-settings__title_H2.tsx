import { JSX } from "react";
import "./profile-settings__title_H2.scss";

interface ProfileSettingsTitleH2Props{
    text: string;
}

export function ProfileSettingsTitleH2({ text }: ProfileSettingsTitleH2Props): JSX.Element{
    return(
        <div className="profile-settings__title_H2">{text}</div>
    )
}