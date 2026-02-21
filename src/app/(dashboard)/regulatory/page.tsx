'use client';

import { useState } from 'react';
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Loader2,
  FileText,
  Calendar,
  Award,
  Scale,
  ExternalLink,
  Info,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { IndicationAutocomplete } from '@/components/ui/IndicationAutocomplete';
import { SkeletonMetric, SkeletonCard } from '@/components/ui/Skeleton';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiPost } from '@/lib/utils/api';
import { cn } from '@/lib/utils/cn';
import type {
  RegulatoryOutput,
  DesignationOpportunity,
  RegulatoryRisk,
  ComparableApproval,
  RegulatoryAgency,
  DevelopmentStage,
} from '@/types';

// ────────────────────────────────────────────────────────────
// FORM TYPES
// ────────────────────────────────────────────────────────────

interface RegulatoryFormData {
  indication: string;
  product_type: 'pharmaceutical' | 'biologic' | 'device' | 'diagnostic';
  development_stage: DevelopmentStage;
  mechanism: string;
  geography: RegulatoryAgency[];
  unmet_need: 'high' | 'medium' | 'low';
  has_orphan_potential: boolean;
}

// ────────────────────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────────────────────

const PRODUCT_TYPES: { value: RegulatoryFormData['product_type']; label: string }[] = [
  { value: 'pharmaceutical', label: 'Small Molecule' },
  { value: 'biologic', label: 'Biologic' },
  { value: 'device', label: 'Medical Device' },
  { value: 'diagnostic', label: 'Diagnostic / IVD' },
];

const STAGES: { value: DevelopmentStage; label: string }[] = [
  { value: 'preclinical', label: 'Preclinical' },
  { value: 'phase1', label: 'Phase 1' },
  { value: 'phase2', label: 'Phase 2' },
  { value: 'phase3', label: 'Phase 3' },
  { value: 'approved', label: 'Approved' },
];

const GEOGRAPHIES: { value: RegulatoryAgency; label: string; flag: string }[] = [
  { value: 'FDA', label: 'FDA (US)', flag: 'US' },
  { value: 'EMA', label: 'EMA (EU)', flag: 'EU' },
  { value: 'PMDA', label: 'PMDA (Japan)', flag: 'JP' },
];

const UNMET_NEED_OPTIONS: { value: 'high' | 'medium' | 'low'; label: string; description: string }[] = [
  { value: 'high', label: 'High', description: 'No effective treatment or significant gap' },
  { value: 'medium', label: 'Medium', description: 'Some treatments exist but improvements needed' },
  { value: 'low', label: 'Low', description: 'Multiple effective treatments available' },
];

// ────────────────────────────────────────────────────────────
// SKELETON
// ────────────────────────────────────────────────────────────

function ResultsSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonMetric key={i} />
        ))}
      </div>
      <SkeletonCard className="h-[200px]" />
      <SkeletonCard className="h-[280px]" />
      <SkeletonCard className="h-[300px]" />
      <SkeletonCard className="h-[250px]" />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// EMPTY STATE
// ────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="card p-12 text-center flex flex-col items-center">
      <Shield className="w-12 h-12 text-navy-600 mb-4" />
      <h3 className="font-display text-lg text-white mb-2">
        Analyze Your Regulatory Strategy
      </h3>
      <p className="text-sm text-slate-500 max-w-md">
        Enter your product profile to receive pathway recommendations,
        designation eligibility assessment, timeline estimates, comparable
        approval precedents, and risk analysis.
      </p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// FORM COMPONENT
// ────────────────────────────────────────────────────────────

function RegulatoryForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: RegulatoryFormData) => void;
  isLoading: boolean;
}) {
  const [form, setForm] = useState<RegulatoryFormData>({
    indication: '',
    product_type: 'pharmaceutical',
    development_stage: 'phase2',
    mechanism: '',
    geography: ['FDA'],
    unmet_need: 'high',
    has_orphan_potential: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.indication.trim()) errs.indication = 'Indication is required';
    if (form.geography.length === 0) errs.geography = 'Select at least one agency';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onSubmit(form);
    }
  }

  function toggleGeography(agency: RegulatoryAgency) {
    setForm((prev) => ({
      ...prev,
      geography: prev.geography.includes(agency)
        ? prev.geography.filter((g) => g !== agency)
        : [...prev.geography, agency],
    }));
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Indication */}
        <IndicationAutocomplete
          label="Indication"
          value={form.indication}
          onChange={(val) => setForm((prev) => ({ ...prev, indication: val }))}
          error={errors.indication}
          placeholder="e.g., Non-Small Cell Lung Cancer"
        />

        {/* Product Type */}
        <div>
          <label className="input-label">Product Type</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {PRODUCT_TYPES.map((pt) => (
              <button
                key={pt.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, product_type: pt.value }))}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
                  form.product_type === pt.value
                    ? 'bg-teal-500/15 text-teal-400 border-teal-500/30'
                    : 'bg-navy-800 text-slate-400 border-navy-700 hover:border-slate-500',
                )}
              >
                {pt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Development Stage */}
        <div>
          <label className="input-label">Development Stage</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {STAGES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, development_stage: s.value }))}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all border',
                  form.development_stage === s.value
                    ? 'bg-teal-500/15 text-teal-400 border-teal-500/30'
                    : 'bg-navy-800 text-slate-400 border-navy-700 hover:border-slate-500',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mechanism */}
        <div>
          <label htmlFor="mechanism" className="input-label">
            Mechanism of Action (Optional)
          </label>
          <input
            id="mechanism"
            type="text"
            className="input"
            placeholder="e.g., PD-1 inhibitor, KRAS G12C"
            value={form.mechanism}
            onChange={(e) => setForm((prev) => ({ ...prev, mechanism: e.target.value }))}
          />
        </div>

        {/* Geography Multi-Select */}
        <div>
          <label className="input-label">Regulatory Agencies</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {GEOGRAPHIES.map((geo) => (
              <button
                key={geo.value}
                type="button"
                onClick={() => toggleGeography(geo.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all border flex items-center gap-1.5',
                  form.geography.includes(geo.value)
                    ? 'bg-teal-500/15 text-teal-400 border-teal-500/30'
                    : 'bg-navy-800 text-slate-400 border-navy-700 hover:border-slate-500',
                )}
              >
                <span className="font-mono text-[10px] opacity-60">{geo.flag}</span>
                {geo.label}
              </button>
            ))}
          </div>
          {errors.geography && (
            <p className="mt-1.5 text-xs text-signal-red">{errors.geography}</p>
          )}
        </div>

        {/* Unmet Need */}
        <div>
          <label className="input-label">Unmet Medical Need</label>
          <div className="space-y-2 mt-1">
            {UNMET_NEED_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex items-start gap-3 p-2.5 rounded-md cursor-pointer border transition-all',
                  form.unmet_need === opt.value
                    ? 'bg-teal-500/10 border-teal-500/30'
                    : 'bg-navy-800/50 border-transparent hover:border-navy-700',
                )}
              >
                <input
                  type="radio"
                  name="unmet_need"
                  value={opt.value}
                  checked={form.unmet_need === opt.value}
                  onChange={() => setForm((prev) => ({ ...prev, unmet_need: opt.value }))}
                  className="mt-0.5 accent-teal-500"
                />
                <div>
                  <span className="text-xs font-medium text-white">{opt.label}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Orphan Potential Toggle */}
        <div>
          <label
            className={cn(
              'flex items-center gap-3 p-3 rounded-md cursor-pointer border transition-all',
              form.has_orphan_potential
                ? 'bg-teal-500/10 border-teal-500/30'
                : 'bg-navy-800/50 border-transparent hover:border-navy-700',
            )}
          >
            <input
              type="checkbox"
              checked={form.has_orphan_potential}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, has_orphan_potential: e.target.checked }))
              }
              className="accent-teal-500"
            />
            <div>
              <span className="text-xs font-medium text-white">Orphan Drug Potential</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Disease affects fewer than 200,000 US patients per year
              </p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-full">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing Pathways...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4" />
              Analyze Regulatory Strategy
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// RESULTS: PATHWAY CARD
// ────────────────────────────────────────────────────────────

