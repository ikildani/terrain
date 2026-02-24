// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('renders with text content', () => {
    render(<Badge>Approved</Badge>);
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('applies the default teal variant classes', () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText('Default');
    expect(badge).toHaveClass('badge');
    expect(badge).toHaveClass('badge-teal');
  });

  it('applies the pro variant class', () => {
    render(<Badge variant="pro">Pro</Badge>);
    const badge = screen.getByText('Pro');
    expect(badge).toHaveClass('badge');
    expect(badge).toHaveClass('badge-pro');
  });

  it('applies the green variant class', () => {
    render(<Badge variant="green">Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge).toHaveClass('badge-green');
  });

  it('applies the amber variant class', () => {
    render(<Badge variant="amber">Warning</Badge>);
    const badge = screen.getByText('Warning');
    expect(badge).toHaveClass('badge-amber');
  });

  it('applies the red variant class', () => {
    render(<Badge variant="red">Risk</Badge>);
    const badge = screen.getByText('Risk');
    expect(badge).toHaveClass('badge-red');
  });

  it('applies phase badge classes', () => {
    render(<Badge variant="phase-3">Phase 3</Badge>);
    const badge = screen.getByText('Phase 3');
    expect(badge).toHaveClass('phase-badge');
    expect(badge).toHaveClass('phase-3');
  });

  it('applies additional className', () => {
    render(<Badge className="ml-2">Extra</Badge>);
    const badge = screen.getByText('Extra');
    expect(badge.className).toContain('ml-2');
  });

  it('renders as a span element', () => {
    render(<Badge>Span</Badge>);
    const badge = screen.getByText('Span');
    expect(badge.tagName).toBe('SPAN');
  });
});
