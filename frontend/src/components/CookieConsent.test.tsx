/// <reference types="@testing-library/jest-dom/vitest" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CookieConsent, OPEN_COOKIE_PREFS_EVENT } from './CookieConsent';

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows banner when no consent is stored', () => {
    render(<CookieConsent />);
    expect(screen.getByText('We use cookies')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /cookie consent/i })).toBeInTheDocument();
  });

  it('hides banner when consent is already stored', () => {
    localStorage.setItem(
      'adv_cookie_consent',
      JSON.stringify({ analytics: true, preferences: true, marketing: false })
    );
    render(<CookieConsent />);
    expect(screen.queryByText('We use cookies')).not.toBeInTheDocument();
  });

  it('saves all cookies when Accept all is clicked', async () => {
    render(<CookieConsent />);
    const user = userEvent.setup();

    await user.click(screen.getByText('Accept all'));

    const stored = JSON.parse(localStorage.getItem('adv_cookie_consent')!);
    expect(stored.analytics).toBe(true);
    expect(stored.preferences).toBe(true);
    expect(stored.marketing).toBe(false);
    // Banner should hide
    expect(screen.queryByText('We use cookies')).not.toBeInTheDocument();
  });

  it('saves rejected cookies when Reject optional is clicked', async () => {
    render(<CookieConsent />);
    const user = userEvent.setup();

    await user.click(screen.getByText('Reject optional'));

    const stored = JSON.parse(localStorage.getItem('adv_cookie_consent')!);
    expect(stored.analytics).toBe(false);
    expect(stored.preferences).toBe(false);
    expect(stored.marketing).toBe(false);
  });

  it('expands preferences when Customise is clicked', async () => {
    render(<CookieConsent />);
    const user = userEvent.setup();

    await user.click(screen.getByText('Customise'));

    expect(screen.getByText('Strictly Necessary')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  it('disables necessary cookie toggle', async () => {
    render(<CookieConsent />);
    const user = userEvent.setup();
    await user.click(screen.getByText('Customise'));

    const necessaryToggle = screen.getByRole('button', { name: /always on strictly necessary/i });
    expect(necessaryToggle).toBeDisabled();
  });

  it('allows toggling analytics cookie', async () => {
    render(<CookieConsent />);
    const user = userEvent.setup();
    await user.click(screen.getByText('Customise'));

    const analyticsToggle = screen.getByRole('button', { name: /disable analytics/i });
    await user.click(analyticsToggle);

    // Now save and verify analytics was toggled off
    await user.click(screen.getByText('Save my preferences'));

    const stored = JSON.parse(localStorage.getItem('adv_cookie_consent')!);
    expect(stored.analytics).toBe(false);
  });

  it('re-opens banner on custom event', async () => {
    localStorage.setItem(
      'adv_cookie_consent',
      JSON.stringify({ analytics: true, preferences: true, marketing: false })
    );
    render(<CookieConsent />);

    // Banner should be hidden
    expect(screen.queryByText('We use cookies')).not.toBeInTheDocument();

    // Dispatch the re-open event
    window.dispatchEvent(new Event(OPEN_COOKIE_PREFS_EVENT));

    await waitFor(() => {
      expect(screen.getByText('We use cookies')).toBeInTheDocument();
    });
  });

  it('contains a link to the cookie policy', () => {
    render(<CookieConsent />);
    const link = screen.getByRole('link', { name: /learn more/i });
    expect(link).toHaveAttribute('href', '/policy#cookies');
  });
});
