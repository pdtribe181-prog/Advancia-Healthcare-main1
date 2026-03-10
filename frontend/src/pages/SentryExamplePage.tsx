/**
 * Sentry Verification Page — triggers a deliberate error to confirm Sentry captures it.
 * Remove this page once verified in your Sentry dashboard.
 */
export function SentryExamplePage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Sentry Test Page</h1>
      <p>
        Click the button below to trigger a <code>myUndefinedFunction()</code> call. This
        deliberate error should appear in your{' '}
        <a href="https://sentry.io/issues/" target="_blank" rel="noopener noreferrer">
          Sentry Issues dashboard
        </a>{' '}
        within ~30 seconds.
      </p>
      <button
        type="button"
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#e74c3c',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          marginTop: '1rem',
        }}
        onClick={() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).myUndefinedFunction();
        }}
      >
        Throw Test Error
      </button>
    </div>
  );
}
