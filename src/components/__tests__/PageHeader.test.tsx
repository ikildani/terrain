// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PageHeader } from '@/components/layout/PageHeader';

describe('PageHeader', () => {
  it('renders title and subtitle', () => {
    render(<PageHeader title="Market Sizing" subtitle="Quantify your opportunity" />);
    expect(screen.getByText('Market Sizing')).toBeInTheDocument();
    expect(screen.getByText('Quantify your opportunity')).toBeInTheDocument();
  });

  it('renders without subtitle', () => {
    render(<PageHeader title="Competitive Landscape" />);
    expect(screen.getByText('Competitive Landscape')).toBeInTheDocument();
    // subtitle paragraph should not be in the document
    expect(screen.queryByText('Quantify your opportunity')).not.toBeInTheDocument();
  });

  it('renders with actions slot', () => {
    render(<PageHeader title="Pipeline Intelligence" actions={<button>Export</button>} />);
    expect(screen.getByText('Pipeline Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders a badge when provided', () => {
    render(<PageHeader title="Partner Discovery" badge="Pro" />);
    expect(screen.getByText('Partner Discovery')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
  });

  it('renders title as an h1 element', () => {
    render(<PageHeader title="Dashboard" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Dashboard');
  });
});
