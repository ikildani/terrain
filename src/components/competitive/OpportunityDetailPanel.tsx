'use client';

import { useState, useEffect } from 'react';
import { Beaker, FileText, Shield, Users, Lightbulb, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ScoreBreakdownBar } from './OpportunityScoreBar';
import type { OpportunityScoreBreakdown } from '@/lib/analytics/screener';
import { formatNumber, formatDate } from '@/lib/utils/format';

// ── Detail API response types ──────────────────────────────

interface ClinicalTrial {
  nct_id: string;
  title: string;
  status: string;
  phase: string;
  sponsor: string;
  enrollment: number;
  start_date: string;
  completion_date: string;
}

interface SecFiling {
  accession_number: string;
  company_name: string;
  ticker: string;
  form_type: string;
  filed_date: string;
  description: string;
  file_url: string;
  is_deal_related: boolean;
  deal_keywords: string[];
}

interface FdaApproval {
  application_number: string;
  brand_name: string;
  generic_name: string;
  sponsor_name: string;
  approval_date: string;
  application_type: string;
}

interface TopPartner {
  company: string;
  therapeutic_areas: string[];
  bd_activity: string;
  recent_deal?: string;
}

interface DetailData {
  trials: ClinicalTrial[];
  sec_filings: SecFiling[];
  fda_approvals: FdaApproval[];
  top_partners: TopPartner[];
  white_space: string[];
}

// ── Component Props ────────────────────────────────────────

interface OpportunityDetailPanelProps {
  indication: string;
  scoreBreakdown: OpportunityScoreBreakdown;
  isOpen: boolean;
}

type DetailTab = 'score' | 'trials' | 'sec' | 'fda' | 'context';

const TABS: { id: DetailTab; label: string; icon: typeof Beaker }[] = [
  { id: 'score', label: 'Score Breakdown', icon: Lightbulb },
  { id: 'trials', label: 'Clinical Trials', icon: Beaker },
  { id: 'sec', label: 'SEC Activity', icon: FileText },
  { id: 'fda', label: 'FDA History', icon: Shield },
  { id: 'context', label: 'Context & Partners', icon: Users },
];

