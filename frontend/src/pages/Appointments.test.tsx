/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Appointments from './Appointments';

// Mock API
const mockGet = vi.fn();
const mockPost = vi.fn();
vi.mock('../services/api', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  },
  ApiError: class extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ApiError';
    }
  },
}));

// Mock Toast
const mockShowToast = vi.fn();
vi.mock('../components/Toast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

// Mock ConfirmDialog
vi.mock('../components/ConfirmDialog', () => ({
  useConfirm: () => vi.fn().mockResolvedValue(true),
}));

// Mock Stripe
vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useStripe: () => null,
  useElements: () => null,
  PaymentElement: () => <div data-testid="stripe-payment-element" />,
}));

vi.mock('../lib/stripe', () => ({
  stripePromise: Promise.resolve(null),
}));

function renderAppointments() {
  return render(<Appointments />);
}

const mockProviders = [
  {
    id: 'p1',
    name: 'Dr. Smith',
    specialty: 'Cardiology',
    consultationFee: 150,
    acceptsPayments: true,
  },
  {
    id: 'p2',
    name: 'Dr. Jones',
    specialty: 'Dermatology',
    consultationFee: 100,
    acceptsPayments: true,
  },
];

const mockAppointments = [
  {
    id: 'a1',
    date: '2026-04-01',
    time: '09:00',
    duration: 30,
    reason: 'Checkup',
    status: 'confirmed',
    paymentStatus: 'paid',
    provider: { id: 'p1', business_name: 'Dr. Smith', specialty: 'Cardiology' },
  },
];

describe('Appointments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/appointments/providers') && !url.includes('/availability')) {
        return Promise.resolve({ providers: mockProviders });
      }
      if (url.includes('/my-appointments')) {
        return Promise.resolve({ appointments: mockAppointments });
      }
      if (url.includes('/availability')) {
        return Promise.resolve({
          slots: [
            { time: '09:00', available: true },
            { time: '10:00', available: true },
            { time: '11:00', available: false },
          ],
        });
      }
      return Promise.resolve({});
    });
  });

  it('loads and displays providers', async () => {
    renderAppointments();
    await waitFor(() => {
      // Dr. Smith appears in both appointments and providers sections
      expect(screen.getAllByText(/Dr\. Smith/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Dr\. Jones/)).toBeInTheDocument();
    });
  });

  it('loads and displays upcoming appointments', async () => {
    renderAppointments();
    await waitFor(() => {
      expect(screen.getByText(/Checkup/i)).toBeInTheDocument();
    });
  });

  it('shows error when providers fail to load', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/appointments/providers') && !url.includes('/availability')) {
        return Promise.reject(new Error('Network error'));
      }
      if (url.includes('/my-appointments')) {
        return Promise.resolve({ appointments: [] });
      }
      return Promise.resolve({});
    });
    renderAppointments();
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringMatching(/failed|error|network/i),
        'error'
      );
    });
  });

  it('selects a provider and shows booking step', async () => {
    const user = userEvent.setup();
    renderAppointments();

    await waitFor(() => {
      expect(screen.getAllByText(/Dr\. Smith/).length).toBeGreaterThanOrEqual(1);
    });

    // Provider cards are divs with onClick — click the provider name in the providers section
    const drSmithElements = screen.getAllByText(/Dr\. Smith/);
    // Click the last one (provider card, after appointments section)
    await user.click(drSmithElements[drSmithElements.length - 1]);

    await waitFor(() => {
      expect(screen.getByText(/select date/i)).toBeInTheDocument();
    });
  });
});
