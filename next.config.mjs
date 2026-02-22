import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Upload source maps for readable stack traces in Sentry
  silent: !process.env.CI,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps when auth token is available (CI/Vercel)
  disableSourceMapUpload: !process.env.SENTRY_AUTH_TOKEN,

  // Hide source maps from users (uploaded to Sentry only)
  hideSourceMaps: true,

  // Automatically associate commits with releases
  automaticVercelMonitors: true,

  // Widen the upload scope to include all chunks
  widenClientFileUpload: true,

  // Route handler + middleware instrumentation
  tunnelRoute: '/monitoring',

  // Disable the Sentry telemetry logger in builds
  disableLogger: true,
});
