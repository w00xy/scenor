// src/utils/validation/emailValidation.js
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getEmailErrorMessage = () => {
  return "Введите корректный email адрес";
};
