import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFieldFeedbackContext } from "../context/FieldFeedbackContext";

export function useLogin() {
  const { showFeedback } = useFieldFeedbackContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isEmailEmpty = !email || email.trim() === "";
    const isPasswordEmpty = !password || password.trim() === "";

    if (isEmailEmpty || isPasswordEmpty) {
      showFeedback("Заполните все поля", "error");
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockSuccess = Math.random() > 0.5;

      if (mockSuccess) {
        showFeedback("Успешный вход!", "success");
        navigate("/overview");
      } else {
        showFeedback("Неверный Email или пароль", "error");
      }
    } catch (error) {
      console.error("Ошибка при входе:", error);
      showFeedback("Ошибка сервера. Попробуйте позже", "error");
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
  };
}
