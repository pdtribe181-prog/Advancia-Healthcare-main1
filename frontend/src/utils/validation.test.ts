import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateUUID,
  validateAmount,
  validateLoginForm,
  validateSignupForm,
  validatePaymentForm,
  formatErrors,
  getFieldError,
} from './validation';

describe('validateEmail', () => {
  it('returns null for valid emails', () => {
    expect(validateEmail('user@example.com')).toBeNull();
    expect(validateEmail('test.name+tag@domain.co')).toBeNull();
  });

  it('returns error for empty email', () => {
    expect(validateEmail('')).toBe('Email is required');
  });

  it('returns error for invalid format', () => {
    expect(validateEmail('not-an-email')).toBe('Invalid email address');
    expect(validateEmail('missing@domain')).toBe('Invalid email address');
    expect(validateEmail('@no-user.com')).toBe('Invalid email address');
  });

  it('returns error for too long email', () => {
    const longEmail = 'a'.repeat(250) + '@b.com';
    expect(validateEmail(longEmail)).toBe('Email is too long');
  });
});

describe('validatePassword', () => {
  it('returns null for valid passwords', () => {
    expect(validatePassword('SecurePass1')).toBeNull();
    expect(validatePassword('myp4ssword')).toBeNull();
  });

  it('returns error for empty password', () => {
    expect(validatePassword('')).toBe('Password is required');
  });

  it('returns error for short password', () => {
    expect(validatePassword('Ab1')).toBe('Password must be at least 8 characters');
  });

  it('returns error for too long password', () => {
    expect(validatePassword('a'.repeat(129))).toBe('Password is too long');
  });

  it('returns error when missing letters', () => {
    expect(validatePassword('12345678')).toBe('Password must contain at least one letter');
  });

  it('returns error when missing numbers', () => {
    expect(validatePassword('abcdefgh')).toBe('Password must contain at least one number');
  });
});

describe('validateUUID', () => {
  it('returns null for valid UUID v4', () => {
    expect(validateUUID('550e8400-e29b-41d4-a716-446655440000')).toBeNull();
  });

  it('returns error for empty id', () => {
    expect(validateUUID('')).toBe('ID is required');
  });

  it('returns error for invalid format', () => {
    expect(validateUUID('not-a-uuid')).toBe('Invalid ID format');
    expect(validateUUID('550e8400-e29b-31d4-a716-446655440000')).toBe('Invalid ID format'); // v3 not v4
  });
});

describe('validateAmount', () => {
  it('returns null for valid amounts', () => {
    expect(validateAmount(100)).toBeNull();
    expect(validateAmount(1)).toBeNull();
    expect(validateAmount(99999999)).toBeNull();
  });

  it('returns error for zero', () => {
    expect(validateAmount(0)).toBe('Amount must be positive');
  });

  it('returns error for negative', () => {
    expect(validateAmount(-50)).toBe('Amount must be positive');
  });

  it('returns error for non-integer', () => {
    expect(validateAmount(10.5)).toBe('Amount must be a whole number');
  });

  it('returns error for exceeding max', () => {
    expect(validateAmount(100000000)).toBe('Amount exceeds maximum limit');
  });
});

describe('validateLoginForm', () => {
  it('succeeds for valid input', () => {
    const result = validateLoginForm({ email: 'user@test.com', password: 'pass' });
    expect(result.success).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('fails for empty email', () => {
    const result = validateLoginForm({ email: '', password: 'pass' });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual({ field: 'email', message: 'Email is required' });
  });

  it('fails for empty password', () => {
    const result = validateLoginForm({ email: 'user@test.com', password: '' });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual({ field: 'password', message: 'Password is required' });
  });
});

describe('validateSignupForm', () => {
  it('succeeds for valid input', () => {
    const result = validateSignupForm({ email: 'user@test.com', password: 'MyPass123' });
    expect(result.success).toBe(true);
  });

  it('validates password strength', () => {
    const result = validateSignupForm({ email: 'user@test.com', password: 'short' });
    expect(result.success).toBe(false);
    expect(result.errors?.some((e) => e.field === 'password')).toBe(true);
  });

  it('validates optional fullName min length', () => {
    const result = validateSignupForm({
      email: 'user@test.com',
      password: 'MyPass123',
      fullName: 'A',
    });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'fullName',
      message: 'Name must be at least 2 characters',
    });
  });

  it('validates optional fullName max length', () => {
    const result = validateSignupForm({
      email: 'user@test.com',
      password: 'MyPass123',
      fullName: 'A'.repeat(101),
    });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual({ field: 'fullName', message: 'Name is too long' });
  });
});

describe('validatePaymentForm', () => {
  it('succeeds for valid payment data', () => {
    const result = validatePaymentForm({ amount: 5000 });
    expect(result.success).toBe(true);
  });

  it('fails for invalid amount', () => {
    const result = validatePaymentForm({ amount: -1 });
    expect(result.success).toBe(false);
  });

  it('validates currency code length', () => {
    const result = validatePaymentForm({ amount: 100, currency: 'US' });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'currency',
      message: 'Currency must be a 3-letter code',
    });
  });

  it('validates description length', () => {
    const result = validatePaymentForm({ amount: 100, description: 'x'.repeat(501) });
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'description',
      message: 'Description is too long',
    });
  });
});

describe('formatErrors', () => {
  it('converts error array to record', () => {
    const errors = [
      { field: 'email', message: 'Required' },
      { field: 'password', message: 'Too short' },
    ];
    expect(formatErrors(errors)).toEqual({ email: 'Required', password: 'Too short' });
  });

  it('returns empty object for empty array', () => {
    expect(formatErrors([])).toEqual({});
  });
});

describe('getFieldError', () => {
  const errors = [
    { field: 'email', message: 'Invalid' },
    { field: 'password', message: 'Required' },
  ];

  it('returns error message for matching field', () => {
    expect(getFieldError(errors, 'email')).toBe('Invalid');
  });

  it('returns undefined for non-matching field', () => {
    expect(getFieldError(errors, 'fullName')).toBeUndefined();
  });

  it('returns undefined when errors is undefined', () => {
    expect(getFieldError(undefined, 'email')).toBeUndefined();
  });
});
