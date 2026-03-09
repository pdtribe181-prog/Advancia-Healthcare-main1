/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PaymentPage } from './PaymentPage';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock toast
const mockShowToast = vi.fn();
vi.mock('../components/Toast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

// Mock auth
let mockUser: { email: string } | null = { email: 'test@example.com' };
let mockAuthLoading = false;
vi.mock('../providers/AuthProvider', () => ({
  useAuth: () => ({ user: mockUser, loading: mockAuthLoading }),
}));

// Mock validation — use real getFieldError so error messages render correctly
vi.mock('../utils/validation', async () => {
  const actual = await vi.importActual<typeof import('../utils/validation')>('../utils/validation');
  return {
    ...actual,
    validatePaymentForm: vi.fn(() => ({ success: true })),
  };
});

import { validatePaymentForm } from '../utils/validation';

function renderPaymentPage() {
  return render(
    <MemoryRouter>
      <PaymentPage />
    </MemoryRouter>
  );
}

describe('PaymentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset validatePaymentForm to default success (clearAllMocks doesn't reset implementations)
    (validatePaymentForm as ReturnType<typeof vi.fn>).mockReturnValue({ success: true });
    mockUser = { email: 'test@example.com' };
    mockAuthLoading = false;
    sessionStorage.clear();
  });

  it('redirects unauthenticated users to login', () => {
    mockUser = null;
    renderPaymentPage();
    // Navigate component renders nothing visible — just confirm no form
    expect(screen.queryByText(/make a payment/i)).not.toBeInTheDocument();
  });

  it('renders payment form for authenticated users', () => {
    renderPaymentPage();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue to payment/i })).toBeInTheDocument();
  });

  it('shows validation error for invalid amount', async () => {
    (validatePaymentForm as ReturnType<typeof vi.fn>).mockReturnValue({
      success: false,
      errors: [{ field: 'amount', message: 'Amount is required' }],
    });

    const user = userEvent.setup();
    renderPaymentPage();

    // Type a value to pass HTML5 required/min constraints, then custom validation catches it
    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '1.00');

    const submitBtn = screen.getByRole('button', { name: /continue to payment/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
    });
  });

  it('navigates to checkout on valid submission', async () => {
    const user = userEvent.setup();
    renderPaymentPage();

    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '25.00');

    const submitBtn = screen.getByRole('button', { name: /continue to payment/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/checkout', expect.any(Object));
    });
  });

  it('stores payment data in sessionStorage', async () => {
    const user = userEvent.setup();
    renderPaymentPage();

    const amountInput = screen.getByLabelText(/amount/i);
    await user.clear(amountInput);
    await user.type(amountInput, '50.00');

    const submitBtn = screen.getByRole('button', { name: /continue to payment/i });
    await user.click(submitBtn);

    await waitFor(() => {
      const stored = sessionStorage.getItem('paymentInfo');
      expect(stored).toBeTruthy();
      const decoded = JSON.parse(atob(stored!));
      expect(decoded.amount).toBe(5000);
    });
  });
});
