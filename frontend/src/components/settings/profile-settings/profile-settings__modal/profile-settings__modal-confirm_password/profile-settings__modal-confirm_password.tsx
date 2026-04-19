import "./profile-settings__modal-confirm_password.scss";
import { InputField } from "../../../../../components/auth_reg/InputField/InputField";
import { ModeName } from "../../../../auth_reg/ModeName/ModeName";
import { ARButton } from "../../../../auth_reg/ARButton/ARButton";
import { Input } from "../../../../auth_reg/Input/Input";
import { useState } from "react";
import CloseSVG from "../../../../../assets/MM_Vectors-pages/Close.svg?react";

interface ConfirmPasswordModalProps {
  onClose: () => void;
  onConfirm: (password: string) => void;
  isLoading?: boolean;
}

export function ConfirmPasswordModal({
  onClose,
  onConfirm,
  isLoading,
}: ConfirmPasswordModalProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(password);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="confirm-password-overlay" onClick={handleOverlayClick}>
      <form
        className="confirm-password__form"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <div className="confirm-password-modal__header">
          <ModeName text="Подтвердите пароль" />
          <button type="button" onClick={onClose}>
            <CloseSVG />
          </button>
        </div>

        <div className="confirm-password__txt">
          Для изменения адреса электронной почты, пожалуйста, подтвердите свой
          пароль.
        </div>

        <InputField>
          <Input
            placeholder="Введите ваш пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </InputField>
        <ARButton
          text={isLoading ? "Проверка..." : "Подтвердить"}
          type="submit"
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
