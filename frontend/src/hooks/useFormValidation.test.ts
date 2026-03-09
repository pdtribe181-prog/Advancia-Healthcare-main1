/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormValidation, rules } from './useFormValidation';

describe('useFormValidation', () => {
  const basicConfig = {
    email: {
      initialValue: '',
      rules: [rules.required('Email is required'), rules.email()],
    },
    password: {
      initialValue: '',
      rules: [rules.required('Password is required'), rules.minLength(8)],
    },
  };

  it('initializes with correct default values', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));

    expect(result.current.state.values).toEqual({ email: '', password: '' });
    expect(result.current.state.isDirty).toBe(false);
    expect(result.current.state.isSubmitting).toBe(false);
  });

  it('updates field value via setValue', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));

    act(() => {
      result.current.setValue('email', 'user@test.com');
    });

    expect(result.current.state.values.email).toBe('user@test.com');
    expect(result.current.state.isDirty).toBe(true);
  });

  it('validates required fields on submit', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.state.errors.email).toBe('Email is required');
    expect(result.current.state.errors.password).toBe('Password is required');
  });

  it('validates email format', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));

    act(() => {
      result.current.setValue('email', 'not-an-email');
    });

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate(['email']);
    });

    expect(isValid!).toBe(false);
    expect(result.current.state.errors.email).toBe('Invalid email address');
  });

  it('validates minLength', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));

    act(() => {
      result.current.setValue('password', 'short');
    });

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate(['password']);
    });

    expect(isValid!).toBe(false);
    expect(result.current.state.errors.password).toBe('Must be at least 8 characters');
  });

  it('passes validation with correct data', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));

    act(() => {
      result.current.setValue('email', 'user@test.com');
      result.current.setValue('password', 'secure123');
    });

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(true);
    expect(result.current.state.isValid).toBe(true);
  });

  it('resets form to initial state', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));

    act(() => {
      result.current.setValue('email', 'user@test.com');
      result.current.setValue('password', '12345678');
    });

    expect(result.current.state.isDirty).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.values).toEqual({ email: '', password: '' });
    expect(result.current.state.isDirty).toBe(false);
  });

  it('sets multiple values at once', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));

    act(() => {
      result.current.setValues({ email: 'a@b.com', password: 'mypass123' });
    });

    expect(result.current.state.values.email).toBe('a@b.com');
    expect(result.current.state.values.password).toBe('mypass123');
  });

  it('clears all errors', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));

    act(() => {
      result.current.validate();
    });

    expect(result.current.state.errors.email).toBeTruthy();

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.state.errors.email).toBeUndefined();
  });

  it('sets a specific field error', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));

    act(() => {
      result.current.setError('email', 'Server says email taken');
    });

    expect(result.current.state.errors.email).toBe('Server says email taken');
  });

  it('getField returns correct helpers', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));

    const field = result.current.getField('email');
    expect(field.value).toBe('');
    expect(field.error).toBeNull();
    expect(field.touched).toBe(false);
    expect(typeof field.onChange).toBe('function');
    expect(typeof field.onBlur).toBe('function');
    expect(typeof field.setValue).toBe('function');
    expect(typeof field.reset).toBe('function');
  });

  it('handleSubmit prevents submission when invalid', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useFormValidation(basicConfig));

    const handler = result.current.handleSubmit(onSubmit);

    await act(async () => {
      await handler({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('handleSubmit calls onSubmit when valid', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useFormValidation(basicConfig));

    act(() => {
      result.current.setValue('email', 'user@test.com');
      result.current.setValue('password', 'validpass1');
    });

    const handler = result.current.handleSubmit(onSubmit);

    await act(async () => {
      await handler({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@test.com',
      password: 'validpass1',
    });
  });
});

describe('rules', () => {
  it('rules.required returns error for empty string', () => {
    const rule = rules.required();
    expect(rule.validate('', {})).toBe('This field is required');
    expect(rule.validate('hello', {})).toBeNull();
  });

  it('rules.email returns error for invalid email', () => {
    const rule = rules.email();
    expect(rule.validate('bad', {})).toBe('Invalid email address');
    expect(rule.validate('user@test.com', {})).toBeNull();
    expect(rule.validate('', {})).toBeNull(); // empty is handled by required
  });

  it('rules.minLength validates minimum string length', () => {
    const rule = rules.minLength(3);
    expect(rule.validate('ab', {})).toBe('Must be at least 3 characters');
    expect(rule.validate('abc', {})).toBeNull();
    expect(rule.validate('', {})).toBeNull(); // empty handled by required
  });
});
