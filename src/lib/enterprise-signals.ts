/**
 * Enterprise Nudge Signal Engine
 *
 * Checks workspace usage patterns to determine whether a team-plan workspace
 * would genuinely benefit from upgrading to enterprise. Only fires a nudge
 * when 2+ behavioural signals are present — the goal is helpful suggestion,
 * not aggressive upselling.
 */

import { createAdminClient } from '@/lib/supabase/admin';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface EnterpriseSignals {
  highMemberCount: boolean;
  frequentExports: boolean;
  multipleRolesNeeded: boolean;
  highApiPotential: boolean;
  complianceNeeds: boolean;
}

export interface EnterpriseSignal {
  shouldNudge: boolean;
  reason: string | null;
  signals: EnterpriseSignals;
}

// ────────────────────────────────────────────────────────────
// Thresholds
// ────────────────────────────────────────────────────────────

const SEAT_LIMIT = 10;
const HIGH_MEMBER_THRESHOLD = 7;
const HIGH_API_POTENTIAL_THRESHOLD = 50;
const FREQUENT_EXPORT_THRESHOLD = 20;

// ────────────────────────────────────────────────────────────
// Main function
// ────────────────────────────────────────────────────────────

export async function checkEnterpriseSignals(workspaceId: string): Promise<EnterpriseSignal> {
  const admin = createAdminClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString();

  // Run all queries in parallel for performance
  const [membersResult, activitiesResult, workspaceResult] = await Promise.all([
    // 1. Count workspace members
    admin.from('workspace_members').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),

    // 2. Get workspace activities for last 30 days (actions we care about)
    admin
      .from('workspace_activities')
      .select('action, resource_type, metadata')
      .eq('workspace_id', workspaceId)
      .gte('created_at', since),

    // 3. Get workspace metadata (for compliance signal — company info)
    admin.from('workspaces').select('name, metadata').eq('id', workspaceId).single(),
  ]);

  const memberCount = membersResult.count ?? 0;
  const activities = activitiesResult.data ?? [];

  // ── Signal: High member count ────────────────────────────
  const highMemberCount = memberCount >= HIGH_MEMBER_THRESHOLD;

  // ── Signal: Frequent exports ─────────────────────────────
  const exportCount = activities.filter(
    (a) =>
      a.action === 'export' || a.action === 'export_pdf' || a.action === 'export_excel' || a.action === 'export_csv',
  ).length;
  const frequentExports = exportCount >= FREQUENT_EXPORT_THRESHOLD;

  // ── Signal: Multiple roles needed ────────────────────────
  // Detect if anyone attempted to set viewer/analyst permissions
  // (actions like role_change_attempted or viewing RBAC-related pages)
  const multipleRolesNeeded = activities.some(
    (a) =>
      a.action === 'role_change_attempted' ||
      a.action === 'member_role_update' ||
      (a.resource_type === 'member' && a.action === 'update'),
  );

  // ── Signal: High API potential ───────────────────────────
  const analysisCount = activities.filter(
    (a) => a.action === 'analysis_run' || a.action === 'report_generated' || a.action === 'analysis_completed',
  ).length;
  const highApiPotential = analysisCount >= HIGH_API_POTENTIAL_THRESHOLD;

  // ── Signal: Compliance needs ─────────────────────────────
  // Check workspace name / metadata for healthcare/pharma indicators
  const wsName = (workspaceResult.data?.name ?? '').toLowerCase();
  const wsMetadata = workspaceResult.data?.metadata as Record<string, unknown> | null;
  const industry = ((wsMetadata?.industry as string) ?? '').toLowerCase();

  const complianceKeywords = [
    'pharma',
    'pharmaceutical',
    'biotech',
    'healthcare',
    'hospital',
    'clinical',
    'medical',
    'therapeutics',
    'biosciences',
    'health',
    'oncology',
    'genomics',
    'diagnostics',
    'regulatory',
  ];
  const complianceNeeds = complianceKeywords.some((kw) => wsName.includes(kw) || industry.includes(kw));

  // ── Aggregate signals ────────────────────────────────────
  const signals: EnterpriseSignals = {
    highMemberCount,
    frequentExports,
    multipleRolesNeeded,
    highApiPotential,
    complianceNeeds,
  };

  const activeSignals = Object.values(signals).filter(Boolean).length;
  const shouldNudge = activeSignals >= 2;

  // ── Build human-readable reason ──────────────────────────
  let reason: string | null = null;

  if (shouldNudge) {
    // Pick the strongest / most compelling signal to lead with
    if (highMemberCount && highApiPotential) {
      reason = `Your team is using ${memberCount} of ${SEAT_LIMIT} seats and ran ${analysisCount} analyses this month. Enterprise offers unlimited seats and API access for programmatic integration.`;
    } else if (highMemberCount) {
      reason = `Your team is using ${memberCount} of ${SEAT_LIMIT} seats. Enterprise offers unlimited seats and role-based access control.`;
    } else if (highApiPotential) {
      reason = `Your team ran ${analysisCount} analyses this month. Enterprise includes API access for programmatic integration.`;
    } else if (frequentExports) {
      reason = `Your team exported ${exportCount} reports this month. Enterprise includes advanced export capabilities, API access, and white-label branding.`;
    } else if (complianceNeeds && multipleRolesNeeded) {
      reason = `Enterprise includes compliance-grade audit logging and granular role-based access control for regulated teams.`;
    } else if (complianceNeeds) {
      reason = `Enterprise includes compliance-grade audit logging and SSO — built for regulated industries.`;
    } else if (multipleRolesNeeded) {
      reason = `Enterprise includes granular role-based access control with viewer, analyst, and admin permissions.`;
    } else {
      reason = `Your workspace usage suggests Enterprise features like API access, audit logging, and SSO could help your team.`;
    }
  }

  return { shouldNudge, reason, signals };
}
