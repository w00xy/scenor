// src/hooks/useLogin.js
import { useState } from "react";
import { useFieldFeedbackContext } from "../context/FieldFeedbackContext";

export function useLogin() {
  const { showFeedback } = useFieldFeedbackContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Проверка на пустые поля
    const isEmailEmpty = !email || email.trim() === "";
    const isPasswordEmpty = !password || password.trim() === "";

    if (isEmailEmpty || isPasswordEmpty) {
      showFeedback("Заполните все поля", "error");
      return;
    }

    try {
      // Имитация запроса к серверу
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Здесь будет реальный запрос к вашему API
      // const response = await fetch('/api/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     email: email.trim(),
      //     password
      //   })
      // });

      // const data = await response.json();

      // Имитация ответа от сервера (для теста)
      const mockSuccess = Math.random() > 0.5; // 50% успеха

      if (mockSuccess) {
        showFeedback("Успешный вход!", "success");
        // Здесь редирект или сохранение токена
        console.log("Успешный вход:", { email: email.trim() });
      } else {
        // ЕДИНАЯ ОШИБКА для неверных данных
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
