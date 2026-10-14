-- ==============================================================================
-- SPELLCODE SUPABASE MIGRATION 002: ROW LEVEL SECURITY (RLS) POLICIES
-- Description: Enable RLS and define granular access policies
-- ==============================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familiars ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_familiars ENABLE ROW LEVEL SECURITY;

-- 2. Public Catalog Policies (Read-only for all clients, both anon & authenticated)
CREATE POLICY "Public levels are readable by everyone"
  ON public.levels FOR SELECT
  USING (true);

CREATE POLICY "Public achievements are readable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

CREATE POLICY "Public familiars are readable by everyone"
  ON public.familiars FOR SELECT
  USING (true);

-- 3. Profiles Policies (Users can read and update their own profile)
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile appearance"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Player Progress Policies (Users can view their own progress)
-- Note: Progress updates and level unlocks are server-authoritative via service role.
CREATE POLICY "Users can read their own progress"
  ON public.player_progress FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Level Attempts Policies (Audit log viewable only by owner)
CREATE POLICY "Users can read their own level attempts"
  ON public.level_attempts FOR SELECT
  USING (auth.uid() = user_id);

-- 6. Player Achievements Policies (Viewable only by owner)
CREATE POLICY "Users can read their own unlocked achievements"
  ON public.player_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- 7. Player Familiars Policies (Viewable only by owner)
CREATE POLICY "Users can read their own familiars collection"
  ON public.player_familiars FOR SELECT
  USING (auth.uid() = user_id);
