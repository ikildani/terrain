import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // ── Performance monitoring ──────────────────────────────────
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // ── Release tracking ────────────────────────────────────────
  release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

  // ── Server-side integrations ────────────────────────────────
  integrations: [
    // Automatically instrument HTTP requests
    Sentry.httpIntegration(),
  ],

  // ── Error filtering ─────────────────────────────────────────
  ignoreErrors: [
    'NEXT_REDIRECT',
    'NEXT_NOT_FOUND',
  ],

  // ── Before send (scrub sensitive data) ──────────────────────
  beforeSend(event) {
    // Remove request body from server errors (may contain user data)
    if (event.request?.data) {
      event.request.data = '[Filtered]';
    }
    return event;
  },
});
