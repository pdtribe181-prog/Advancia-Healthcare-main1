/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StripeProvider } from './StripeProvider';

// Mock stripe-js — loadStripe returns a Promise resolving to null in tests
vi.mock('../lib/stripe', () => ({
  stripePromise: Promise.resolve(null),
}));

// Mock @stripe/react-stripe-js Elements to capture props
const mockElements = vi.fn();
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children, options }: { children: React.ReactNode; options: unknown }) => {
    mockElements(options);
    return <div data-testid="stripe-elements">{children}</div>;
  },
}));

describe('StripeProvider', () => {
  it('renders children inside Stripe Elements', () => {
    render(
      <StripeProvider>
        <div>Payment content</div>
      </StripeProvider>
    );
    expect(screen.getByText('Payment content')).toBeInTheDocument();
    expect(screen.getByTestId('stripe-elements')).toBeInTheDocument();
  });

  it('passes correct theme options to Elements', () => {
    render(
      <StripeProvider>
        <div>Child</div>
      </StripeProvider>
    );

    expect(mockElements).toHaveBeenCalledWith(
      expect.objectContaining({
        appearance: expect.objectContaining({
          theme: 'stripe',
          variables: expect.objectContaining({
            colorPrimary: '#0066cc',
            borderRadius: '8px',
          }),
        }),
      })
    );
  });

  it('renders multiple children', () => {
    render(
      <StripeProvider>
        <div>Child 1</div>
        <div>Child 2</div>
      </StripeProvider>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });
});
