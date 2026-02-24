import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'node',
    globals: true,
    testTimeout: 10000,
    hookTimeout: 10000,
    retry: process.env.CI ? 2 : 0,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/test/setup.ts'],
    server: {
      deps: {
        inline: ['@exodus/bytes'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: [
        // Business logic — unit tested
        'src/lib/analytics/**',
        'src/lib/api/**',
        'src/lib/logger.ts',
        'src/lib/rate-limit.ts',
        'src/lib/subscription.ts',
        'src/lib/email.ts',
        'src/lib/utils/**',
        // API routes — unit tested
        'src/app/api/**',
        // UI components — component tested
        'src/components/ui/**',
        'src/components/layout/**',
      ],
      exclude: [
        'src/lib/data/**',
        'src/types/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        'src/test/**',
        'src/instrumentation*.ts',
        'src/sentry*.ts',
        // Large analytics engines without dedicated tests (covered by E2E)
        'src/lib/analytics/device-market-sizing.ts',
        'src/lib/analytics/nutraceutical-market-sizing.ts',
        // Infrastructure files (config, not logic)
        'src/lib/utils/sentry.ts',
        'src/lib/utils/api.ts',
        'src/lib/redis.ts',
        'src/lib/usage.ts',
        // API routes without dedicated test files
        'src/app/api/reports/**',
        'src/app/api/alerts/**',
        'src/app/api/usage/**',
        'src/app/api/stripe/checkout/**',
        'src/app/api/stripe/portal/**',
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 65,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
