import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, withTiming, logApiRequest, logApiResponse } from '@/lib/logger';

// ────────────────────────────────────────────────────────────
// Integration tests for the structured JSON logger.
//
// We spy on console.log, console.warn, and console.error to
// verify the logger emits properly structured JSON to the
// correct output stream based on log level.
// ────────────────────────────────────────────────────────────

describe('logger', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── logger.info ─────────────────────────────────────────

  describe('logger.info()', () => {
    it('should emit JSON to console.log', () => {
      logger.info('test message');
      expect(logSpy).toHaveBeenCalledOnce();
      expect(warnSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should include level, message, and timestamp in JSON output', () => {
      logger.info('hello world');
      const output = logSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('hello world');
      expect(parsed.timestamp).toBeDefined();
      // Validate ISO 8601 format
      expect(new Date(parsed.timestamp).toISOString()).toBe(parsed.timestamp);
    });

    it('should include custom meta fields in JSON output', () => {
      logger.info('user_action', { userId: 'abc-123', action: 'login' });
      const output = logSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.userId).toBe('abc-123');
      expect(parsed.action).toBe('login');
      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('user_action');
    });

    it('should produce valid JSON string', () => {
      logger.info('json test', { nested: { key: 'value' }, count: 42 });
      const output = logSpy.mock.calls[0][0] as string;
      expect(() => JSON.parse(output)).not.toThrow();
    });
  });

  // ── logger.warn ─────────────────────────────────────────

  describe('logger.warn()', () => {
    it('should emit JSON to console.warn', () => {
      logger.warn('warning message');
      expect(warnSpy).toHaveBeenCalledOnce();
      expect(logSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should include level "warn" in JSON output', () => {
      logger.warn('slow query', { durationMs: 5000 });
      const output = warnSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.level).toBe('warn');
      expect(parsed.message).toBe('slow query');
      expect(parsed.durationMs).toBe(5000);
      expect(parsed.timestamp).toBeDefined();
    });
  });

  // ── logger.error ────────────────────────────────────────

  describe('logger.error()', () => {
    it('should emit JSON to console.error', () => {
      logger.error('critical failure');
      expect(errorSpy).toHaveBeenCalledOnce();
      expect(logSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('should include level "error" and custom meta in JSON output', () => {
      logger.error('db_connection_failed', { host: 'db.example.com', retries: 3 });
      const output = errorSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.level).toBe('error');
      expect(parsed.message).toBe('db_connection_failed');
      expect(parsed.host).toBe('db.example.com');
      expect(parsed.retries).toBe(3);
      expect(parsed.timestamp).toBeDefined();
    });
  });

  // ── No meta argument ───────────────────────────────────

  describe('logger methods without meta', () => {
    it('should work without passing meta argument', () => {
      logger.info('no meta');
      const output = logSpy.mock.calls[0][0] as string;
      const parsed = JSON.parse(output);

      expect(parsed.level).toBe('info');
      expect(parsed.message).toBe('no meta');
      expect(parsed.timestamp).toBeDefined();
      // Should only have level, message, timestamp
      expect(Object.keys(parsed)).toEqual(
        expect.arrayContaining(['level', 'message', 'timestamp'])
      );
    });
  });
});

// ────────────────────────────────────────────────────────────
// withTiming()
// ────────────────────────────────────────────────────────────

describe('withTiming()', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return the result of the wrapped function', async () => {
    const { result } = await withTiming('test-op', async () => 42);
    expect(result).toBe(42);
  });

  it('should return a non-negative durationMs', async () => {
    const { durationMs } = await withTiming('test-op', async () => 'hello');
    expect(durationMs).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(durationMs)).toBe(true);
  });

  it('should log a completion message with duration_ms', async () => {
    await withTiming('database_query', async () => 'result');

    expect(logSpy).toHaveBeenCalledOnce();
    const output = logSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('database_query completed');
    expect(parsed.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('should include custom meta in the timing log', async () => {
    await withTiming('api_call', async () => null, { endpoint: '/api/test' });

    const output = logSpy.mock.calls[0][0] as string;
    const parsed = JSON.parse(output);

    expect(parsed.endpoint).toBe('/api/test');
    expect(parsed.duration_ms).toBeGreaterThanOrEqual(0);
  });

  it('should propagate errors from the wrapped function', async () => {
    await expect(
      withTiming('failing_op', async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');
  });

  it('should work with async functions that resolve to complex objects', async () => {
    const data = { users: [{ id: 1 }], total: 1 };
    const { result } = await withTiming('fetch_users', async () => data);
    expect(result).toEqual(data);
  });
});

// ────────────────────────────────────────────────────────────
// logApiRequest()
// ────────────────────────────────────────────────────────────

describe('logApiRequest()', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log with "api_request" message', () => {
    logApiRequest({ route: '/api/analyze/market', method: 'POST' });

    expect(logSpy).toHaveBeenCalledOnce();
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(parsed.message).toBe('api_request');
    expect(parsed.level).toBe('info');
  });

  it('should include route and method in log output', () => {
    logApiRequest({ route: '/api/reports', method: 'GET', userId: 'user-42' });

    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(parsed.route).toBe('/api/reports');
    expect(parsed.method).toBe('GET');
    expect(parsed.userId).toBe('user-42');
  });

  it('should handle additional custom fields', () => {
    logApiRequest({
      route: '/api/analyze/competitive',
      method: 'POST',
      indication: 'NSCLC',
    });

    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(parsed.indication).toBe('NSCLC');
  });
});

