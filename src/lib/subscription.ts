export const PLAN_LIMITS = {
  free: {
    market_sizing: 3,
    competitive: 1,
    pipeline: 5,
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
    pipeline: -1,
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
    pipeline: -1,
    partners: -1,
    regulatory: -1,
    reports_saved: -1,
    export_pdf: true,
    export_csv: true,
    team_sharing: true,
    api_access: true,
    seats: 5,
  },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;
export type FeatureKey = keyof typeof PLAN_LIMITS.pro;

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
    tagline: '5 seats with collaboration and API access',
    color: 'amber',
    badge: 'Best Value',
  },
} as const;
