/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PaymentForm } from './PaymentForm';

// Mock Stripe hooks
const mockConfirmPayment = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockStripe: any = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mockElements: any = {};

vi.mock('@stripe/react-stripe-js', () => ({
  PaymentElement: ({ onReady }: { onReady?: () => void }) => {
    // Auto-call onReady to enable the submit button
    if (onReady) setTimeout(onReady, 0);
    return <div data-testid="payment-element" />;
  },
  useStripe: () => mockStripe,
  useElements: () => mockElements,
}));

vi.mock('../utils/validation', async () => {
  const actual = await vi.importActual<typeof import('../utils/validation')>('../utils/validation');
  return actual;
});

describe('PaymentForm', () => {
  const defaultProps = {
    amount: 5000, // $50.00
    onSuccess: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStripe = { confirmPayment: mockConfirmPayment };
    mockElements = {};
  });

  it('renders payment summary with formatted amount', () => {
    render(<PaymentForm {...defaultProps} />);
    expect(screen.getByText('Payment Summary')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('renders PaymentElement', async () => {
    render(<PaymentForm {...defaultProps} />);
    expect(screen.getByTestId('payment-element')).toBeInTheDocument();
  });

  it('disables submit button when stripe is not loaded', () => {
    mockStripe = null;
    render(<PaymentForm {...defaultProps} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('shows validation error for invalid amount', () => {
    render(<PaymentForm {...defaultProps} amount={-100} />);
    expect(screen.getByText('Amount must be positive')).toBeInTheDocument();
  });

  it('shows validation error for zero amount', () => {
    render(<PaymentForm {...defaultProps} amount={0} />);
    expect(screen.getByText('Amount must be positive')).toBeInTheDocument();
  });

  it('calls onError when stripe returns error', async () => {
    mockConfirmPayment.mockResolvedValue({
      error: { message: 'Card declined' },
    });

    render(<PaymentForm {...defaultProps} />);

    // Wait for PaymentElement onReady to fire
    await vi.waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));

    await vi.waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith('Card declined');
    });
  });

  it('calls onSuccess when payment succeeds', async () => {
    mockConfirmPayment.mockResolvedValue({
      paymentIntent: { status: 'succeeded' },
    });

    render(<PaymentForm {...defaultProps} />);

    await vi.waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));

    await vi.waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled();
      expect(screen.getByText('Payment successful!')).toBeInTheDocument();
    });
  });

  it('shows message for requires_action status', async () => {
    mockConfirmPayment.mockResolvedValue({
      paymentIntent: { status: 'requires_action' },
    });

    render(<PaymentForm {...defaultProps} />);

    await vi.waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));

    await vi.waitFor(() => {
      expect(screen.getByText('Additional authentication required')).toBeInTheDocument();
    });
  });

  it('handles thrown exceptions during payment', async () => {
    mockConfirmPayment.mockRejectedValue(new Error('Network timeout'));

    render(<PaymentForm {...defaultProps} />);

    await vi.waitFor(() => {
      expect(screen.getByRole('button')).not.toBeDisabled();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('button'));

    await vi.waitFor(() => {
      expect(defaultProps.onError).toHaveBeenCalledWith('Network timeout');
    });
  });

  it('formats different amounts correctly', () => {
    const { rerender } = render(<PaymentForm {...defaultProps} amount={100} />);
    expect(screen.getByText('$1.00')).toBeInTheDocument();

    rerender(<PaymentForm {...defaultProps} amount={99999} />);
    expect(screen.getByText('$999.99')).toBeInTheDocument();
  });
});
