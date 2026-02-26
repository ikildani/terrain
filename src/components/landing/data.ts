import { BarChart3, Network, Users, Shield, Building2, Briefcase, PieChart } from 'lucide-react';

export const MODULES = [
  {
    name: 'Market Sizing',
    icon: BarChart3,
    description:
      'Patient-funnel TAM/SAM/SOM with biomarker-specific subtypes, 10-year revenue projections, and geography breakdown. Pharma, devices, diagnostics, and nutraceuticals.',
    metric: '150+ indications \u00b7 4 product categories',
    href: '/market-sizing',
  },
  {
    name: 'Competitive Landscape',
    icon: Network,
    description:
      'Pipeline mapping with crowding scores, head-to-head comparisons, and deal-value context. Powered by live ClinicalTrials.gov and FDA data updated nightly.',
    metric: 'Live pipeline data',
    href: '/competitive',
  },
  {
    name: 'Partner Discovery',
    icon: Users,
    description:
      'Algorithmic matching to 300+ biopharma and medtech BD groups scored on therapeutic alignment, pipeline gaps, deal history, and financial capacity.',
    metric: '300+ companies \u00b7 10K+ deal terms',
    href: '/partners',
  },
  {
    name: 'Regulatory Intelligence',
    icon: Shield,
    description:
      'FDA/EMA/PMDA pathway recommendation, designation eligibility, timeline benchmarking, and reimbursement strategy for drugs, devices, and diagnostics.',
    metric: 'FDA + EMA + PMDA \u00b7 510(k) + PMA',
    href: '/regulatory',
  },
];

export const PERSONAS = [
  {
    icon: Building2,
    title: 'Biotech Founders & CEOs',
    subtitle: 'Series A\u2013C',
    pain: 'You\u2019re raising a round, negotiating a licensing deal, or evaluating a pipeline pivot \u2014 and you need defensible market data in 48 hours, not 3 weeks from a consulting firm.',
    solve:
      'Terrain delivers board-grade TAM/SAM/SOM, competitive crowding scores, and partner fit rankings in under 10 minutes. Every number is sourced. Every chart is presentation-ready.',
  },
  {
    icon: Briefcase,
    title: 'BD & Licensing Executives',
    subtitle: 'Pharma & Biotech',
    pain: 'You evaluate 8\u201312 opportunities per quarter. Each one needs a market assessment before the term sheet \u2014 and your analysts are perpetually bottlenecked on the last deal.',
    solve:
      'Run unlimited analyses across indications, geographies, and product categories. Export deal-ready PDFs with competitive landscapes, deal-term benchmarks from 10,000+ transactions, and regulatory timelines.',
  },
  {
    icon: PieChart,
    title: 'Life Sciences Investors',
    subtitle: 'VC, Crossover & PE',
    pain: 'You have 40 companies in your pipeline and need to separate the $10B opportunities from the $500M niches before writing the check \u2014 without waiting on an associate\u2019s desk research.',
    solve:
      'Validate market size in minutes, not weeks. Compare competitive density across indications, benchmark deal terms against actual transaction data, and export for your investment committee.',
  },
];

export const STEPS = [
  {
    number: '01',
    title: 'Select product & indication',
    description:
      'Choose your product category (pharmaceutical, device, diagnostic, or nutraceutical) and indication. Specify biomarker subtype, geography, and development stage.',
  },
  {
    number: '02',
    title: 'Generate your analysis',
    description:
      'Terrain runs patient-funnel market sizing, maps the competitive pipeline from live ClinicalTrials.gov data, scores partner matches against 10K+ deal terms, and recommends regulatory pathways \u2014 in under 30 seconds.',
  },
  {
    number: '03',
    title: 'Export & act',
    description:
      'Download institutional-grade PDFs and CSVs. Every number is sourced. Every chart is presentation-ready for board decks, investment memos, and licensing committee deliverables.',
  },
];

