/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Mock useAuth
const mockUseAuth = vi.fn();
vi.mock('../providers/AuthProvider', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Navigate to capture redirect
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    Navigate: (props: { to: string; state?: unknown; replace?: boolean }) => {
      mockNavigate(props);
      return <div data-testid="navigate">Redirecting to {props.to}</div>;
    },
  };
});

describe('ProtectedRoute', () => {
  it('shows loading state while auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/login', replace: true })
    );
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'user-1', email: 'test@example.com' },
      loading: false,
    });
    render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('passes location state for redirect back after login', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(
      <MemoryRouter initialEntries={['/settings']}>
        <ProtectedRoute><div>Settings</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/login',
        state: expect.objectContaining({ from: '/settings' }),
      })
    );
  });
});
