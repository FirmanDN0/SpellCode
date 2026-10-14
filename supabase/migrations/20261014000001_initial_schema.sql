-- ==============================================================================
-- SPELLCODE SUPABASE MIGRATION 001: INITIAL SCHEMA
-- Description: Core tables for profiles, levels, progress, attempts, achievements, familiars
-- ==============================================================================

-- 1. Helper function for automated updated_at timestamping
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Profiles table (links 1-to-1 with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Penyihir Cilik',
  avatar_id TEXT NOT NULL DEFAULT 'apprentice_default',
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  wizard_rank TEXT NOT NULL DEFAULT 'Novice Conjurer',
  active_familiar_id TEXT NOT NULL DEFAULT 'pyx_fire_cat',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_total_xp ON public.profiles(total_xp DESC);

CREATE OR REPLACE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 3. Levels table (Authoritative campaign catalog)
CREATE TABLE IF NOT EXISTS public.levels (
  id TEXT PRIMARY KEY,
  world_number INTEGER NOT NULL CHECK (world_number IN (1, 2)),
  level_number INTEGER NOT NULL CHECK (level_number > 0),
  world_title TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  concept_tag TEXT NOT NULL,
  par_steps INTEGER NOT NULL CHECK (par_steps > 0),
  base_xp INTEGER NOT NULL DEFAULT 100 CHECK (base_xp > 0),
  allowed_runes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_levels_world_order ON public.levels(world_number, level_number);

-- 4. Player progress table (Status unlock and stars per level)
CREATE TABLE IF NOT EXISTS public.player_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('unlocked', 'completed')),
  stars INTEGER NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  best_step_count INTEGER NOT NULL DEFAULT 0 CHECK (best_step_count >= 0),
  best_solution_ast JSONB,
  attempts_count INTEGER NOT NULL DEFAULT 0 CHECK (attempts_count >= 0),
  first_completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_level UNIQUE (user_id, level_id)
);

CREATE INDEX IF NOT EXISTS idx_player_progress_user ON public.player_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_player_progress_user_level ON public.player_progress(user_id, level_id);

CREATE OR REPLACE TRIGGER trigger_player_progress_updated_at
  BEFORE UPDATE ON public.player_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Level attempts table (Audit log of program executions)
CREATE TABLE IF NOT EXISTS public.level_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level_id TEXT NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  is_success BOOLEAN NOT NULL DEFAULT false,
  steps_taken INTEGER NOT NULL CHECK (steps_taken >= 0),
  stars_earned INTEGER NOT NULL DEFAULT 0 CHECK (stars_earned BETWEEN 0 AND 3),
  xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  submitted_ast JSONB NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_level_attempts_user_level ON public.level_attempts(user_id, level_id, created_at DESC);

-- 6. Achievements catalog
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Player achievements table
CREATE TABLE IF NOT EXISTS public.player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_player_achievements_user ON public.player_achievements(user_id);

-- 8. Familiars catalog
CREATE TABLE IF NOT EXISTS public.familiars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  element TEXT NOT NULL,
  description TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Player familiars collection
CREATE TABLE IF NOT EXISTS public.player_familiars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  familiar_id TEXT NOT NULL REFERENCES public.familiars(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_familiar UNIQUE (user_id, familiar_id)
);

CREATE INDEX IF NOT EXISTS idx_player_familiars_user ON public.player_familiars(user_id);