export const BEFORE_AFTER = [
  { label: 'Time to market assessment', before: '2\u20133 weeks', after: '< 30 seconds' },
  { label: 'Cost per analysis', before: '$15K\u2013$50K', after: '$149/mo unlimited' },
  {
    label: 'Patient population specificity',
    before: 'All-comers (broad indication)',
    after: 'Biomarker-specific subtypes (160+ biomarkers)',
  },
  {
    label: 'Competitive landscape data',
    before: 'Stale (quarterly updates)',
    after: 'Live feeds (Trials, FDA, SEC EDGAR)',
  },
  {
    label: 'Deal term benchmarks',
    before: 'Anecdotal / industry averages',
    after: 'Actual terms from 10K+ transactions',
  },
  { label: 'Product category coverage', before: 'Pharma only', after: 'Pharma, devices, diagnostics, nutraceuticals' },
  { label: 'Partner matching', before: 'Relationship-driven guesswork', after: 'Algorithmic scoring (300+ companies)' },
  { label: 'Geography coverage', before: 'US-only (usually)', after: 'US, EU5, Japan, China, RoW' },
];

export const PRICING = [
  {
    name: 'Free',
    price: 0,
    annualPrice: 0,
    annualTotal: 0,
    period: '',
    description: 'Explore the platform with core market intelligence.',
    cta: 'Start for free',
    href: '/signup',
    highlighted: false,
    features: [
      '3 market sizing reports / month',
      '1 competitive landscape / month',
      'Limited partner discovery',
      '3 saved reports',
      'US geography only',
    ],
  },
  {
    name: 'Pro',
    price: 149,
    annualPrice: 124,
    annualTotal: 1490,
    period: '/mo',
    description: 'Full intelligence suite for active deal-makers.',
    cta: 'Start Pro trial',
    href: '/signup?plan=pro',
    highlighted: true,
    features: [
      'Unlimited market sizing',
      'Unlimited competitive landscapes',
      'Full partner discovery engine',
      'Regulatory intelligence',
      'Live market intelligence feeds',
      'PDF & CSV export',
      'Global geography coverage',
      'Unlimited saved reports',
    ],
  },
  {
    name: 'Team',
    price: 499,
    annualPrice: 416,
    annualTotal: 4990,
    period: '/mo',
    description: 'Shared intelligence for deal teams and BD groups.',
    cta: 'Contact us',
    href: '/signup?plan=team',
    highlighted: false,
    features: [
      'Everything in Pro',
      '5 team seats included',
      'Shared report library',
      'API access',
      'Team analytics dashboard',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise',
    price: -1,
    annualPrice: -1,
    annualTotal: 0,
    period: '',
    description: 'Custom intelligence infrastructure for large organizations.',
    cta: 'Contact sales',
    href: 'mailto:team@ambrosiaventures.co?subject=Terrain Enterprise',
    highlighted: false,
    features: [
      'Everything in Team',
      'Unlimited seats',
      'White-label reports',
      'Dedicated customer success manager',
      'Custom integrations & API priority',
      'SLA & enterprise security review',
    ],
  },
];

export const FAQ = [
  {
    q: 'Where does Terrain\u2019s data come from?',
    a: 'Five primary sources: ClinicalTrials.gov (live competitive pipeline), FDA/EMA approval databases, SEC EDGAR filings (partnership and deal disclosures, AI-extracted), WHO Global Burden of Disease (epidemiology), and a proprietary database of 10,000+ biopharma M&A and licensing transactions built by Ambrosia Ventures.',
  },
  {
    q: 'How current is the competitive data?',
    a: 'ClinicalTrials.gov data updates nightly via automated pipelines. FDA approvals and SEC EDGAR filings are processed within 24 hours. Epidemiology and pricing benchmarks are updated quarterly. Pro users get access to live market intelligence feeds with data source health dashboards.',
  },
  {
    q: 'Can I trust the market sizing numbers for a board presentation?',
    a: 'Yes. Every output includes a methodology section and data sources footer with specific citations. The patient-funnel methodology (prevalence \u2192 diagnosed \u2192 treated \u2192 addressable \u2192 capturable) follows the same framework used by top-tier equity research analysts at Goldman Sachs and Morgan Stanley.',
  },
  {
    q: 'Does Terrain support biomarker-specific analysis?',
    a: 'Yes. Terrain tracks 160+ biomarkers across oncology, neurology, immunology, and other therapeutic areas. You can size markets for specific subtypes \u2014 for example, EGFR-mutant NSCLC or HER2-low breast cancer \u2014 with prevalence-adjusted patient funnels and subtype-specific competitive landscapes.',
  },
  {
    q: 'Does Terrain cover medical devices and diagnostics, or just pharma?',
    a: 'Four product categories: pharmaceuticals, medical devices (implantable, surgical, SaMD), in vitro diagnostics (IVD/CDx), and nutraceuticals. Each category uses the appropriate sizing methodology \u2014 patient funnels for drugs, procedure volumes for devices, test volumes for diagnostics \u2014 with category-specific regulatory pathways and partner databases.',
  },
  {
    q: 'What\u2019s the difference between Pro and Team?',
    a: 'Pro is for individual professionals \u2014 unlimited analyses, full module access, live market intelligence feeds, and export capabilities. Team adds 5 seats, a shared report library, API access, and a team analytics dashboard for BD groups working collaboratively.',
  },
  {
    q: 'How many indications and therapeutic areas do you support?',
    a: '150+ indications across 15+ therapeutic areas including oncology, neurology, immunology, rare disease, cardio-metabolic, GI, rheumatology, endocrinology, and more. Each indication includes detailed subtypes, biomarker profiles, standard-of-care data, and competitive intelligence.',
  },
  {
    q: 'Is my data secure?',
    a: 'Terrain runs on Supabase (PostgreSQL) with row-level security, encrypted at rest and in transit. Your analyses and saved reports are only visible to your account (or your team on the Team plan). We never share or sell user data.',
  },
];

export const STATS = [
  { value: 150, suffix: '+', label: 'Indications' },
  { value: 300, suffix: '+', label: 'Partners Mapped' },
  { value: 10, suffix: 'K+', label: 'Deals Analyzed' },
  { value: 30, suffix: 's', prefix: '<', label: 'Time to Insight' },
];

export const TERMINAL_LINES = [
  { label: 'US TAM', value: '$24.8B', color: 'text-teal-400' },
  { label: 'US SAM', value: '$8.2B', color: 'text-teal-400' },
  { label: 'Peak Revenue (base)', value: '$1.4B', color: 'text-white' },
  { label: '5-yr CAGR', value: '+12.3%', color: 'text-emerald-400' },
];

export const TERMINAL_LINES_2 = [
  { label: 'Competitors', value: '14 assets (crowding: 7/10)', color: 'text-amber-400' },
  { label: 'Top Partner Match', value: 'Merck \u2014 92/100', color: 'text-white' },
];

export const DEMO_INDICATIONS = [
  {
    name: 'KRAS G12C \u00b7 NSCLC',
    tam: '$24.8B',
    sam: '$8.2B',
    som: '$1.4B',
    cagr: '+12.3%',
    competitors: 14,
    crowding: 7,
    partner: 'Merck',
    partnerScore: 92,
  },
  {
    name: 'EGFR Exon20 \u00b7 NSCLC',
    tam: '$18.6B',
    sam: '$4.1B',
    som: '$0.9B',
    cagr: '+15.8%',
    competitors: 8,
    crowding: 5,
    partner: 'AstraZeneca',
    partnerScore: 88,
  },
  {
    name: 'HER2-low \u00b7 Breast',
    tam: '$31.2B',
    sam: '$12.5B',
    som: '$2.1B',
    cagr: '+9.7%',
    competitors: 11,
    crowding: 6,
    partner: 'Daiichi Sankyo',
    partnerScore: 95,
  },
];

export const REVENUE_BARS = [12, 28, 52, 85, 120, 140, 138, 130, 115, 95];

export const GEO_ROWS = [
  { geo: 'United States', tam: '$24.8B', share: '42%', w: 100 },
  { geo: 'EU5', tam: '$18.2B', share: '31%', w: 73 },
  { geo: 'Japan', tam: '$6.1B', share: '10%', w: 25 },
  { geo: 'China', tam: '$7.4B', share: '13%', w: 30 },
  { geo: 'Rest of World', tam: '$2.4B', share: '4%', w: 10 },
];

export const PARTNER_DATA = [
  { name: 'Merck', score: 92, reason: 'Keytruda combo strategy, NSCLC focus' },
  { name: 'AstraZeneca', score: 88, reason: 'Tagrisso franchise, strong lung oncology' },
  { name: 'Roche', score: 85, reason: 'Tecentriq positioning, IO combinations' },
];

export const PARTNER_PREVIEW_DATA = [
  {
    rank: 1,
    company: 'Merck',
    matchScore: 92,
    scores: [
      { label: 'Therapeutic', value: 95 },
      { label: 'Pipeline Gap', value: 88 },
      { label: 'Deal History', value: 90 },
      { label: 'Financial', value: 94 },
      { label: 'Geo Fit', value: 85 },
      { label: 'Strategic', value: 96 },
    ],
    deal: 'Prometheus Bio \u2014 $10.8B (2023)',
    terms: '$150M\u2013$400M upfront \u00b7 $800M\u2013$1.5B milestones \u00b7 15\u201320% royalty',
  },
  {
    rank: 2,
    company: 'AstraZeneca',
    matchScore: 88,
    scores: [
      { label: 'Therapeutic', value: 92 },
      { label: 'Pipeline Gap', value: 82 },
      { label: 'Deal History', value: 90 },
      { label: 'Financial', value: 88 },
      { label: 'Geo Fit', value: 90 },
      { label: 'Strategic', value: 86 },
    ],
    deal: 'Daiichi Sankyo ADC \u2014 $5.5B (2023)',
    terms: '$100M\u2013$300M upfront \u00b7 $600M\u2013$1.2B milestones \u00b7 12\u201318% royalty',
  },
  {
    rank: 3,
    company: 'Roche',
    matchScore: 85,
    scores: [
      { label: 'Therapeutic', value: 88 },
      { label: 'Pipeline Gap', value: 80 },
      { label: 'Deal History', value: 86 },
      { label: 'Financial', value: 90 },
      { label: 'Geo Fit', value: 84 },
      { label: 'Strategic', value: 82 },
    ],
    deal: 'Carmot Therapeutics \u2014 $2.7B (2023)',
    terms: '$100M\u2013$250M upfront \u00b7 $500M\u2013$1.0B milestones \u00b7 10\u201316% royalty',
  },
];

export const REGULATORY_PREVIEW = {
  pathway: 'Standard BLA with Breakthrough Therapy Designation',
  division: 'Division of Oncology 2 (CDER)',
  timelines: [
    { label: 'Optimistic', months: 42, pct: 62, color: 'bg-emerald-400/60' },
    { label: 'Realistic', months: 54, pct: 79, color: 'bg-white/60' },
    { label: 'Pessimistic', months: 68, pct: 100, color: 'bg-amber-400/60' },
  ],
  designations: [
    {
      name: 'Breakthrough Therapy',
      status: 'Likely',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10 border-emerald-400/20',
    },
    {
      name: 'Fast Track',
      status: 'Likely',
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10 border-emerald-400/20',
    },
    {
      name: 'Priority Review',
      status: 'Possible',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10 border-amber-400/20',
    },
    {
      name: 'Accelerated Approval',
      status: 'Possible',
      color: 'text-amber-400',
      bg: 'bg-amber-400/10 border-amber-400/20',
    },
    {
      name: 'Orphan Drug',
      status: 'Unlikely',
      color: 'text-slate-500',
      bg: 'bg-slate-500/10 border-slate-500/20',
    },
  ],
  risks: [
    {
      title: 'Competitive Filing',
      severity: 'High',
      color: 'border-red-400/60',
      badge: 'text-red-400 bg-red-400/10',
    },
    {
      title: 'Clinical Endpoint',
      severity: 'Medium',
      color: 'border-amber-400/60',
      badge: 'text-amber-400 bg-amber-400/10',
    },
    {
      title: 'Manufacturing',
      severity: 'Low',
      color: 'border-emerald-400/60',
      badge: 'text-emerald-400 bg-emerald-400/10',
    },
  ],
  comparables: [
    {
      drug: 'Sotorasib',
      company: 'Amgen',
      months: 44,
      pathway: 'Accelerated',
      pathColor: 'text-emerald-400',
    },
    {
      drug: 'Adagrasib',
      company: 'Mirati',
      months: 52,
      pathway: 'Standard BLA',
      pathColor: 'text-slate-400',
    },
    {
      drug: 'Lumakras sNDA',
      company: 'Amgen',
      months: 38,
      pathway: 'Priority Review',
      pathColor: 'text-teal-400',
    },
  ],
};

export const DEMO_STAGES = [
  { value: 'preclinical', label: 'Preclinical' },
  { value: 'phase1', label: 'Phase 1' },
  { value: 'phase2', label: 'Phase 2' },
  { value: 'phase3', label: 'Phase 3' },
];

export const DEMO_SUGGESTIONS = [
  'Non-Small Cell Lung Cancer',
  'Multiple Myeloma',
  'Atopic Dermatitis',
  'Rheumatoid Arthritis',
];

export const STATUS_MESSAGES = [
  'Fetching epidemiology data...',
  'Computing patient funnel...',
  'Sizing addressable market...',
  'Generating report...',
];
