// src/utils/validation/passwordValidation.js
export const validatePassword = (password) => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: "Пароль должен содержать не менее 6 символов",
    };
  }

  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: "Пароль должен содержать хотя бы одну цифру",
    };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Пароль должен содержать хотя бы одну букву",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Пароль должен содержать хотя бы одну заглавную букву",
    };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message: "Пароль должен содержать хотя бы один спецсимвол (!@#$%^&*)",
    };
  }

  if (/\s/.test(password)) {
    return {
      isValid: false,
      message: "Пароль не должен содержать пробелы",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};

// Упрощенная валидация для проверки только длины (если нужно)
export const validatePasswordLength = (password) => {
  return password.length >= 6;
};
