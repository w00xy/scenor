interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const validatePassword = (password: string): ValidationResult => {
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

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
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

export const validatePasswordLength = (password: string): boolean => {
  return password.length >= 6;
};
