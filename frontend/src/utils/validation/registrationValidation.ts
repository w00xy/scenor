import { validateEmail, getEmailErrorMessage } from "./emailValidation";
import { validatePassword } from "./passwordValidation";
import { validateUsername } from "./usernameValidation";

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const validateRegistrationForm = (
  username: string,
  email: string,
  password: string,
): ValidationResult => {
  if (!username || username.trim() === "") {
    return {
      isValid: false,
      message: "Заполните все поля",
    };
  }

  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    return usernameValidation;
  }

  if (!email || email.trim() === "") {
    return {
      isValid: false,
      message: "Заполните все поля",
    };
  }

  if (!validateEmail(email.trim())) {
    return {
      isValid: false,
      message: getEmailErrorMessage(),
    };
  }

  if (!password || password.trim() === "") {
    return {
      isValid: false,
      message: "Заполните все поля",
    };
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }

  return {
    isValid: true,
    message: "",
  };
};
