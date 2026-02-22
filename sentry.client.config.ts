import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // ── Performance monitoring ──────────────────────────────────
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // ── Session replay (capture errors in full context) ─────────
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    // Web Vitals (LCP, FID, CLS, TTFB, INP)
    Sentry.browserTracingIntegration({
      enableInp: true,
    }),
    // Capture console.error as breadcrumbs
    Sentry.captureConsoleIntegration({ levels: ['error'] }),
    // Session replay on errors
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // ── Error filtering ─────────────────────────────────────────
  ignoreErrors: [
    // Browser extensions and noise
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    // Network errors (user's connection, not our fault)
    'Failed to fetch',
    'NetworkError',
    'Load failed',
    // Auth redirects (expected)
    'NEXT_REDIRECT',
  ],

  // ── Release tracking ────────────────────────────────────────
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 'development',

  // ── Before send hook (PII scrubbing) ────────────────────────
  beforeSend(event) {
    // Strip email/user data from error reports for GDPR compliance
    if (event.user) {
      delete event.user.email;
      delete event.user.username;
    }
    return event;
  },

  // ── Breadcrumb filtering ────────────────────────────────────
  beforeBreadcrumb(breadcrumb) {
    // Don't capture UI click breadcrumbs (noisy)
    if (breadcrumb.category === 'ui.click') return null;
    return breadcrumb;
  },
});
