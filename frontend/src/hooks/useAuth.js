// src/hooks/useAuth.js
import { useState } from 'react';
import { useFieldFeedbackContext } from "../context/FieldFeedbackContext";

export function useAuth() {
  const { showFeedback } = useFieldFeedbackContext();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Функция для валидации email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Функция для валидации пароля
  const validatePassword = (password) => {
    // Минимальная длина 8 символов
    if (password.length < 8) {
      return {
        isValid: false,
        message: "Пароль должен содержать не менее 8 символов"
      };
    }
    
    // Проверка на наличие цифр
    if (!/\d/.test(password)) {
      return {
        isValid: false,
        message: "Пароль должен содержать хотя бы одну цифру"
      };
    }
    
    // Проверка на наличие букв (латиница)
    if (!/[a-zA-Z]/.test(password)) {
      return {
        isValid: false,
        message: "Пароль должен содержать хотя бы одну букву"
      };
    }
    
    // Проверка на наличие заглавной буквы
    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        message: "Пароль должен содержать хотя бы одну заглавную букву"
      };
    }
    
    // Проверка на наличие спецсимволов
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return {
        isValid: false,
        message: "Пароль должен содержать хотя бы один спецсимвол (!@#$%^&*)"
      };
    }
    
    // Проверка на отсутствие пробелов
    if (/\s/.test(password)) {
      return {
        isValid: false,
        message: "Пароль не должен содержать пробелы"
      };
    }
    
    return {
      isValid: true,
      message: ""
    };
  };

  const handleLogin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isEmailEmpty = !email || email.trim() === '';
    const isPasswordEmpty = !password || password.trim() === '';
    
    // Проверка на пустые поля
    if (isEmailEmpty || isPasswordEmpty) {
      showFeedback("Заполните все поля", "error");
      return;
    }
    
    // Проверка формата email
    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      showFeedback("Введите корректный email адрес", "error");
      return;
    }
    
    // Проверка пароля
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      showFeedback(passwordValidation.message, "error");
      return;
    }
    
    // Если всё хорошо
    console.log("Данные для отправки:", { 
      email: trimmedEmail, 
      password 
    });
    
    showFeedback("Успешный вход!", "success");
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin
  };
}