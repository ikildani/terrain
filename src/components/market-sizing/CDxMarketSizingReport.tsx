'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatMetric, formatCurrency, formatPercent, formatNumber } from '@/lib/utils/format';
import { StatCard } from '@/components/shared/StatCard';
import { DataSourceBadge } from '@/components/shared/DataSourceBadge';
import { ConfidentialFooter } from '@/components/shared/ConfidentialFooter';
import { ExportButton } from '@/components/shared/ExportButton';
import { BookmarkCheck } from 'lucide-react';
import CDxTestingFunnelChart from './CDxTestingFunnelChart';
import type { CDxOutput, CDxMarketSizingInput, CDxDeal } from '@/types';

interface CDxMarketSizingReportProps {
  data: CDxOutput;
  input: CDxMarketSizingInput;
  previewMode?: boolean;
  onPdfExport?: () => void;
}

// ────────────────────────────────────────────────────────────
// CSV EXPORT HELPER
// ────────────────────────────────────────────────────────────

function flattenCDxForCSV(data: CDxOutput): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  // Testing Funnel
  const f = data.patient_testing_funnel;
  rows.push({
    section: 'Testing Funnel',
    metric: 'Indication Incidence (US)',
    value: f.indication_incidence_us,
  });
  rows.push({
    section: 'Testing Funnel',
    metric: 'Diagnosed & Tested %',
    value: `${f.diagnosed_and_tested_pct}%`,
  });
  rows.push({
    section: 'Testing Funnel',
    metric: 'Annual Newly Tested',
    value: f.annual_newly_tested,
  });
  rows.push({
    section: 'Testing Funnel',
    metric: 'Biomarker Positive %',
    value: `${f.biomarker_positive_pct}%`,
  });
  rows.push({
    section: 'Testing Funnel',
    metric: 'Biomarker Positive Patients',
    value: f.biomarker_positive_patients,
  });
  rows.push({
    section: 'Testing Funnel',
    metric: 'Treated on Linked Drug',
    value: f.treated_on_linked_drug,
  });
  rows.push({
    section: 'Testing Funnel',
    metric: 'Monitoring Retests (Annual)',
    value: f.monitoring_retests_annual,
  });
  rows.push({
    section: 'Testing Funnel',
    metric: 'Total Annual Tests',
    value: f.total_annual_tests,
  });

  // CDx Economics
  const e = data.cdx_economics;
  rows.push({
    section: 'CDx Economics',
    metric: 'Revenue Per Test (Gross)',
    value: e.revenue_per_test_gross,
  });
  rows.push({
    section: 'CDx Economics',
    metric: 'CPT Codes',
    value: e.reimbursement_cpt_codes.join('; '),
  });
  rows.push({
    section: 'CDx Economics',
    metric: 'CMS Reimbursement Rate',
    value: e.cms_reimbursement_rate ?? 'N/A',
  });
  rows.push({
    section: 'CDx Economics',
    metric: 'Private Payer Rate',
    value: e.private_payer_rate ?? 'N/A',
  });
  rows.push({
    section: 'CDx Economics',
    metric: 'Gross-to-Net %',
    value: `${e.gross_to_net_pct}%`,
  });
  rows.push({
    section: 'CDx Economics',
    metric: 'Net Revenue Per Test',
    value: e.net_revenue_per_test,
  });
  rows.push({
    section: 'CDx Economics',
    metric: 'Total Annual Revenue (Low)',
    value: e.total_annual_revenue.low,
  });
  rows.push({
    section: 'CDx Economics',
    metric: 'Total Annual Revenue (Base)',
    value: e.total_annual_revenue.base,
  });
  rows.push({
    section: 'CDx Economics',
    metric: 'Total Annual Revenue (High)',
    value: e.total_annual_revenue.high,
  });

  // Comparable Deals
  data.deal_structure_benchmark.comparable_deals.forEach((d: CDxDeal) => {
    rows.push({
      section: 'Comparable Deal',
      cdx_company: d.cdx_company,
      drug_company: d.drug_company,
      cdx_name: d.cdx_name,
      drug_name: d.drug_name,
      biomarker: d.biomarker,
      deal_type: d.deal_type,
      value_reported: d.value_reported ?? 'N/A',
      date: d.date,
      status: d.status,
    });
  });

  // Approved Tests
  data.competitive_cdx_landscape.approved_tests.forEach((t) => {
    rows.push({
      section: 'Approved Test',
      test: t.test,
      company: t.company,
      drug: t.drug,
      platform: t.platform,
      approval_year: t.approval_year,
    });
  });

  // Pipeline Tests
  data.competitive_cdx_landscape.pipeline_tests.forEach((t) => {
    rows.push({
      section: 'Pipeline Test',
      test: t.test,
      company: t.company,
      stage: t.stage,
      drug_partner: t.drug_partner ?? 'N/A',
    });
  });

  return rows;
}

