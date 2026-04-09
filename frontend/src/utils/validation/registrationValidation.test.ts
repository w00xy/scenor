import { describe, expect, it } from 'vitest';
import { validateRegistrationForm } from './registrationValidation';

describe('registrationValidation', () => {
  it('fails when username is empty', () => {
    expect(validateRegistrationForm('', 'alex@example.com', 'Abc123!')).toEqual(
      {
        isValid: false,
        message: 'Заполните все поля',
      },
    );
  });

  it('returns username-specific validation message', () => {
    expect(
      validateRegistrationForm('a', 'alex@example.com', 'Abc123!'),
    ).toEqual({
      isValid: false,
      message: 'Имя пользователя должно содержать не менее 3 символов',
    });
  });

  it('returns email-specific validation message', () => {
    expect(validateRegistrationForm('alex_2026', 'wrong-email', 'Abc123!')).toEqual(
      {
        isValid: false,
        message: 'Введите корректный email адрес',
      },
    );
  });

  it('returns password-specific validation message', () => {
    expect(
      validateRegistrationForm('alex_2026', 'alex@example.com', 'abc123!'),
    ).toEqual({
      isValid: false,
      message: 'Пароль должен содержать хотя бы одну заглавную букву',
    });
  });

  it('passes when all fields are valid', () => {
    expect(
      validateRegistrationForm('alex_2026', 'alex@example.com', 'Abc123!'),
    ).toEqual({
      isValid: true,
      message: '',
    });
  });
});
