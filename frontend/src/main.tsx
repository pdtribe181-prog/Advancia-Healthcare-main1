import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { StripeProvider } from './providers/StripeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { ConfirmProvider } from './components/ConfirmDialog';
import { initSentry, SentryErrorBoundary } from './lib/sentry';
import './styles.css';

// Validate required environment variables
const requiredEnvVars = [
  'VITE_API_URL',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

const missingVars = requiredEnvVars.filter((key) => !import.meta.env[key]);
if (missingVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingVars.join(', ')}. ` +
      'Check frontend/.env or your deployment config.'
  );
}

// Initialize Sentry before rendering
initSentry({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SentryErrorBoundary fallback={<ErrorBoundary><div /></ErrorBoundary>}>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <StripeProvider>
              <ToastProvider>
                <ConfirmProvider>
                  <App />
                </ConfirmProvider>
              </ToastProvider>
            </StripeProvider>
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </SentryErrorBoundary>
  </React.StrictMode>
);
