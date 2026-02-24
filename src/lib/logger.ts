/**
 * Lightweight structured JSON logger.
 * Outputs to stdout in JSON format — compatible with Vercel log drains,
 * Datadog, Axiom, or any JSON-based log collector.
 *
 * No external dependencies.
 */

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

function emit(entry: LogEntry) {
  const line = JSON.stringify(entry);
  if (entry.level === 'error') {
    console.error(line);
  } else if (entry.level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    emit({ level: 'info', message, timestamp: new Date().toISOString(), ...meta });
  },

  warn(message: string, meta?: Record<string, unknown>) {
    emit({ level: 'warn', message, timestamp: new Date().toISOString(), ...meta });
  },

  error(message: string, meta?: Record<string, unknown>) {
    emit({ level: 'error', message, timestamp: new Date().toISOString(), ...meta });
  },
};

/**
 * Wrap an async operation with timing instrumentation.
 * Returns the result and logs duration.
 */
export async function withTiming<T>(
  label: string,
  fn: () => Promise<T>,
  meta?: Record<string, unknown>,
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = Math.round(performance.now() - start);
  logger.info(`${label} completed`, { duration_ms: durationMs, ...meta });
  return { result, durationMs };
}

/**
 * Log an API request with common fields. Call at the start of a route handler.
 */
export function logApiRequest(fields: { route: string; method: string; userId?: string; [key: string]: unknown }) {
  logger.info('api_request', fields);
}

/**
 * Log an API response with status and duration.
 */
export function logApiResponse(fields: {
  route: string;
  status: number;
  durationMs: number;
  userId?: string;
  [key: string]: unknown;
}) {
  if (fields.status >= 500) {
    logger.error('api_response', fields);
  } else if (fields.status >= 400) {
    logger.warn('api_response', fields);
  } else {
    logger.info('api_response', fields);
  }
}

// ────────────────────────────────────────────────────────────
// BUSINESS METRICS — structured events for dashboards/alerting
// ────────────────────────────────────────────────────────────

export function logBusinessEvent(
  event: 'analysis_completed' | 'report_saved' | 'subscription_changed' | 'export_generated',
  meta: Record<string, unknown>,
) {
  logger.info(`business:${event}`, { event, ...meta });
}
