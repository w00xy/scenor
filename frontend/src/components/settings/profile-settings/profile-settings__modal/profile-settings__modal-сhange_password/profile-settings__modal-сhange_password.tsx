import "./profile-settings__modal-сhange_password.scss";
import { ARForm } from "../../../../../components/auth_reg/ARForm/ARForm";
import { InputField } from "../../../../../components/auth_reg/InputField/InputField";
import { ModeName } from "../../../../../components/auth_reg/ModeName/ModeName";
import { ARButton } from "../../../../../components/auth_reg/ARButton/ARButton";
import { Input } from "../../../../../components/auth_reg/Input/Input";
import { FieldSpacer } from "../../../../../components/auth_reg/FieldSpacer/FieldSpacer";
import { useState } from "react";
import { useFieldFeedbackContext } from "../../../../../context/FieldFeedbackContext";

interface ChangePasswordModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangePasswordModal({ onClose, onSuccess }: ChangePasswordModalProps) {
  const { showFeedback } = useFieldFeedbackContext();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string) => {
    if (password.length < 8) return false;
    if (!/\d/.test(password)) return false;
    if (!/[a-zA-Z]/.test(password)) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showFeedback("Заполните все поля", "error");
      return;
    }

    if (!validatePassword(newPassword)) {
      showFeedback("Новый пароль должен содержать минимум 8 символов, одну цифру и одну букву", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showFeedback("Пароли не совпадают", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Имитация запроса – замените на реальный API
      await new Promise(resolve => setTimeout(resolve, 1000));
      showFeedback("Пароль успешно изменён", "success");
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error(error);
      showFeedback(error.message || "Ошибка смены пароля", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Закрытие по клику на оверлей (опционально)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="change-password-overlay" onClick={handleOverlayClick}>
      <div className="change-password-modal">
        <ARForm onSubmit={handleSubmit}>
          <ModeName text="Изменить пароль" />
          <FieldSpacer height={32} />

          <InputField>
            <Input
              placeholder="Текущий пароль"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </InputField>
          <FieldSpacer height={16} />

          <InputField>
            <Input
              placeholder="Новый пароль"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </InputField>
          <div className="password-hint">8+ символов, как минимум 1 цифра и 1 буква</div>
          <FieldSpacer height={16} />

          <InputField>
            <Input
              placeholder="Подтвердите новый пароль"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </InputField>
          <FieldSpacer height={24} />

          <ARButton text={isLoading ? "Сохранение..." : "Сохранить"} type="submit" disabled={isLoading} />
        </ARForm>
      </div>
    </div>
  );
}