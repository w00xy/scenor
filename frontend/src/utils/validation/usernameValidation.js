// src/utils/validation/usernameValidation.js
export const validateUsername = (username) => {
  // Проверка на пустоту
  if (!username || username.trim() === '') {
    return {
      isValid: false,
      message: "Имя пользователя не может быть пустым"
    };
  }

  // Проверка минимальной длины
  if (username.length < 3) {
    return {
      isValid: false,
      message: "Имя пользователя должно содержать не менее 3 символов"
    };
  }

  // Проверка максимальной длины
  if (username.length > 30) {
    return {
      isValid: false,
      message: "Имя пользователя должно содержать не более 30 символов"
    };
  }

  // Проверка только латинские буквы, цифры и нижнее подчеркивание
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      message: "Имя пользователя может содержать только латинские буквы, цифры и _"
    };
  }

  // Проверка на наличие хотя бы одной буквы
  if (!/[a-zA-Z]/.test(username)) {
    return {
      isValid: false,
      message: "Имя пользователя должно содержать хотя бы одну букву"
    };
  }

  // Всё хорошо
  return {
    isValid: true,
    message: ""
  };
};