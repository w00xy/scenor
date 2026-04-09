interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const validateUsername = (username: string): ValidationResult => {
  if (!username || username.trim() === "") {
    return {
      isValid: false,
      message: "Имя пользователя не может быть пустым",
    };
  }

  if (username.length < 3) {
    return {
      isValid: false,
      message: "Имя пользователя должно содержать не менее 3 символов",
    };
  }

  if (username.length > 30) {
    return {
      isValid: false,
      message: "Имя пользователя должно содержать не более 30 символов",
    };
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      message:
        "Имя пользователя может содержать только латинские буквы, цифры и _",
    };
  }

  if (!/[a-zA-Z]/.test(username)) {
    return {
      isValid: false,
      message: "Имя пользователя должно содержать хотя бы одну букву",
    };
  }

  return {
    isValid: true,
    message: "",
  };
};
