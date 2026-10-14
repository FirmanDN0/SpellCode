-- ==============================================================================
-- SPELLCODE SUPABASE MIGRATION 002: ROW LEVEL SECURITY (RLS) POLICIES
-- Principle: Least Privilege, No Recursive Checks, Strict Player Isolation
-- ==============================================================================

-- 1. Enable RLS explicitly on all domain tables
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familiars ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_familiars ENABLE ROW LEVEL SECURITY;

-- 2. Public Catalog Policies (Read-Only access to game content)
-- Players and guests need to read game metadata, but NEVER modify it.
DROP POLICY IF EXISTS "Published levels are readable by everyone" ON public.levels;
CREATE POLICY "Published levels are readable by everyone"
  ON public.levels FOR SELECT
  USING (is_published = true);

DROP POLICY IF EXISTS "Achievements are readable by everyone" ON public.achievements;
CREATE POLICY "Achievements are readable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Familiars are readable by everyone" ON public.familiars;
CREATE POLICY "Familiars are readable by everyone"
  ON public.familiars FOR SELECT
  USING (true);

-- 3. Profiles Policies (Strict user isolation: auth.uid() = id)
-- Prevents any user from reading, modifying, or impersonating another player's profile.
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Player Progress Policies (Strict isolation: auth.uid() = user_id)
-- Progres hanya dapat dilihat dan dikelola oleh pemilik data yang sah.
DROP POLICY IF EXISTS "Users can read own progress" ON public.player_progress;
CREATE POLICY "Users can read own progress"
  ON public.player_progress FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.player_progress;
CREATE POLICY "Users can insert own progress"
  ON public.player_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.player_progress;
CREATE POLICY "Users can update own progress"
  ON public.player_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Level Attempts Policies (Append-only audit trail)
-- Percobaan hanya dapat dicatat dan dilihat oleh pemilik akun. Tidak dapat diubah atau dihapus.
DROP POLICY IF EXISTS "Users can view own attempts" ON public.level_attempts;
CREATE POLICY "Users can view own attempts"
  ON public.level_attempts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own attempts" ON public.level_attempts;
CREATE POLICY "Users can insert own attempts"
  ON public.level_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. Player Achievements Policies (Personal achievements collection)
DROP POLICY IF EXISTS "Users can view own achievements" ON public.player_achievements;
CREATE POLICY "Users can view own achievements"
  ON public.player_achievements FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.player_achievements;
CREATE POLICY "Users can insert own achievements"
  ON public.player_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 7. Player Familiars Policies (Personal familiar collection & active toggle)
DROP POLICY IF EXISTS "Users can view own familiars" ON public.player_familiars;
CREATE POLICY "Users can view own familiars"
  ON public.player_familiars FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own familiars" ON public.player_familiars;
CREATE POLICY "Users can insert own familiars"
  ON public.player_familiars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own active familiar" ON public.player_familiars;
CREATE POLICY "Users can update own active familiar"
  ON public.player_familiars FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