// ────────────────────────────────────────────────────────────
// logApiResponse()
// ────────────────────────────────────────────────────────────

describe('logApiResponse()', () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should use info level for 2xx status codes', () => {
    logApiResponse({ route: '/api/test', status: 200, durationMs: 50 });
    expect(logSpy).toHaveBeenCalledOnce();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('api_response');
  });

  it('should use info level for 201 Created', () => {
    logApiResponse({ route: '/api/reports', status: 201, durationMs: 100 });
    expect(logSpy).toHaveBeenCalledOnce();
  });

  it('should use info level for 3xx status codes', () => {
    logApiResponse({ route: '/api/redirect', status: 301, durationMs: 5 });
    expect(logSpy).toHaveBeenCalledOnce();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should use warn level for 4xx status codes', () => {
    logApiResponse({ route: '/api/test', status: 400, durationMs: 10 });
    expect(warnSpy).toHaveBeenCalledOnce();
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    const parsed = JSON.parse(warnSpy.mock.calls[0][0] as string);
    expect(parsed.level).toBe('warn');
    expect(parsed.message).toBe('api_response');
  });

  it('should use warn level for 401 Unauthorized', () => {
    logApiResponse({ route: '/api/protected', status: 401, durationMs: 5 });
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('should use warn level for 403 Forbidden', () => {
    logApiResponse({ route: '/api/admin', status: 403, durationMs: 3 });
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('should use warn level for 404 Not Found', () => {
    logApiResponse({ route: '/api/missing', status: 404, durationMs: 2 });
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('should use warn level for 429 Too Many Requests', () => {
    logApiResponse({ route: '/api/limited', status: 429, durationMs: 1 });
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('should use error level for 5xx status codes', () => {
    logApiResponse({ route: '/api/test', status: 500, durationMs: 150 });
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();

    const parsed = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(parsed.level).toBe('error');
    expect(parsed.message).toBe('api_response');
  });

  it('should use error level for 502 Bad Gateway', () => {
    logApiResponse({ route: '/api/proxy', status: 502, durationMs: 30000 });
    expect(errorSpy).toHaveBeenCalledOnce();
  });

  it('should use error level for 503 Service Unavailable', () => {
    logApiResponse({ route: '/api/down', status: 503, durationMs: 100 });
    expect(errorSpy).toHaveBeenCalledOnce();
  });

  it('should include route, status, and durationMs in the output', () => {
    logApiResponse({ route: '/api/analyze/market', status: 200, durationMs: 1234 });
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);

    expect(parsed.route).toBe('/api/analyze/market');
    expect(parsed.status).toBe(200);
    expect(parsed.durationMs).toBe(1234);
  });

  it('should include userId when provided', () => {
    logApiResponse({
      route: '/api/reports',
      status: 200,
      durationMs: 50,
      userId: 'user-abc',
    });
    const parsed = JSON.parse(logSpy.mock.calls[0][0] as string);
    expect(parsed.userId).toBe('user-abc');
  });

  // Edge case: status exactly at boundary
  it('should use warn level for status 400 (lower boundary of 4xx)', () => {
    logApiResponse({ route: '/api/test', status: 400, durationMs: 1 });
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('should use warn level for status 499 (upper boundary of 4xx)', () => {
    logApiResponse({ route: '/api/test', status: 499, durationMs: 1 });
    expect(warnSpy).toHaveBeenCalledOnce();
  });

  it('should use error level for status 500 (lower boundary of 5xx)', () => {
    logApiResponse({ route: '/api/test', status: 500, durationMs: 1 });
    expect(errorSpy).toHaveBeenCalledOnce();
  });

  it('should use info level for status 399 (upper boundary of 3xx)', () => {
    logApiResponse({ route: '/api/test', status: 399, durationMs: 1 });
    expect(logSpy).toHaveBeenCalledOnce();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
