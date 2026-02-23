import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatCompact,
  formatPercent,
  formatMetric,
  formatDate,
  formatRelativeDate,
} from '../format';

describe('formatCurrency', () => {
  it('formats whole dollar amounts', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1234567)).toBe('$1,234,567');
  });

  it('formats with decimal places', () => {
    expect(formatCurrency(1234.56, 2)).toBe('$1,234.56');
    expect(formatCurrency(0.5, 2)).toBe('$0.50');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('handles negative values', () => {
    expect(formatCurrency(-500)).toBe('-$500');
  });
});

describe('formatNumber', () => {
  it('formats integers with commas', () => {
    expect(formatNumber(1000000)).toBe('1,000,000');
    expect(formatNumber(42)).toBe('42');
  });

  it('formats with decimal places', () => {
    expect(formatNumber(1234.5678, 2)).toBe('1,234.57');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatCompact', () => {
  it('formats billions', () => {
    expect(formatCompact(1.2e9)).toBe('$1.2B');
    expect(formatCompact(5.67e9)).toBe('$5.7B');
  });

  it('formats millions', () => {
    expect(formatCompact(450e6)).toBe('$450.0M');
    expect(formatCompact(1.5e6)).toBe('$1.5M');
  });

  it('formats thousands', () => {
    expect(formatCompact(12000)).toBe('$12K');
    expect(formatCompact(999000)).toBe('$999K');
  });

  it('formats small values', () => {
    expect(formatCompact(500)).toBe('$500');
    expect(formatCompact(0)).toBe('$0');
  });
});

describe('formatPercent', () => {
  it('formats with default decimals', () => {
    expect(formatPercent(12.345)).toBe('12.3%');
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('formats with custom decimals', () => {
    expect(formatPercent(99.999, 2)).toBe('100.00%');
    expect(formatPercent(0.1, 0)).toBe('0%');
  });
});

describe('formatMetric', () => {
  it('formats with unit suffix', () => {
    expect(formatMetric(4.2, 'B')).toBe('$4.2B');
    expect(formatMetric(150.0, 'M')).toBe('$150.0M');
    expect(formatMetric(12.5, 'K')).toBe('$12.5K');
  });
});

describe('formatDate', () => {
  it('formats ISO date strings', () => {
    // Use midday UTC to avoid timezone boundary issues
    const result = formatDate('2025-06-15T12:00:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });
});

describe('formatRelativeDate', () => {
  it('returns "Today" for current date', () => {
    expect(formatRelativeDate(new Date().toISOString())).toBe('Today');
  });

  it('returns "Yesterday" for one day ago', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString();
    expect(formatRelativeDate(yesterday)).toBe('Yesterday');
  });

  it('returns days ago for recent dates', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
    expect(formatRelativeDate(threeDaysAgo)).toBe('3d ago');
  });

  it('returns weeks ago for older dates', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
    expect(formatRelativeDate(twoWeeksAgo)).toBe('2w ago');
  });

  it('returns months ago for even older dates', () => {
    const threeMonthsAgo = new Date(Date.now() - 90 * 86400000).toISOString();
    expect(formatRelativeDate(threeMonthsAgo)).toBe('3mo ago');
  });

  it('returns years ago for very old dates', () => {
    const twoYearsAgo = new Date(Date.now() - 730 * 86400000).toISOString();
    expect(formatRelativeDate(twoYearsAgo)).toBe('2y ago');
  });
});
