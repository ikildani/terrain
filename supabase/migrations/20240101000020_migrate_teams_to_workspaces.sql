-- ============================================================
-- Migration 020: Migrate Existing Teams to Workspaces
-- Backfill workspaces and members from profiles.team_owner_id
-- Idempotent — safe to re-run with ON CONFLICT DO NOTHING
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Create workspaces for team owners and inviters
-- ────────────────────────────────────────────────────────────

INSERT INTO public.workspaces (id, name, slug, owner_id, plan, max_seats, created_at, updated_at)
SELECT
  gen_random_uuid(),
  COALESCE(p.company, p.full_name, split_part(p.email, '@', 1)) AS name,
  LOWER(
    REGEXP_REPLACE(
      COALESCE(p.company, p.full_name, split_part(p.email, '@', 1)),
      '[^a-zA-Z0-9]+', '-', 'g'
    )
  ) || '-' || SUBSTR(gen_random_uuid()::TEXT, 1, 8) AS slug,
  p.id,
  'team',
  10,
  NOW(),
  NOW()
FROM public.profiles p
WHERE p.id IN (
  SELECT DISTINCT team_owner_id FROM public.profiles WHERE team_owner_id IS NOT NULL
  UNION
  SELECT DISTINCT inviter_id FROM public.team_invitations
)
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 2. Insert workspace members for owners (role = 'owner')
-- ────────────────────────────────────────────────────────────

INSERT INTO public.workspace_members (id, workspace_id, user_id, role, joined_at)
SELECT
  gen_random_uuid(),
  w.id,
  w.owner_id,
  'owner',
  w.created_at
FROM public.workspaces w
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 3. Insert workspace members for team members (role = 'analyst')
-- ────────────────────────────────────────────────────────────

INSERT INTO public.workspace_members (id, workspace_id, user_id, role, joined_at, invited_by)
SELECT
  gen_random_uuid(),
  w.id,
  p.id,
  'analyst',
  p.created_at,
  p.team_owner_id
FROM public.profiles p
JOIN public.workspaces w ON w.owner_id = p.team_owner_id
WHERE p.team_owner_id IS NOT NULL
  AND p.id != p.team_owner_id
ON CONFLICT DO NOTHING;
