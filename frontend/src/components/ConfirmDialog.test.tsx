/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog, ConfirmProvider, useConfirm } from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: 'Delete Item',
    message: 'Are you sure you want to delete this?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when isOpen is true', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this?')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(defaultProps.onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(defaultProps.onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel on Escape key', async () => {
    render(<ConfirmDialog {...defaultProps} />);
    const user = userEvent.setup();
    await user.keyboard('{Escape}');
    expect(defaultProps.onCancel).toHaveBeenCalledOnce();
  });

  it('does not call onCancel on Escape when loading', async () => {
    render(<ConfirmDialog {...defaultProps} isLoading />);
    const user = userEvent.setup();
    await user.keyboard('{Escape}');
    expect(defaultProps.onCancel).not.toHaveBeenCalled();
  });

  it('renders custom button text', () => {
    render(<ConfirmDialog {...defaultProps} confirmText="Yes, delete" cancelText="No, keep" />);
    expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No, keep' })).toBeInTheDocument();
  });

  it('disables cancel button when loading', () => {
    render(<ConfirmDialog {...defaultProps} isLoading />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });

  it('has correct ARIA attributes', () => {
    render(<ConfirmDialog {...defaultProps} />);
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'confirm-dialog-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'confirm-dialog-message');
  });
});

describe('ConfirmProvider + useConfirm', () => {
  function TestConsumer() {
    const confirm = useConfirm();

    const handleClick = async () => {
      const result = await confirm({
        title: 'Test Confirm',
        message: 'Do you agree?',
        confirmText: 'Yes',
      });
      // Store result in DOM for assertion
      document.title = result ? 'confirmed' : 'cancelled';
    };

    return <button onClick={handleClick}>Open Confirm</button>;
  }

  it('resolves true when confirmed', async () => {
    render(
      <ConfirmProvider>
        <TestConsumer />
      </ConfirmProvider>
    );

    const user = userEvent.setup();
    await user.click(screen.getByText('Open Confirm'));

    await waitFor(() => {
      expect(screen.getByText('Do you agree?')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(document.title).toBe('confirmed');
    });
  });

  it('resolves false when cancelled', async () => {
    render(
      <ConfirmProvider>
        <TestConsumer />
      </ConfirmProvider>
    );

    const user = userEvent.setup();
    await user.click(screen.getByText('Open Confirm'));

    await waitFor(() => {
      expect(screen.getByText('Do you agree?')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(document.title).toBe('cancelled');
    });
  });

  it('throws when useConfirm is used outside provider', () => {
    function BadConsumer() {
      useConfirm();
      return null;
    }

    expect(() => render(<BadConsumer />)).toThrow(
      'useConfirm must be used within a ConfirmProvider'
    );
  });
});