// ────────────────────────────────────────────────────────────
// HELPER: Regulatory badge class by pathway
// ────────────────────────────────────────────────────────────

function getPathwayBadgeClass(pathway: string): string {
  if (pathway.includes('PMA')) return 'badge-pma';
  if (pathway.includes('510(k)')) return 'badge-510k';
  if (pathway.includes('CDx')) return 'badge-cdx';
  return 'badge-cdx';
}

// ────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────

export default function CDxMarketSizingReport({ data, input, previewMode, onPdfExport }: CDxMarketSizingReportProps) {
  const [methodologyOpen, setMethodologyOpen] = useState(previewMode ?? false);
  const { summary } = data;
  const economics = data.cdx_economics;
  const deals = data.deal_structure_benchmark;
  const regulatory = data.regulatory_pathway;
  const landscape = data.competitive_cdx_landscape;

  const displayName = input.drug_name || input.biomarker;

  return (
    <div className="space-y-6 animate-fade-in" data-report-content>
      {/* ──────────────────────────────────────────────────────
          1. EXECUTIVE SUMMARY
          ────────────────────────────────────────────────────── */}
      <div className="card noise">
        <h3 className="chart-title">Executive Summary</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The companion diagnostic opportunity for <span className="text-white font-medium">{displayName}</span> in{' '}
          <span className="text-white font-medium">{input.drug_indication}</span> represents an annual test volume of{' '}
          <span className="metric text-teal-400">{formatNumber(summary.annual_test_volume)}</span> tests, generating
          estimated CDx revenue of{' '}
          <span className="metric text-white">{formatMetric(summary.cdx_revenue.value, summary.cdx_revenue.unit)}</span>{' '}
          at <span className="metric text-white">{summary.test_reimbursement}</span> reimbursement. The testing funnel
          is driven by a US indication incidence of{' '}
          <span className="metric text-white">{formatNumber(summary.linked_drug_indication_incidence_us)}</span>{' '}
          patients, with biomarker prevalence of{' '}
          <span className="metric text-white">{formatPercent(input.biomarker_prevalence_pct, 0)}</span> filtering to the
          addressable CDx population. Monitoring retests add{' '}
          <span className="metric text-white">
            {formatNumber(data.patient_testing_funnel.monitoring_retests_annual)}
          </span>{' '}
          additional annual tests.
        </p>
      </div>

      {/* ──────────────────────────────────────────────────────
          2. SUMMARY METRICS
          ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Drug Indication Incidence"
          value={formatNumber(summary.linked_drug_indication_incidence_us)}
          subvalue="patients (US)"
          source="Terrain Analysis"
        />
        <StatCard
          label="Annual Test Volume"
          value={formatNumber(summary.annual_test_volume)}
          subvalue="tests"
          source="Terrain Analysis"
        />
        <StatCard
          label="CDx Revenue"
          value={formatMetric(summary.cdx_revenue.value, summary.cdx_revenue.unit)}
          confidence={summary.cdx_revenue.confidence}
          source="Terrain Analysis"
        />
        <StatCard label="Test Reimbursement" value={summary.test_reimbursement} source="CMS / Commercial Payer Data" />
      </div>

      {/* ──────────────────────────────────────────────────────
          3. TESTING FUNNEL
          ────────────────────────────────────────────────────── */}
      <CDxTestingFunnelChart funnel={data.patient_testing_funnel} />

      {/* ──────────────────────────────────────────────────────
          4. CDx ECONOMICS
          ────────────────────────────────────────────────────── */}
      <div className="chart-container noise">
        <div className="chart-title">CDx Economics</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column — Revenue Per Test & Reimbursement */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-navy-700">
              <span className="text-xs text-slate-500">Revenue Per Test (Gross)</span>
              <span className="metric text-sm text-white">{formatCurrency(economics.revenue_per_test_gross)}</span>
            </div>

            <div className="flex items-start justify-between py-2 border-b border-navy-700">
              <span className="text-xs text-slate-500">CPT Codes</span>
              <div className="flex flex-wrap gap-1 justify-end">
                {economics.reimbursement_cpt_codes.map((code) => (
                  <span
                    key={code}
                    className="inline-block text-2xs font-mono px-2 py-0.5 rounded bg-navy-800 border border-navy-700 text-slate-300"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>

            {economics.cms_reimbursement_rate != null && (
              <div className="flex items-center justify-between py-2 border-b border-navy-700">
                <span className="text-xs text-slate-500">CMS Rate</span>
                <span className="metric text-sm text-white">{formatCurrency(economics.cms_reimbursement_rate)}</span>
              </div>
            )}

            {economics.private_payer_rate && (
              <div className="flex items-center justify-between py-2 border-b border-navy-700">
                <span className="text-xs text-slate-500">Private Payer</span>
                <span className="text-xs text-slate-300">{economics.private_payer_rate}</span>
              </div>
            )}
          </div>

          {/* Right Column — Net Economics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-navy-700">
              <span className="text-xs text-slate-500">Gross-to-Net</span>
              <span className="metric text-sm text-white">{formatPercent(economics.gross_to_net_pct, 0)}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-navy-700">
              <span className="text-xs text-slate-500">Net Revenue Per Test</span>
              <span className="metric text-sm text-teal-400">{formatCurrency(economics.net_revenue_per_test)}</span>
            </div>

            <div className="py-2 border-b border-navy-700">
              <span className="text-xs text-slate-500 block mb-2">Total Annual Revenue</span>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <span className="text-2xs text-slate-600 block">Low</span>
                  <span className="metric text-xs text-slate-400">
                    {formatCurrency(economics.total_annual_revenue.low)}
                  </span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 via-teal-500/40 to-slate-700" />
                <div className="text-center">
                  <span className="text-2xs text-teal-500 block">Base</span>
                  <span className="metric text-sm text-white">
                    {formatCurrency(economics.total_annual_revenue.base)}
                  </span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-slate-700 via-teal-500/40 to-slate-700" />
                <div className="text-center">
                  <span className="text-2xs text-slate-600 block">High</span>
                  <span className="metric text-xs text-slate-400">
                    {formatCurrency(economics.total_annual_revenue.high)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────
          5. DEAL STRUCTURE BENCHMARK
          ────────────────────────────────────────────────────── */}
      <div className="chart-container noise">
        <div className="chart-title">Deal Structure Benchmark</div>

        {/* Narrative blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-navy-800/50 rounded-md">
            <span className="text-2xs text-slate-600 uppercase tracking-wider block mb-1">Typical Deal Type</span>
            <p className="text-xs text-slate-300 leading-relaxed">{deals.typical_deal_type}</p>
          </div>
          <div className="p-3 bg-navy-800/50 rounded-md">
            <span className="text-2xs text-slate-600 uppercase tracking-wider block mb-1">CDx Partner Economics</span>
            <p className="text-xs text-slate-300 leading-relaxed">{deals.cdx_partner_economics}</p>
          </div>
          <div className="p-3 bg-navy-800/50 rounded-md">
            <span className="text-2xs text-slate-600 uppercase tracking-wider block mb-1">Milestones</span>
            <p className="text-xs text-slate-300 leading-relaxed">{deals.milestones}</p>
          </div>
          <div className="p-3 bg-navy-800/50 rounded-md">
            <span className="text-2xs text-slate-600 uppercase tracking-wider block mb-1">
              Royalty / Supply Structure
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{deals.royalty_or_supply_structure}</p>
          </div>
        </div>

        {/* Comparable Deals table */}
        {deals.comparable_deals.length > 0 && (
          <>
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Comparable Deals</div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>CDx Company</th>
                    <th>Drug Company</th>
                    <th>CDx Name</th>
                    <th>Drug</th>
                    <th>Biomarker</th>
                    <th>Deal Type</th>
                    <th>Value</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.comparable_deals.map((deal, i) => (
                    <tr key={`${deal.cdx_company}-${deal.drug_name}-${i}`}>
                      <td className="text-slate-300 font-medium">{deal.cdx_company}</td>
                      <td>{deal.drug_company}</td>
                      <td>{deal.cdx_name}</td>
                      <td>{deal.drug_name}</td>
                      <td>
                        <span className="text-2xs text-slate-500">{deal.biomarker}</span>
                      </td>
                      <td>{deal.deal_type}</td>
                      <td className="numeric">{deal.value_reported ?? '--'}</td>
                      <td className="numeric">{deal.date}</td>
                      <td>
                        <span
                          className={cn(
                            'phase-badge',
                            deal.status === 'approved' && 'phase-approved',
                            deal.status === 'clinical' && 'phase-2',
                            deal.status === 'pending' && 'phase-1',
                          )}
                        >
                          {deal.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────
          6. REGULATORY PATHWAY
          ────────────────────────────────────────────────────── */}
      <div className="chart-container noise">
        <div className="chart-title">Regulatory Pathway</div>
        <div className="space-y-4">
          {/* FDA Pathway Badge + Co-review */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className={cn('phase-badge text-xs px-3 py-1', getPathwayBadgeClass(regulatory.fda_pathway))}>
              {regulatory.fda_pathway}
            </span>

            <div className="flex items-center gap-1.5">
              {regulatory.co_review_with_drug ? (
                <span className="inline-flex items-center gap-1 text-xs text-signal-green">
                  <Check className="w-3.5 h-3.5" />
                  Co-review with Drug
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-signal-red">
                  <X className="w-3.5 h-3.5" />
                  Independent Review
                </span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-navy-800/50 rounded-md">
              <span className="text-2xs text-slate-600 uppercase tracking-wider block mb-1">Timeline</span>
              <span className="metric text-sm text-white">
                {regulatory.timeline_months.optimistic}–{regulatory.timeline_months.realistic} months
              </span>
              <span className="text-2xs text-slate-500 block mt-0.5">Optimistic to Realistic</span>
            </div>

            <div className="p-3 bg-navy-800/50 rounded-md">
              <span className="text-2xs text-slate-600 uppercase tracking-wider block mb-1">EU IVDR Class</span>
              <span className="text-xs text-slate-300">{regulatory.eu_ivdr_class}</span>
            </div>

            <div className="p-3 bg-navy-800/50 rounded-md">
              <span className="text-2xs text-slate-600 uppercase tracking-wider block mb-1">Co-Review</span>
              <span className="text-xs text-slate-300">
                {regulatory.co_review_with_drug
                  ? 'CDx PMA reviewed in parallel with drug NDA/BLA'
                  : 'CDx submitted independently of drug application'}
              </span>
            </div>
          </div>

          {/* Post-Approval Requirements */}
          {regulatory.post_approval_requirements.length > 0 && (
            <div>
              <h4 className="text-xs text-slate-300 font-medium mb-2">Post-Approval Requirements</h4>
              <ul className="space-y-1">
                {regulatory.post_approval_requirements.map((req, i) => (
                  <li key={`req-${req}-${i}`} className="text-xs text-slate-500 flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-teal-500/60 mt-1.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────
          7. COMPETITIVE CDx LANDSCAPE
          ────────────────────────────────────────────────────── */}
      <div className="chart-container noise">
        <div className="chart-title">Competitive CDx Landscape</div>

        {/* Approved Tests */}
        {landscape.approved_tests.length > 0 && (
          <div className="mb-6">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Approved Tests</div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Company</th>
                    <th>Drug</th>
                    <th>Platform</th>
                    <th>Approval Year</th>
                  </tr>
                </thead>
                <tbody>
                  {landscape.approved_tests.map((t, i) => (
                    <tr key={`${t.test}-${i}`}>
                      <td className="text-slate-300 font-medium">{t.test}</td>
                      <td>{t.company}</td>
                      <td>{t.drug}</td>
                      <td>
                        <span className="text-2xs text-slate-500">{t.platform}</span>
                      </td>
                      <td className="numeric">{t.approval_year}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pipeline Tests */}
        {landscape.pipeline_tests.length > 0 && (
          <div className="mb-6">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Pipeline Tests</div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Test</th>
                    <th>Company</th>
                    <th>Stage</th>
                    <th>Drug Partner</th>
                  </tr>
                </thead>
                <tbody>
                  {landscape.pipeline_tests.map((t, i) => (
                    <tr key={`${t.test}-${i}`}>
                      <td className="text-slate-300 font-medium">{t.test}</td>
                      <td>{t.company}</td>
                      <td>
                        <span className="phase-badge phase-2">{t.stage}</span>
                      </td>
                      <td>{t.drug_partner ?? '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Platform Technology Leader callout */}
        {landscape.platform_technology_leader && (
          <div className="p-3 bg-navy-800/50 rounded-md border-l-2 border-teal-500/50 mb-4">
            <span className="text-2xs text-teal-500 uppercase tracking-wider block mb-1">
              Platform Technology Leader
            </span>
            <p className="text-xs text-slate-300">{landscape.platform_technology_leader}</p>
          </div>
        )}

        {/* Market Insight */}
        {landscape.market_insight && (
          <div className="p-3 bg-navy-800/50 rounded-md">
            <span className="text-2xs text-slate-600 uppercase tracking-wider block mb-1">Market Insight</span>
            <p className="text-xs text-slate-400 leading-relaxed">{landscape.market_insight}</p>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────
          8. METHODOLOGY
          ────────────────────────────────────────────────────── */}
      <div className="chart-container noise">
        <button
          onClick={() => setMethodologyOpen(!methodologyOpen)}
          className="flex items-center justify-between w-full"
        >
          <span className="chart-title !mb-0">Methodology & Assumptions</span>
          {methodologyOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </button>
        {methodologyOpen && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <div>
              <h4 className="text-xs text-slate-300 font-medium mb-2">Approach</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{data.methodology}</p>
            </div>
          </div>
        )}
      </div>

      {/* ──────────────────────────────────────────────────────
          9. DATA SOURCES
          ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {data.data_sources.map((source) => (
          <DataSourceBadge
            key={source.name}
            source={source.name}
            type={source.type as 'public' | 'proprietary' | 'licensed'}
          />
        ))}
      </div>

      {/* ──────────────────────────────────────────────────────
          10. ACTION BAR
          ────────────────────────────────────────────────────── */}
      {!previewMode && (
        <div className="flex items-center gap-3 pt-6 border-t border-navy-700">
          <span className="flex items-center gap-1.5 text-xs text-emerald-400/80 font-medium px-2">
            <BookmarkCheck className="w-3.5 h-3.5" />
            Auto-saved
          </span>
          <ExportButton
            format="pdf"
            onPdfExport={onPdfExport}
            reportTitle={`${input.biomarker} CDx — ${input.drug_indication}`}
            reportSubtitle={[input.drug_name, input.test_type].filter(Boolean).join(' — ') || undefined}
            filename={`terrain-cdx-${input.drug_indication.toLowerCase().replace(/\s+/g, '-')}`}
          />
          <ExportButton
            format="csv"
            data={flattenCDxForCSV(data)}
            filename={`terrain-cdx-${input.drug_indication.toLowerCase().replace(/\s+/g, '-')}`}
          />
          <ExportButton
            format="email"
            reportTitle={`${input.biomarker} CDx — ${input.drug_indication}`}
            reportSubtitle={[input.drug_name, input.test_type].filter(Boolean).join(' — ') || undefined}
          />
        </div>
      )}

      {/* ──────────────────────────────────────────────────────
          11. CONFIDENTIAL FOOTER
          ────────────────────────────────────────────────────── */}
      <ConfidentialFooter />
    </div>
  );
}
