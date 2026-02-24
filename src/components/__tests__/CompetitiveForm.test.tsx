// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the child components that have heavy dependencies
vi.mock('@/components/ui/IndicationAutocomplete', () => ({
  IndicationAutocomplete: ({
    value,
    onChange,
    label,
    placeholder,
    error,
  }: {
    value: string;
    onChange: (v: string) => void;
    label?: string;
    placeholder?: string;
    error?: string;
  }) => (
    <div>
      {label && <label htmlFor="mock-indication">{label}</label>}
      <input
        id="mock-indication"
        data-testid="indication-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {error && <p role="alert">{error}</p>}
    </div>
  ),
}));

vi.mock('@/components/ui/FuzzyAutocomplete', () => ({
  FuzzyAutocomplete: ({
    value,
    onChange,
    label,
    placeholder,
  }: {
    value: string;
    onChange: (v: string) => void;
    label: string;
    placeholder?: string;
  }) => (
    <div>
      <label htmlFor="mock-fuzzy">{label}</label>
      <input
        id="mock-fuzzy"
        data-testid="fuzzy-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  ),
}));

vi.mock('@/components/shared/ProductTypeSelector', () => ({
  ProductTypeSelector: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div data-testid="product-type-selector">
      <label>Product Category</label>
      <select data-testid="product-category-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="pharmaceutical">Pharmaceutical</option>
        <option value="device_implantable">Device - Implantable</option>
        <option value="diagnostics_companion">Companion Diagnostic</option>
        <option value="nutraceutical">Nutraceutical</option>
      </select>
    </div>
  ),
}));

vi.mock('@/lib/data/competitor-database', () => ({
  getCoveredIndications: () => new Set(['Non-Small Cell Lung Cancer']),
}));

vi.mock('@/lib/data/suggestion-lists', () => ({
  MECHANISM_SUGGESTIONS: [],
  POPULAR_MECHANISMS: [],
}));

vi.mock('@/lib/data/device-competitor-database', () => ({
  getCoveredProcedures: () => ['TAVR'],
}));

vi.mock('@/lib/data/cdx-competitor-database', () => ({
  getCoveredBiomarkers: () => ['EGFR'],
}));

// Import the component after mocks are set up
import CompetitiveForm from '@/components/competitive/CompetitiveForm';

describe('CompetitiveForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the form with product type selector', () => {
    render(<CompetitiveForm onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByTestId('product-type-selector')).toBeInTheDocument();
    expect(screen.getByText('Product Category')).toBeInTheDocument();
  });

  it('shows pharma fields by default (indication input)', () => {
    render(<CompetitiveForm onSubmit={mockOnSubmit} isLoading={false} />);
    // Default category is pharmaceutical, so Indication label should show
    expect(screen.getByText('Indication')).toBeInTheDocument();
    expect(screen.getByTestId('indication-input')).toBeInTheDocument();
  });

  it('calls onSubmit with form data when indication is filled', async () => {
    render(<CompetitiveForm onSubmit={mockOnSubmit} isLoading={false} />);

    // Fill in the indication field
    const indicationInput = screen.getByTestId('indication-input');
    fireEvent.change(indicationInput, { target: { value: 'Non-Small Cell Lung Cancer' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /map landscape/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          product_category: 'pharmaceutical',
          indication: 'Non-Small Cell Lung Cancer',
        }),
      );
    });
  });

  it('shows loading state when isLoading=true', () => {
    render(<CompetitiveForm onSubmit={mockOnSubmit} isLoading={true} />);
    expect(screen.getByText('Mapping Landscape...')).toBeInTheDocument();
  });

  it('disables submit button when isLoading', () => {
    render(<CompetitiveForm onSubmit={mockOnSubmit} isLoading={true} />);
    const button = screen.getByRole('button', { name: /mapping landscape/i });
    expect(button).toBeDisabled();
  });

  it('shows "Map Landscape" text when not loading', () => {
    render(<CompetitiveForm onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByText('Map Landscape')).toBeInTheDocument();
  });
});
