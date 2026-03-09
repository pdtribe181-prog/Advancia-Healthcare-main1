/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApi, useMutation, invalidateCache } from './useApi';

// Mock api module
const mockGet = vi.fn();
vi.mock('../services/api', () => ({
  api: { get: (...args: unknown[]) => mockGet(...args) },
  ApiError: class extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
    }
  },
}));

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateCache(); // clear cache between tests
  });

  it('fetches data on mount', async () => {
    mockGet.mockResolvedValue({ items: [1, 2, 3] });

    const { result } = renderHook(() => useApi<{ items: number[] }>('/test'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ items: [1, 2, 3] });
    expect(result.current.error).toBeNull();
    expect(mockGet).toHaveBeenCalledWith('/test');
  });

  it('skips fetch when skip is true', () => {
    const { result } = renderHook(() => useApi('/test', { skip: true }));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('sets error state on failure', async () => {
    mockGet.mockRejectedValue(new Error('Network failure'));

    const { result } = renderHook(() => useApi('/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('refetch re-fetches data', async () => {
    mockGet.mockResolvedValue('first');

    const { result } = renderHook(() => useApi<string>('/test'));

    await waitFor(() => {
      expect(result.current.data).toBe('first');
    });

    mockGet.mockResolvedValue('second');

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toBe('second');
  });
});

describe('useMutation', () => {
  it('calls mutation function and returns data', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: 1 });

    const { result } = renderHook(() => useMutation(mutationFn));

    expect(result.current.loading).toBe(false);

    let data: unknown;
    await act(async () => {
      data = await result.current.mutate({ name: 'test' });
    });

    expect(data).toEqual({ id: 1 });
    expect(result.current.data).toEqual({ id: 1 });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mutationFn).toHaveBeenCalledWith({ name: 'test' });
  });

  it('sets error on failure', async () => {
    const mutationFn = vi.fn().mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => useMutation(mutationFn));

    await act(async () => {
      try {
        await result.current.mutate({});
      } catch {
        // mutate re-throws — expected
      }
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
  });

  it('resets state', async () => {
    const mutationFn = vi.fn().mockResolvedValue({ id: 1 });

    const { result } = renderHook(() => useMutation(mutationFn));

    await act(async () => {
      await result.current.mutate({});
    });

    expect(result.current.data).toEqual({ id: 1 });

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('invalidateCache', () => {
  it('clears all cache entries with no argument', () => {
    // This is a unit test for the exported function
    // Just verify it doesn't throw
    expect(() => invalidateCache()).not.toThrow();
  });

  it('clears entries matching a prefix', () => {
    expect(() => invalidateCache('/test')).not.toThrow();
  });
});
