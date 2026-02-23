import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the resend module before importing
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'test-id' }, error: null }),
    },
  })),
}));

// Mock the logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('sendEmail', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('returns error when RESEND_API_KEY is not set', async () => {
    // Ensure no API key
    delete process.env.RESEND_API_KEY;

    const { sendEmail } = await import('../email');

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      react: null as unknown as React.ReactElement,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('RESEND_API_KEY');
  });

  it('does not throw on any input', async () => {
    delete process.env.RESEND_API_KEY;

    const { sendEmail } = await import('../email');

    // Should never throw — always returns an error object
    await expect(
      sendEmail({
        to: '',
        subject: '',
        react: null as unknown as React.ReactElement,
      })
    ).resolves.toBeDefined();
  });
});
