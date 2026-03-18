export const PLAN_LIMITS = {
  free: {
    market_sizing: 3,
    competitive: 1,
    partners: 0,
    regulatory: 0,
    reports_saved: 3,
    export_pdf: false,
    export_csv: false,
    team_sharing: false,
  },
  pro: {
    market_sizing: -1,
    competitive: -1,
    partners: -1,
    regulatory: -1,
    reports_saved: -1,
    export_pdf: true,
    export_csv: true,
    team_sharing: false,
  },
  team: {
    market_sizing: -1,
    competitive: -1,
    partners: -1,
    regulatory: -1,
    reports_saved: -1,
    export_pdf: true,
    export_csv: true,
    team_sharing: true,
    api_access: false,
    seats: 10,
    workspace: true,
    activity_feed: true,
    annotations: true,
    comparison_mode: true,
    templates: true,
    team_analytics: true,
    export_branding: true,
    sso: false,
    audit_log: false,
    information_barriers: false,
    white_label: false,
  },
  enterprise: {
    market_sizing: -1,
    competitive: -1,
    partners: -1,
    regulatory: -1,
    reports_saved: -1,
    export_pdf: true,
    export_csv: true,
    team_sharing: true,
    api_access: true,
    seats: -1,
    workspace: true,
    activity_feed: true,
    annotations: true,
    comparison_mode: true,
    templates: true,
    team_analytics: true,
    export_branding: true,
    sso: true,
    audit_log: true,
    information_barriers: true,
    white_label: true,
  },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;
export type FeatureKey = keyof typeof PLAN_LIMITS.enterprise;

export function hasFeatureAccess(plan: PlanKey, feature: FeatureKey): boolean {
  const limits = PLAN_LIMITS[plan];
  const value = (limits as Record<string, number | boolean>)[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return false;
}

export function getFeatureLimit(plan: PlanKey, feature: FeatureKey): number {
  const limits = PLAN_LIMITS[plan];
  const value = (limits as Record<string, number | boolean>)[feature];
  if (typeof value === 'number') return value;
  return 0;
}

export function isUnlimited(plan: PlanKey, feature: FeatureKey): boolean {
  return getFeatureLimit(plan, feature) === -1;
}

export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRO_PRICE_ID!,
  team_monthly: process.env.STRIPE_TEAM_PRICE_ID!,
} as const;

export const PLAN_DISPLAY = {
  free: {
    name: 'Free',
    price: '$0',
    tagline: 'Get started with market intelligence',
    color: 'slate',
  },
  pro: {
    name: 'Pro',
    price: '$149',
    period: '/month',
    tagline: 'Full intelligence suite for active BD teams',
    color: 'teal',
    badge: 'Most Popular',
  },
  team: {
    name: 'Team',
    price: '$499',
    period: '/month',
    tagline: '10 seats with shared workspace and collaboration',
    color: 'amber',
    badge: 'Best Value',
  },
  enterprise: {
    name: 'Enterprise',
    price: 'Custom',
    tagline: 'Unlimited seats, SSO, API, audit logs, and white-label',
    color: 'purple',
    badge: 'Contact Sales',
    features: [
      'All Pro and Team features included',
      'Unlimited seats — add your entire organization',
      'REST API access with key management',
      'SSO / SAML (Okta, Azure AD, custom providers)',
      'Comprehensive audit log for compliance',
      'Role-based access control (Admin, Analyst, Viewer)',
      'Information barriers — isolated deal rooms',
      'White-label reports with custom branding',
      'Enterprise SLA with dedicated support',
      'Security review and custom data agreements',
    ],
  },
} as const;

export const ENTERPRISE_FEATURES = [
  { label: 'Unlimited seats', description: 'Add your entire team with no per-seat limits' },
  { label: 'REST API access', description: 'Programmatic access with API key management' },
  { label: 'SSO / SAML', description: 'Okta, Azure AD, and custom SAML providers' },
  { label: 'Audit log', description: 'Comprehensive activity tracking for compliance' },
  { label: 'Role-based access control', description: 'Admin, analyst, viewer permission levels' },
  { label: 'Information barriers', description: 'Deal rooms with isolated data access' },
  { label: 'White-label reports', description: 'Custom branding on all exported materials' },
  { label: 'SLA & security review', description: 'Enterprise SLA with dedicated support' },
  { label: 'All Pro features', description: 'Full access to every analytics module' },
] as const;
