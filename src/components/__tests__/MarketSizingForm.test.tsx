// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock child components with heavy dependencies
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
      <label htmlFor={`mock-fuzzy-${label}`}>{label}</label>
      <input
        id={`mock-fuzzy-${label}`}
        data-testid={`fuzzy-input-${label}`}
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

vi.mock('@/lib/data/suggestion-lists', () => ({
  MECHANISM_SUGGESTIONS: [],
  POPULAR_MECHANISMS: [],
  PATIENT_SEGMENT_SUGGESTIONS: [],
  POPULAR_SEGMENTS: [],
  PROCEDURE_SUGGESTIONS: [],
  POPULAR_PROCEDURES: [],
  SPECIALTY_SUGGESTIONS: [],
  BIOMARKER_SUGGESTIONS: [],
  POPULAR_BIOMARKERS: [],
  SUBTYPE_SUGGESTIONS: [],
  POPULAR_SUBTYPES: [],
  BIOMARKER_PREVALENCE: {},
}));

vi.mock('@/lib/data/nutraceutical-data', () => ({
  INGREDIENT_SUGGESTIONS: [],
  POPULAR_INGREDIENTS: [],
  HEALTH_FOCUS_SUGGESTIONS: [],
  NUTRACEUTICAL_CATEGORY_OPTIONS: [{ value: 'dietary_supplement', label: 'Dietary Supplement' }],
  NUTRACEUTICAL_CHANNEL_OPTIONS: [{ value: 'dtc_ecommerce', label: 'DTC eCommerce' }],
  CLAIM_TYPE_OPTIONS: [{ value: 'structure_function', label: 'Structure/Function' }],
  NUTRACEUTICAL_STAGES: [
    { value: 'market_ready', label: 'Market Ready' },
    { value: 'formulation', label: 'Formulation' },
  ],
}));

import MarketSizingForm from '@/components/market-sizing/MarketSizingForm';

describe('MarketSizingForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders the form', () => {
    render(<MarketSizingForm onSubmit={mockOnSubmit} isLoading={false} />);
    // The form should be in the document
    expect(screen.getByText('Product Category')).toBeInTheDocument();
  });

  it('shows product type selector', () => {
    render(<MarketSizingForm onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByTestId('product-type-selector')).toBeInTheDocument();
  });

  it('has geography checkboxes (US selected by default)', () => {
    render(<MarketSizingForm onSubmit={mockOnSubmit} isLoading={false} />);
    // The GeographyGrid renders the "Geographies" label
    expect(screen.getByText('Geographies')).toBeInTheDocument();
    // US should be present as text
    expect(screen.getByText('US')).toBeInTheDocument();
  });

  it('has development stage selector', () => {
    render(<MarketSizingForm onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByText('Development Stage')).toBeInTheDocument();
    // The PillSelector renders stage buttons
    expect(screen.getByText('Phase 2')).toBeInTheDocument();
    expect(screen.getByText('Preclinical')).toBeInTheDocument();
    expect(screen.getByText('Approved')).toBeInTheDocument();
  });

  it('disables submit when loading', () => {
    render(<MarketSizingForm onSubmit={mockOnSubmit} isLoading={true} />);
    // The Button component renders with disabled when isLoading=true
    const submitButton = screen.getByRole('button', { name: /generate analysis/i });
    expect(submitButton).toBeDisabled();
  });

  it('shows Generate Analysis button text when not loading', () => {
    render(<MarketSizingForm onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByRole('button', { name: /generate analysis/i })).toBeInTheDocument();
  });

  it('shows the Indication field for pharma mode', () => {
    render(<MarketSizingForm onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByText('Indication')).toBeInTheDocument();
  });

  it('shows Pricing Assumption cards', () => {
    render(<MarketSizingForm onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByText('Pricing Assumption')).toBeInTheDocument();
    expect(screen.getByText('Conservative')).toBeInTheDocument();
    expect(screen.getByText('Base')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
  });
});
