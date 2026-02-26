'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          backgroundColor: '#04080F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '3.75rem',
              fontWeight: 400,
              color: '#F0F4F8',
              marginBottom: '1rem',
            }}
          >
            500
          </h1>
          <p
            style={{
              color: '#94A3B8',
              fontSize: '1.125rem',
              marginBottom: '2rem',
            }}
          >
            Something went wrong.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: '#00C9A7',
              color: '#04080F',
              border: 'none',
              padding: '0.625rem 1.5rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
