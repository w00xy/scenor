import { describe, expect, it } from 'vitest';
import { validateUsername } from './usernameValidation';

describe('usernameValidation', () => {
  it('fails when username is empty', () => {
    expect(validateUsername('')).toEqual({
      isValid: false,
      message: 'Имя пользователя не может быть пустым',
    });
  });

  it('fails when username is too short', () => {
    expect(validateUsername('ab')).toEqual({
      isValid: false,
      message: 'Имя пользователя должно содержать не менее 3 символов',
    });
  });

  it('fails when username is too long', () => {
    expect(validateUsername('a'.repeat(31))).toEqual({
      isValid: false,
      message: 'Имя пользователя должно содержать не более 30 символов',
    });
  });

  it('fails when username contains disallowed symbols', () => {
    expect(validateUsername('alex-test')).toEqual({
      isValid: false,
      message:
        'Имя пользователя может содержать только латинские буквы, цифры и _',
    });
  });

  it('fails when username has no letters', () => {
    expect(validateUsername('123456')).toEqual({
      isValid: false,
      message: 'Имя пользователя должно содержать хотя бы одну букву',
    });
  });

  it('passes for a valid username', () => {
    expect(validateUsername('alex_2026')).toEqual({
      isValid: true,
      message: '',
    });
  });
});
