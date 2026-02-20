// src/utils/validation/registrationValidation.js
import { validateEmail, getEmailErrorMessage } from './emailValidation';
import { validatePassword } from './passwordValidation';
import { validateUsername } from './usernameValidation';

export const validateRegistrationForm = (username, email, password) => {
  
  // Проверка username
  if (!username || username.trim() === '') {
    return { 
      isValid: false, 
      message: "Заполните все поля" 
    };
  }
  
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    return usernameValidation;
  }
  
  // Проверка email
  if (!email || email.trim() === '') {
    return { 
      isValid: false, 
      message: "Заполните все поля" 
    };
  }
  
  if (!validateEmail(email.trim())) {
    return { 
      isValid: false, 
      message: getEmailErrorMessage() 
    };
  }
  
  // Проверка пароля
  if (!password || password.trim() === '') {
    return { 
      isValid: false, 
      message: "Заполните все поля" 
    };
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return passwordValidation;
  }
  
  // Всё хорошо
  return {
    isValid: true,
    message: ""
  };
};