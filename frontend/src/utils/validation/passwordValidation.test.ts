import { describe, expect, it } from 'vitest';
import {
  validatePassword,
  validatePasswordLength,
} from './passwordValidation';

describe('passwordValidation', () => {
  it('fails when password is shorter than 6 symbols', () => {
    expect(validatePassword('Ab1!')).toEqual({
      isValid: false,
      message: 'Пароль должен содержать не менее 6 символов',
    });
  });

  it('fails when password has no digit', () => {
    expect(validatePassword('Abcdef!')).toEqual({
      isValid: false,
      message: 'Пароль должен содержать хотя бы одну цифру',
    });
  });

  it('fails when password has no letter', () => {
    expect(validatePassword('123456!')).toEqual({
      isValid: false,
      message: 'Пароль должен содержать хотя бы одну букву',
    });
  });

  it('fails when password has no uppercase letter', () => {
    expect(validatePassword('abc123!')).toEqual({
      isValid: false,
      message: 'Пароль должен содержать хотя бы одну заглавную букву',
    });
  });

  it('fails when password has no special symbol', () => {
    expect(validatePassword('Abc1234')).toEqual({
      isValid: false,
      message: 'Пароль должен содержать хотя бы один спецсимвол (!@#$%^&*)',
    });
  });

  it('fails when password contains whitespace', () => {
    expect(validatePassword('Abc 123!')).toEqual({
      isValid: false,
      message: 'Пароль не должен содержать пробелы',
    });
  });

  it('passes for a valid password', () => {
    expect(validatePassword('Abc123!')).toEqual({
      isValid: true,
      message: '',
    });
  });
});

describe('validatePasswordLength', () => {
  it('returns false for a short password', () => {
    expect(validatePasswordLength('12345')).toBe(false);
  });

  it('returns true for a password with 6+ chars', () => {
    expect(validatePasswordLength('123456')).toBe(true);
  });
});