function PathwayCard({
  pathway,
  isPrimary,
}: {
  pathway: RegulatoryOutput['recommended_pathway']['primary'];
  isPrimary: boolean;
}) {
  const [expanded, setExpanded] = useState(isPrimary);

  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-all',
        isPrimary
          ? 'bg-teal-900/20 border-teal-500/30'
          : 'bg-navy-900 border-navy-700 hover:border-navy-600',
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-3">
          {isPrimary && (
            <span className="badge badge-teal text-[10px]">Recommended</span>
          )}
          <h4 className="text-sm font-medium text-white">{pathway.name}</h4>
          <span className="metric text-xs text-slate-400">
            {pathway.typical_review_months}mo review
          </span>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 animate-fade-in">
          <p className="text-xs text-slate-400 leading-relaxed">{pathway.description}</p>

          {pathway.requirements.length > 0 && (
            <div>
              <h5 className="label mb-2">Key Requirements</h5>
              <ul className="space-y-1">
                {pathway.requirements.slice(0, 6).map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <span className="text-teal-500 mt-0.5 shrink-0">-</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {pathway.data_package_requirements.length > 0 && (
            <div>
              <h5 className="label mb-2">Data Package Requirements</h5>
              <ul className="space-y-1">
                {pathway.data_package_requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <FileText className="w-3 h-3 text-slate-600 mt-0.5 shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// RESULTS: DESIGNATION CARD
// ────────────────────────────────────────────────────────────

function DesignationCard({ designation }: { designation: DesignationOpportunity }) {
  const [expanded, setExpanded] = useState(false);

  const badgeClass =
    designation.eligibility === 'likely'
      ? 'badge-green'
      : designation.eligibility === 'possible'
        ? 'badge-amber'
        : 'badge-red';

  const eligibilityLabel =
    designation.eligibility === 'likely'
      ? 'Likely Eligible'
      : designation.eligibility === 'possible'
        ? 'Possibly Eligible'
        : 'Unlikely';

  return (
    <div className="border border-navy-700 rounded-lg p-4 bg-navy-900 hover:border-navy-600 transition-all">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-3">
          <Award className="w-4 h-4 text-slate-500" />
          <h4 className="text-sm font-medium text-white">{designation.designation}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('badge text-[10px]', badgeClass)}>{eligibilityLabel}</span>
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="mt-4 space-y-3 animate-fade-in">
          <p className="text-xs text-slate-400 leading-relaxed">{designation.benefit}</p>

          {designation.estimated_time_savings && (
            <div className="flex items-center gap-2 text-xs text-teal-400 bg-teal-500/10 rounded px-3 py-2">
              <Clock className="w-3.5 h-3.5" />
              {designation.estimated_time_savings}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-medium">Application timing:</span> {designation.application_timing}
          </div>

          {designation.key_criteria_met.length > 0 && (
            <div>
              <h5 className="label mb-1.5">Criteria Met</h5>
              <ul className="space-y-1">
                {designation.key_criteria_met.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-signal-green">
                    <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="text-slate-400">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {designation.key_criteria_unmet.length > 0 && (
            <div>
              <h5 className="label mb-1.5">Criteria Not Met / Uncertain</h5>
              <ul className="space-y-1">
                {designation.key_criteria_unmet.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-signal-amber">
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span className="text-slate-400">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// RESULTS: TIMELINE VISUALIZATION
// ────────────────────────────────────────────────────────────

function TimelineBar({ data }: { data: RegulatoryOutput['timeline_estimate'] }) {
  const { optimistic, realistic, pessimistic } = data.total_to_approval;

  if (realistic === 0) return null;

  const maxMonths = pessimistic + 6;
  const pctOptimistic = (optimistic / maxMonths) * 100;
  const pctRealistic = (realistic / maxMonths) * 100;
  const pctPessimistic = (pessimistic / maxMonths) * 100;

  function formatMonths(m: number): string {
    if (m >= 12) {
      const years = Math.floor(m / 12);
      const months = m % 12;
      return months > 0 ? `${years}y ${months}m` : `${years}y`;
    }
    return `${m}m`;
  }

  // Build milestone list
  const milestones: { label: string; date?: string }[] = [];
  if (data.ind_submission_target) milestones.push({ label: 'IND Submission', date: data.ind_submission_target });
  if (data.phase1_completion) milestones.push({ label: 'Phase 1 Complete', date: data.phase1_completion });
  if (data.phase2_completion) milestones.push({ label: 'Phase 2 Complete', date: data.phase2_completion });
  if (data.phase3_completion) milestones.push({ label: 'Phase 3 Complete', date: data.phase3_completion });
  if (data.bla_nda_submission) milestones.push({ label: 'BLA/NDA Submission', date: data.bla_nda_submission });
  if (data.approval_estimate) milestones.push({ label: 'Approval Estimate', date: data.approval_estimate });

  return (
    <div className="chart-container">
      <h3 className="chart-title">Timeline to Approval</h3>

      {/* Summary metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="label mb-1">Optimistic</p>
          <p className="metric text-lg text-signal-green">{formatMonths(optimistic)}</p>
        </div>
        <div className="text-center">
          <p className="label mb-1">Realistic</p>
          <p className="metric text-lg text-white">{formatMonths(realistic)}</p>
        </div>
        <div className="text-center">
          <p className="label mb-1">Pessimistic</p>
          <p className="metric text-lg text-signal-amber">{formatMonths(pessimistic)}</p>
        </div>
      </div>

      {/* Visual bar */}
      <div className="relative h-10 bg-navy-800 rounded-md overflow-hidden mb-6">
        {/* Pessimistic range */}
        <div
          className="absolute inset-y-0 left-0 bg-signal-amber/10 rounded-md"
          style={{ width: `${pctPessimistic}%` }}
        />
        {/* Realistic range */}
        <div
          className="absolute inset-y-0 left-0 bg-navy-600/60 rounded-md"
          style={{ width: `${pctRealistic}%` }}
        />
        {/* Optimistic range */}
        <div
          className="absolute inset-y-0 left-0 bg-signal-green/20 rounded-md"
          style={{ width: `${pctOptimistic}%` }}
        />

        {/* Markers */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-signal-green"
          style={{ left: `${pctOptimistic}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white"
          style={{ left: `${pctRealistic}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-signal-amber"
          style={{ left: `${pctPessimistic}%` }}
        />

        {/* Labels on bar */}
        <div
          className="absolute bottom-1 text-[9px] font-mono text-signal-green -translate-x-1/2"
          style={{ left: `${pctOptimistic}%` }}
        >
          {formatMonths(optimistic)}
        </div>
        <div
          className="absolute bottom-1 text-[9px] font-mono text-white -translate-x-1/2"
          style={{ left: `${pctRealistic}%` }}
        >
          {formatMonths(realistic)}
        </div>
        <div
          className="absolute bottom-1 text-[9px] font-mono text-signal-amber -translate-x-1/2"
          style={{ left: `${pctPessimistic}%` }}
        >
          {formatMonths(pessimistic)}
        </div>
      </div>

      {/* Milestones */}
      {milestones.length > 0 && (
        <div>
          <h4 className="label mb-3">Key Milestones</h4>
          <div className="space-y-2">
            {milestones.map((ms, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
                <span className="text-xs text-slate-400 flex-1">{ms.label}</span>
                <span className="metric text-xs text-slate-300">
                  {ms.date
                    ? new Date(ms.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                      })
                    : 'TBD'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// RESULTS: COMPARABLE APPROVALS TABLE
// ────────────────────────────────────────────────────────────

function ComparableApprovalsTable({ approvals }: { approvals: ComparableApproval[] }) {
  if (approvals.length === 0) return null;

  return (
    <div className="chart-container overflow-hidden">
      <h3 className="chart-title">Comparable Approval Precedents</h3>
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Drug</th>
              <th>Company</th>
              <th>Indication</th>
              <th>Pathway</th>
              <th>Designations</th>
              <th>Review</th>
              <th>Total Dev</th>
              <th>Year</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((a, i) => (
              <tr key={i}>
                <td className="text-white font-medium text-xs whitespace-nowrap">{a.drug}</td>
                <td className="text-xs">{a.company}</td>
                <td className="text-xs max-w-[160px] truncate">{a.indication}</td>
                <td>
                  <span className={cn(
                    'text-[10px] font-mono px-1.5 py-0.5 rounded',
                    a.accelerated ? 'bg-signal-green/10 text-signal-green' : 'bg-navy-700 text-slate-400',
                  )}>
                    {a.pathway}
                  </span>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {a.designations.slice(0, 3).map((d, j) => (
                      <span key={j} className="badge badge-slate text-[9px] py-0.5 px-1.5">
                        {d.replace(/\(.*\)/, '').trim()}
                      </span>
                    ))}
                    {a.designations.length > 3 && (
                      <span className="badge badge-slate text-[9px] py-0.5 px-1.5">
                        +{a.designations.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="numeric text-xs">{a.review_months}mo</td>
                <td className="numeric text-xs">{a.ind_to_bla_months}mo</td>
                <td className="numeric text-xs">{a.approval_year}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// RESULTS: RISK SECTION
// ────────────────────────────────────────────────────────────

function RiskSection({ risks }: { risks: RegulatoryRisk[] }) {
  if (risks.length === 0) return null;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Key Regulatory Risks</h3>
      <div className="space-y-3">
        {risks.map((risk, i) => (
          <div
            key={i}
            className={cn(
              'border rounded-lg p-4',
              risk.severity === 'high'
                ? 'border-signal-red/20 bg-signal-red/5'
                : risk.severity === 'medium'
                  ? 'border-signal-amber/20 bg-signal-amber/5'
                  : 'border-navy-700 bg-navy-800/50',
            )}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={cn(
                  'w-4 h-4 mt-0.5 shrink-0',
                  risk.severity === 'high'
                    ? 'text-signal-red'
                    : risk.severity === 'medium'
                      ? 'text-signal-amber'
                      : 'text-slate-500',
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      'badge text-[10px]',
                      risk.severity === 'high'
                        ? 'badge-red'
                        : risk.severity === 'medium'
                          ? 'badge-amber'
                          : 'badge-slate',
                    )}
                  >
                    {risk.severity} risk
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{risk.risk}</p>
                <div className="mt-2 flex items-start gap-2">
                  <Scale className="w-3 h-3 text-teal-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    <span className="text-teal-400 font-medium">Mitigation:</span> {risk.mitigation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// RESULTS: METHODOLOGY COLLAPSIBLE
// ────────────────────────────────────────────────────────────

function MethodologySection({ data }: { data: RegulatoryOutput }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="chart-container">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="chart-title mb-0">Methodology & Data Sources</h3>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500" />
        )}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {/* Rationale */}
          <div>
            <h4 className="label mb-2">Analysis Rationale</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {data.recommended_pathway.rationale}
            </p>
          </div>

          {/* Review Division */}
          {data.review_division && (
            <div className="flex items-center gap-2 text-xs bg-navy-800 border border-navy-700 rounded px-3 py-2">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-slate-400">
                <span className="text-slate-300 font-medium">Review Division:</span>{' '}
                {data.review_division}
              </span>
            </div>
          )}

          {/* Advisory Committee */}
          <div className="flex items-center gap-2 text-xs bg-navy-800 border border-navy-700 rounded px-3 py-2">
            <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="text-slate-400">
              <span className="text-slate-300 font-medium">Advisory Committee:</span>{' '}
              {data.advisory_committee_likely
                ? 'Likely — an advisory committee meeting is probable for this product profile.'
                : 'Unlikely — advisory committee meeting is not expected for this product profile.'}
            </span>
          </div>

          {/* Data Sources */}
          <div>
            <h4 className="label mb-2">Data Sources</h4>
            <ul className="space-y-1.5">
              {data.data_sources.map((source, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      source.type === 'public'
                        ? 'bg-signal-green'
                        : source.type === 'proprietary'
                          ? 'bg-teal-500'
                          : 'bg-signal-blue',
                    )}
                  />
                  <span className="flex-1">{source.name}</span>
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-500 hover:text-teal-400"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// FULL RESULTS COMPONENT
// ────────────────────────────────────────────────────────────

function RegulatoryResults({ data }: { data: RegulatoryOutput }) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="stat-card">
          <p className="label mb-1">Primary Pathway</p>
          <p className="text-sm font-medium text-white leading-tight">
            {data.recommended_pathway.primary.name}
          </p>
          <p className="metric text-xs text-slate-400 mt-1">
            {data.recommended_pathway.primary.typical_review_months}mo review
          </p>
        </div>
        <div className="stat-card">
          <p className="label mb-1">Realistic Timeline</p>
          <p className="metric text-xl text-white">
            {data.timeline_estimate.total_to_approval.realistic}
            <span className="text-sm text-slate-400 ml-1">months</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">from current stage to approval</p>
        </div>
        <div className="stat-card">
          <p className="label mb-1">Designations Available</p>
          <p className="metric text-xl text-white">
            {data.designation_opportunities.filter((d) => d.eligibility === 'likely').length}
            <span className="text-sm text-signal-green ml-1">likely</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {data.designation_opportunities.filter((d) => d.eligibility === 'possible').length} possible
          </p>
        </div>
      </div>

      {/* Recommended Pathway */}
      <div className="chart-container">
        <h3 className="chart-title">Recommended Regulatory Pathway</h3>
        <div className="space-y-3">
          <PathwayCard pathway={data.recommended_pathway.primary} isPrimary={true} />
          {data.recommended_pathway.alternatives.map((alt, i) => (
            <PathwayCard key={i} pathway={alt} isPrimary={false} />
          ))}
        </div>
      </div>

      {/* Timeline */}
      <TimelineBar data={data.timeline_estimate} />

      {/* Designation Opportunities */}
      <div className="chart-container">
        <h3 className="chart-title">Designation Opportunities</h3>
        <div className="space-y-3">
          {data.designation_opportunities
            .sort((a, b) => {
              const order = { likely: 0, possible: 1, unlikely: 2 };
              return order[a.eligibility] - order[b.eligibility];
            })
            .map((d, i) => (
              <DesignationCard key={i} designation={d} />
            ))}
        </div>
      </div>

      {/* Comparable Approvals */}
      <ComparableApprovalsTable approvals={data.comparable_approvals} />

      {/* Key Risks */}
      <RiskSection risks={data.key_risks} />

      {/* Methodology */}
      <MethodologySection data={data} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────────────

export default function RegulatoryPage() {
  const mutation = useMutation({
    mutationFn: async (formData: RegulatoryFormData) => {
      const response = await apiPost<RegulatoryOutput>('/api/analyze/regulatory', {
        input: {
          indication: formData.indication,
          product_type: formData.product_type,
          development_stage: formData.development_stage,
          mechanism: formData.mechanism || undefined,
          geography: formData.geography,
          unmet_need: formData.unmet_need,
          has_orphan_potential: formData.has_orphan_potential,
        },
      });
      if (!response.success) throw new Error(response.error || 'Analysis failed');
      if (!response.data) throw new Error('No data returned');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Regulatory analysis complete');
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      toast.error(msg.includes('limit') ? 'Usage limit reached — upgrade to continue' : msg);
    },
  });

  const results = mutation.data ?? null;
  const isLoading = mutation.isPending;
  const error = mutation.error ? (mutation.error as Error).message : null;

  function handleSubmit(formData: RegulatoryFormData) {
    mutation.mutate(formData);
  }

  return (
    <>
      <PageHeader
        title="Regulatory Intelligence"
        subtitle="Pathway analysis, designation opportunities, and timeline modeling."
        badge="Pro"
      />
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel - Form */}
        <div className="w-full lg:w-[380px] lg:flex-shrink-0">
          <RegulatoryForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>

        {/* Right panel - Results */}
        <div className="flex-1 min-w-0">
          {isLoading && <ResultsSkeleton />}
          {!isLoading && error && (
            <div className="card p-8 text-center">
              <p className="text-sm text-signal-red bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
                {error}
              </p>
            </div>
          )}
          {!isLoading && !error && !results && <EmptyState />}
          {!isLoading && !error && results && <RegulatoryResults data={results} />}
        </div>
      </div>
    </>
  );
}