export function OpportunityDetailPanel({ indication, scoreBreakdown, isOpen }: OpportunityDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('score');
  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || detail) return;

    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/analyze/screener/detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ indication }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Failed to load details');
        setDetail(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load details');
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [isOpen, indication, detail]);

  if (!isOpen) return null;

  return (
    <tr>
      <td colSpan={99} className="p-0">
        <div className="bg-navy-900/60 border-t border-b border-navy-700/40 px-6 py-5">
          {/* Tab navigation */}
          <div className="flex gap-1 mb-4 border-b border-navy-700/40 pb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors',
                    activeTab === tab.id
                      ? 'text-teal-400 bg-navy-800 border-b-2 border-teal-500'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-navy-800/50',
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-8 gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading intelligence for {indication}...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 py-4 px-4 bg-red-500/5 border border-red-500/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* Score Breakdown (no API needed) */}
          {activeTab === 'score' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 max-w-2xl">
              <ScoreBreakdownBar label="Market Attractiveness" score={scoreBreakdown.market_attractiveness} max={30} />
              <ScoreBreakdownBar label="Competitive Openness" score={scoreBreakdown.competitive_openness} max={25} />
              <ScoreBreakdownBar label="Unmet Need" score={scoreBreakdown.unmet_need} max={20} />
              <ScoreBreakdownBar
                label="Development Feasibility"
                score={scoreBreakdown.development_feasibility}
                max={15}
              />
              <ScoreBreakdownBar label="Partner Landscape" score={scoreBreakdown.partner_landscape} max={10} />
            </div>
          )}

          {/* Clinical Trials tab */}
          {activeTab === 'trials' && !loading && !error && (
            <div>
              {detail && detail.trials.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-navy-700/40">
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          NCT ID
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Title
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Phase
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Sponsor
                        </th>
                        <th className="text-right py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Enrollment
                        </th>
                        <th className="text-left py-2 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.trials.map((trial) => (
                        <tr key={trial.nct_id} className="border-b border-navy-700/20 hover:bg-navy-800/30">
                          <td className="py-2 pr-4">
                            <a
                              href={`https://clinicaltrials.gov/study/${trial.nct_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-teal-400 hover:text-teal-300 flex items-center gap-1"
                            >
                              {trial.nct_id}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </td>
                          <td className="py-2 pr-4 text-slate-300 max-w-sm truncate">{trial.title}</td>
                          <td className="py-2 pr-4">
                            <span className="px-1.5 py-0.5 rounded bg-navy-700/60 text-slate-300 font-mono text-[10px]">
                              {trial.phase}
                            </span>
                          </td>
                          <td className="py-2 pr-4 text-slate-400">{trial.sponsor}</td>
                          <td className="py-2 pr-4 text-right font-mono text-slate-300">
                            {formatNumber(trial.enrollment)}
                          </td>
                          <td className="py-2">
                            <span
                              className={cn(
                                'px-1.5 py-0.5 rounded text-[10px] font-medium',
                                trial.status === 'Recruiting' || trial.status === 'RECRUITING'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : trial.status === 'Completed' || trial.status === 'COMPLETED'
                                    ? 'bg-blue-500/10 text-blue-400'
                                    : 'bg-navy-700/60 text-slate-400',
                              )}
                            >
                              {trial.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : detail ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No cached clinical trials for this indication.
                </div>
              ) : null}
            </div>
          )}

          {/* SEC Activity tab */}
          {activeTab === 'sec' && !loading && !error && (
            <div>
              {detail && detail.sec_filings.length > 0 ? (
                <div className="space-y-2">
                  {detail.sec_filings.map((filing) => (
                    <div
                      key={filing.accession_number}
                      className="flex items-start gap-3 p-3 rounded-md bg-navy-800/30 border border-navy-700/30"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[10px] font-mono font-medium',
                            filing.is_deal_related ? 'bg-amber-500/10 text-amber-400' : 'bg-navy-700/60 text-slate-500',
                          )}
                        >
                          {filing.form_type}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-300">{filing.company_name}</span>
                          {filing.ticker && (
                            <span className="font-mono text-[10px] text-slate-500">{filing.ticker}</span>
                          )}
                          <span className="text-[10px] text-slate-600">{formatDate(filing.filed_date)}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{filing.description}</p>
                        {filing.is_deal_related && filing.deal_keywords?.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {filing.deal_keywords.slice(0, 4).map((kw) => (
                              <span
                                key={kw}
                                className="px-1 py-0.5 rounded bg-amber-500/5 text-[9px] text-amber-400/80"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {filing.file_url && (
                        <a
                          href={filing.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-slate-500 hover:text-teal-400"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : detail ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No cached SEC filings for companies in this indication.
                </div>
              ) : null}
            </div>
          )}

          {/* FDA History tab */}
          {activeTab === 'fda' && !loading && !error && (
            <div>
              {detail && detail.fda_approvals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-navy-700/40">
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Brand Name
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Generic Name
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Sponsor
                        </th>
                        <th className="text-left py-2 pr-4 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Type
                        </th>
                        <th className="text-left py-2 text-[10px] font-mono uppercase tracking-wider text-slate-600">
                          Approval Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.fda_approvals.map((approval) => (
                        <tr
                          key={approval.application_number}
                          className="border-b border-navy-700/20 hover:bg-navy-800/30"
                        >
                          <td className="py-2 pr-4 font-medium text-slate-200">{approval.brand_name}</td>
                          <td className="py-2 pr-4 text-slate-400">{approval.generic_name}</td>
                          <td className="py-2 pr-4 text-slate-400">{approval.sponsor_name}</td>
                          <td className="py-2 pr-4">
                            <span className="px-1.5 py-0.5 rounded bg-navy-700/60 text-slate-300 font-mono text-[10px]">
                              {approval.application_type}
                            </span>
                          </td>
                          <td className="py-2 text-slate-400 font-mono text-[10px]">
                            {formatDate(approval.approval_date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : detail ? (
                <div className="py-6 text-center text-sm text-slate-500">
                  No cached FDA approvals for this indication.
                </div>
              ) : null}
            </div>
          )}

          {/* Context & Partners tab */}
          {activeTab === 'context' && !loading && !error && detail && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* White Space */}
              <div>
                <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  White Space Opportunities
                </h4>
                {detail.white_space.length > 0 ? (
                  <ul className="space-y-2">
                    {detail.white_space.map((hint, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                        <span className="flex-shrink-0 w-1 h-1 mt-1.5 rounded-full bg-amber-400/60" />
                        {hint}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">No notable gaps identified.</p>
                )}
              </div>

              {/* Top Partners */}
              <div>
                <h4 className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-400" />
                  Top BD Partners
                </h4>
                {detail.top_partners.length > 0 ? (
                  <div className="space-y-2">
                    {detail.top_partners.map((partner) => (
                      <div key={partner.company} className="p-2 rounded-md bg-navy-800/30 border border-navy-700/30">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-200">{partner.company}</span>
                          <span
                            className={cn(
                              'text-[10px] font-mono',
                              partner.bd_activity === 'very_active'
                                ? 'text-emerald-400'
                                : partner.bd_activity === 'active'
                                  ? 'text-teal-400'
                                  : 'text-slate-500',
                            )}
                          >
                            {partner.bd_activity.replace('_', ' ')}
                          </span>
                        </div>
                        {partner.recent_deal && (
                          <p className="text-[10px] text-slate-500 mt-0.5">{partner.recent_deal}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No aligned partners identified.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
