import "./profile-settings__field.scss";
import { JSX } from "react";
import { IMaskInput} from 'react-imask';

interface ProfileSettingsFieldProps {
  text: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  isPhone?: boolean;
  placeholder?: string;
}

export function ProfileSettingsField({
  text,
  type = "text",
  value = "",
  onChange,
  readOnly = false,
  isPhone = false,
  placeholder = ""
}: ProfileSettingsFieldProps): JSX.Element {
  return (
    <div className="profile-settings__field">
      <div className="profile-settings__label">{text}</div>
      <div className="profile-settings__input-container">
        {isPhone ? (
        <IMaskInput
          mask="+{7} (000) 000-00-00" 
          value={value}
          onAccept={(value: string) => {
            const event = {
              target: { value }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange?.(event);
          }}
          className="profile-settings__input"
          placeholder={placeholder}
          readOnly={readOnly}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="profile-settings__input"
          placeholder={placeholder}
          readOnly={readOnly}
        />
      )}
      </div>
    </div>
  );
}
