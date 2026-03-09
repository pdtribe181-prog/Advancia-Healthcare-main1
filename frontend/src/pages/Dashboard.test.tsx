/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Dashboard } from './Dashboard';

// Mock api module
const mockGet = vi.fn();
vi.mock('../services/api', () => ({
  api: { get: (...args: unknown[]) => mockGet(...args) },
}));

// Mock auth context
let mockUser: { email: string; role?: string } | null = null;
let mockAuthLoading = false;
vi.mock('../providers/AuthProvider', () => ({
  useAuth: () => ({
    user: mockUser,
    loading: mockAuthLoading,
  }),
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { email: 'test@example.com' };
    mockAuthLoading = false;
    // Default: resolve both API calls successfully
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/transactions')) {
        return Promise.resolve({ success: true, data: [] });
      }
      if (url.includes('/wallet/list')) {
        return Promise.resolve({ success: true, data: [] });
      }
      return Promise.resolve({ success: true, data: [] });
    });
  });

  it('does not fetch data while auth is loading', () => {
    mockAuthLoading = true;
    mockUser = null;
    renderDashboard();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('renders greeting with user name after loading', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, test/)).toBeInTheDocument();
    });
  });

  it('shows quick action buttons', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Make Payment')).toBeInTheDocument();
      expect(screen.getByText('Withdraw')).toBeInTheDocument();
      expect(screen.getByText('Appointments')).toBeInTheDocument();
    });
  });

  it('shows error alert when both API calls fail', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/unable to load dashboard data/i)).toBeInTheDocument();
    });
  });

  it('renders recent transactions when data is returned', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/transactions')) {
        return Promise.resolve({
          success: true,
          data: [
            { id: 'tx1', amount: 5000, status: 'completed', type: 'payment', created_at: '2025-01-01T00:00:00Z' },
          ],
        });
      }
      return Promise.resolve({ success: true, data: [] });
    });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/-?\$50\.00/)).toBeInTheDocument();
    });
  });

  it('shows linked wallets section', async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.includes('/wallet/list')) {
        return Promise.resolve({
          success: true,
          data: [
            { id: 'w1', walletAddress: '0xabc123', network: 'Ethereum', label: 'Main', verificationStatus: 'verified', isPrimaryPayout: true, payoutEnabled: true, payoutCurrency: 'ETH' },
          ],
        });
      }
      return Promise.resolve({ success: true, data: [] });
    });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/linked wallets/i)).toBeInTheDocument();
    });
  });
});
