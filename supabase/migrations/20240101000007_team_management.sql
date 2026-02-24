-- ============================================================
-- TEAM MANAGEMENT — Invitations & Member Linking
-- ============================================================

-- Add team_owner_id to profiles so members can be linked to a team owner
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS team_owner_id UUID REFERENCES public.profiles(id);

-- Team invitations table
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(inviter_id, email)
);

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Team owners can manage their own invitations
CREATE POLICY "Team owners manage invitations"
  ON public.team_invitations FOR ALL
  USING (auth.uid() = inviter_id);

-- Allow invited users to see their own invitations (for auto-accept on signup)
CREATE POLICY "Invited users can see own invitations"
  ON public.team_invitations FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Auto-link new users to their team on signup
CREATE OR REPLACE FUNCTION public.handle_team_invitation_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this new user's email has a pending team invitation
  UPDATE public.profiles
  SET team_owner_id = ti.inviter_id
  FROM public.team_invitations ti
  WHERE profiles.id = NEW.id
    AND ti.email = NEW.email
    AND ti.status = 'pending';

  -- Mark invitation as accepted
  UPDATE public.team_invitations
  SET status = 'accepted', accepted_at = NOW()
  WHERE email = NEW.email AND status = 'pending';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger fires after user is created (runs after handle_new_user)
DROP TRIGGER IF EXISTS on_auth_user_created_team ON auth.users;
CREATE TRIGGER on_auth_user_created_team
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_team_invitation_on_signup();

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_team_invitations_inviter ON public.team_invitations(inviter_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_profiles_team_owner ON public.profiles(team_owner_id);
