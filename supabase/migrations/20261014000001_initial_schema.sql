-- ==============================================================================
-- SPELLCODE SUPABASE MIGRATION 001: INITIAL SCHEMA
-- Based on: docs/DATABASE_DESIGN.md specification
-- Description: Core tables with robust constraints, foreign keys, and indexes
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
  username VARCHAR(30) UNIQUE NOT NULL,
  display_name VARCHAR(50) NOT NULL DEFAULT 'Penyihir Cilik',
  avatar_id VARCHAR(50) NOT NULL DEFAULT 'apprentice_default',
  total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  wizard_rank VARCHAR(30) NOT NULL DEFAULT 'Novice Conjurer',
  active_familiar_id VARCHAR(50) NOT NULL DEFAULT 'pyx_fire_cat',
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
  id VARCHAR(50) PRIMARY KEY,
  world_number SMALLINT NOT NULL CHECK (world_number > 0),
  level_number SMALLINT NOT NULL CHECK (level_number > 0),
  world_title VARCHAR(100) NOT NULL DEFAULT '',
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  concept_tag VARCHAR(50) NOT NULL DEFAULT 'Sequencing',
  objective_text VARCHAR(255) NOT NULL DEFAULT '',
  grid_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  allowed_runes JSONB NOT NULL DEFAULT '[]'::jsonb,
  par_steps INTEGER NOT NULL CHECK (par_steps > 0),
  base_xp INTEGER NOT NULL DEFAULT 50 CHECK (base_xp >= 0),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_world_level UNIQUE (world_number, level_number)
);

CREATE INDEX IF NOT EXISTS idx_levels_world_order ON public.levels(world_number, level_number);

-- 4. Player progress table (Status unlock and stars per level)
CREATE TABLE IF NOT EXISTS public.player_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level_id VARCHAR(50) NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'unlocked' CHECK (status IN ('unlocked', 'completed')),
  stars SMALLINT NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
  best_step_count INTEGER DEFAULT NULL,
  best_solution_ast JSONB DEFAULT NULL,
  attempts_count INTEGER NOT NULL DEFAULT 0 CHECK (attempts_count >= 0),
  first_completed_at TIMESTAMPTZ DEFAULT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_user_level UNIQUE (user_id, level_id)
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
  level_id VARCHAR(50) NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  submitted_ast JSONB NOT NULL,
  is_success BOOLEAN NOT NULL DEFAULT false,
  result_status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS' CHECK (result_status IN ('SUCCESS', 'HIT_OBSTACLE', 'OUT_OF_BOUNDS', 'OVERFLOW', 'MISSED_OBJECTIVE')),
  steps_taken INTEGER NOT NULL CHECK (steps_taken >= 0),
  stars_earned INTEGER NOT NULL DEFAULT 0 CHECK (stars_earned BETWEEN 0 AND 3),
  xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  execution_time_ms INTEGER NOT NULL DEFAULT 0,
  error_message TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_level_attempts_user_level ON public.level_attempts(user_id, level_id, created_at DESC);

-- 6. Achievements catalog
CREATE TABLE IF NOT EXISTS public.achievements (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon_name VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Player achievements table
CREATE TABLE IF NOT EXISTS public.player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_player_achievements_user ON public.player_achievements(user_id);

-- 8. Familiars catalog
CREATE TABLE IF NOT EXISTS public.familiars (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  species VARCHAR(50) NOT NULL DEFAULT 'Companion',
  element VARCHAR(30) NOT NULL DEFAULT 'Neutral',
  lore_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  asset_key VARCHAR(100) NOT NULL DEFAULT 'pyx_fire_cat',
  rarity VARCHAR(30) NOT NULL DEFAULT 'common',
  unlock_xp_required INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Player familiars collection
CREATE TABLE IF NOT EXISTS public.player_familiars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  familiar_id VARCHAR(50) NOT NULL REFERENCES public.familiars(id) ON DELETE CASCADE,
  bond_level INTEGER NOT NULL DEFAULT 1 CHECK (bond_level >= 1),
  is_active BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_user_familiar UNIQUE (user_id, familiar_id)
);

CREATE INDEX IF NOT EXISTS idx_player_familiars_user ON public.player_familiars(user_id);
