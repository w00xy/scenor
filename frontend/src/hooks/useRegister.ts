import { useState } from "react";
import { useFieldFeedbackContext } from "../context/FieldFeedbackContext";
import { validateRegistrationForm } from "../utils/validation/registrationValidation";

export function useRegister() {
  const { showFeedback } = useFieldFeedbackContext();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const validation = validateRegistrationForm(username, email, password);

    if (!validation.isValid) {
      showFeedback(validation.message, "error");
      return;
    }

    try {
      // Имитация запроса к серверу
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Данные для регистрации:", {
        username: username.trim(),
        email: email.trim(),
        password,
      });

      showFeedback("Регистрация успешна! Теперь можете войти", "success");
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      showFeedback("Ошибка сервера. Попробуйте позже", "error");
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    handleRegister,
  };
}
