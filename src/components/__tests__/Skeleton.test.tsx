// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SkeletonCard, SkeletonMetric, Skeleton } from '@/components/ui/Skeleton';

describe('Skeleton', () => {
  it('renders with the skeleton class', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('skeleton');
  });

  it('accepts a custom className', () => {
    const { container } = render(<Skeleton className="h-8 w-32" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('skeleton');
    // The cn utility merges classes; check for at least one custom class token
    expect(el.className).toContain('h-8');
  });
});

describe('SkeletonCard', () => {
  it('renders with default card styling', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.firstChild as HTMLElement;
    // SkeletonCard wraps inner Skeleton children in a div with card classes
    expect(card.className).toContain('card');
  });

  it('renders three inner skeleton bars', () => {
    const { container } = render(<SkeletonCard />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons.length).toBe(3);
  });

  it('renders with custom className', () => {
    const { container } = render(<SkeletonCard className="h-64" />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('h-64');
  });
});

describe('SkeletonMetric', () => {
  it('renders with stat-card class', () => {
    const { container } = render(<SkeletonMetric />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('stat-card');
  });

  it('renders three inner skeleton bars', () => {
    const { container } = render(<SkeletonMetric />);
    const skeletons = container.querySelectorAll('.skeleton');
    expect(skeletons.length).toBe(3);
  });
});
