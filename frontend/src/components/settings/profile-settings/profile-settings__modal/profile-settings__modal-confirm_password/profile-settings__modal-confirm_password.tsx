import "./profile-settings__modal-confirm_password.scss";
import { InputField } from "../../../../../components/auth_reg/InputField/InputField";
import { ModeName } from "../../../../auth_reg/ModeName/ModeName";
import { ARButton } from "../../../../auth_reg/ARButton/ARButton";
import { Input } from "../../../../auth_reg/Input/Input";
import { FieldSpacer } from "../../../../auth_reg/FieldSpacer/FieldSpacer";
import { useState } from "react";
import CloseSVG from "../../../assets/MM_Vectors-pages/Close.svg?react";

interface ConfirmPasswordModalProps {
  onClose: () => void;
  onConfirm: (password: string) => void;
  isLoading?: boolean;
}

export function ConfirmPasswordModal({ onClose, onConfirm, isLoading }: ConfirmPasswordModalProps) {
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
      <div className="confirm-password-modal">
        <form className="container_ar" autoComplete="off" onSubmit={handleSubmit}>
          <div className="confirm-password-modal__header">
            <ModeName text="Подтвердите пароль" />
            <button type="button" className="confirm-password-modal__close" onClick={onClose}>
              <CloseSVG />
            </button>
          </div>
          <FieldSpacer height={20} />
          <InputField>
            <Input
              placeholder="Введите ваш пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </InputField>
          <FieldSpacer height={24} />
          <ARButton text={isLoading ? "Проверка..." : "Подтвердить"} type="submit" disabled={isLoading} />
        </form>
      </div>
    </div>
  );
}