/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';

// Track navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock auth context
const mockLogin = vi.fn();
const mockSignup = vi.fn();
const mockSendPhoneOtp = vi.fn();
const mockVerifyPhoneOtp = vi.fn();
const mockSignInWithGoogle = vi.fn();

vi.mock('../providers/AuthProvider', () => ({
  useAuth: () => ({
    login: mockLogin,
    signup: mockSignup,
    sendPhoneOtp: mockSendPhoneOtp,
    verifyPhoneOtp: mockVerifyPhoneOtp,
    signInWithGoogle: mockSignInWithGoogle,
    user: null,
    loading: false,
    isAuthenticated: false,
    logout: vi.fn(),
  }),
}));

function renderLogin(route = '/login') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Login />
    </MemoryRouter>
  );
}

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders sign-in form by default', () => {
      renderLogin();
      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('renders signup form at /signup route', () => {
      renderLogin('/signup');
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    });

    it('renders auth method tabs', () => {
      renderLogin();
      expect(screen.getByRole('button', { name: 'Email' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Phone' })).toBeInTheDocument();
    });

    it('renders Google OAuth button', () => {
      renderLogin();
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    });

    it('shows signup link on login page', () => {
      renderLogin();
      expect(screen.getByText(/Don't have an account/)).toBeInTheDocument();
    });

    it('shows login link on signup page', () => {
      renderLogin('/signup');
      expect(screen.getByText(/Already have an account/)).toBeInTheDocument();
    });
  });

  describe('Email Login', () => {
    it('calls login on valid form submission', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce(undefined);
      renderLogin();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password1');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password1');
      });
    });

    it('navigates to dashboard on successful login', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce(undefined);
      renderLogin();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'password1');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows error on login failure', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
      renderLogin();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('Password'), 'wrongpass1');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
      });
    });

    it('shows validation error for empty email', async () => {
      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText('Password'), 'password1');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('shows validation error for empty password', async () => {
      const user = userEvent.setup();
      renderLogin();

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  describe('Email Signup', () => {
    it('calls signup with name on valid form', async () => {
      const user = userEvent.setup();
      mockSignup.mockResolvedValueOnce(undefined);
      renderLogin('/signup');

      await user.type(screen.getByLabelText('Full Name'), 'Jane Doe');
      await user.type(screen.getByLabelText('Email'), 'jane@example.com');
      await user.type(screen.getByLabelText('Password'), 'securePass1');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith('jane@example.com', 'securePass1', 'Jane Doe');
      });
    });

    it('shows password validation error for weak password', async () => {
      const user = userEvent.setup();
      renderLogin('/signup');

      await user.type(screen.getByLabelText('Email'), 'jane@example.com');
      await user.type(screen.getByLabelText('Password'), 'short');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters/)).toBeInTheDocument();
      });
      expect(mockSignup).not.toHaveBeenCalled();
    });
  });

  describe('Phone Auth', () => {
    it('switches to phone form when Phone tab clicked', async () => {
      const user = userEvent.setup();
      renderLogin();

      await user.click(screen.getByRole('button', { name: 'Phone' }));

      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
    });

    it('sends OTP for valid phone number', async () => {
      const user = userEvent.setup();
      mockSendPhoneOtp.mockResolvedValueOnce(undefined);
      renderLogin();

      await user.click(screen.getByRole('button', { name: 'Phone' }));
      await user.type(screen.getByLabelText('Phone Number'), '+1234567890');
      await user.click(screen.getByRole('button', { name: 'Send Code' }));

      await waitFor(() => {
        expect(mockSendPhoneOtp).toHaveBeenCalledWith('+1234567890');
      });
    });

    it('shows error for invalid phone number', async () => {
      const user = userEvent.setup();
      renderLogin();

      await user.click(screen.getByRole('button', { name: 'Phone' }));
      await user.type(screen.getByLabelText('Phone Number'), 'abc');
      await user.click(screen.getByRole('button', { name: 'Send Code' }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/valid phone number/);
      });
      expect(mockSendPhoneOtp).not.toHaveBeenCalled();
    });
  });

  describe('Google OAuth', () => {
    it('calls signInWithGoogle on button click', async () => {
      const user = userEvent.setup();
      mockSignInWithGoogle.mockResolvedValueOnce(undefined);
      renderLogin();

      await user.click(screen.getByRole('button', { name: /google/i }));

      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });

    it('shows error when Google sign-in fails', async () => {
      const user = userEvent.setup();
      mockSignInWithGoogle.mockRejectedValueOnce(new Error('Google sign-in failed'));
      renderLogin();

      await user.click(screen.getByRole('button', { name: /google/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Google sign-in failed');
      });
    });
  });
});
