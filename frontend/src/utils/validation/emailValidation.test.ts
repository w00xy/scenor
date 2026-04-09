import { describe, expect, it } from 'vitest';
import { getEmailErrorMessage, validateEmail } from './emailValidation';

describe('emailValidation', () => {
  it('returns true for a valid email', () => {
    expect(validateEmail('alex@example.com')).toBe(true);
  });

  it('returns false for an invalid email', () => {
    expect(validateEmail('alex.example.com')).toBe(false);
  });

  it('returns the expected error message', () => {
    expect(getEmailErrorMessage()).toBe('Введите корректный email адрес');
  });
});
