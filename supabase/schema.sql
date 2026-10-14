-- ==============================================================================
-- SPELLCODE SUPABASE FULL CONSOLIDATED SCHEMA (MIGRATIONS 001 - 004)
-- Run this in the Supabase Dashboard SQL Editor for a clean 1-click setup.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. UTILITY FUNCTIONS & SCHEMAS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. TABLE DEFINITIONS
-- ------------------------------------------------------------------------------

-- Profiles (Linked 1-to-1 with auth.users)
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

-- Levels Catalog
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

-- Player Progress
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

-- Level Attempts (Audit log of program executions)
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

-- Achievements Catalog
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Player Achievements
CREATE TABLE IF NOT EXISTS public.player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_player_achievements_user ON public.player_achievements(user_id);

-- Familiars Catalog
CREATE TABLE IF NOT EXISTS public.familiars (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  element TEXT NOT NULL,
  description TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Player Familiars
CREATE TABLE IF NOT EXISTS public.player_familiars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  familiar_id TEXT NOT NULL REFERENCES public.familiars(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_user_familiar UNIQUE (user_id, familiar_id)
);

CREATE INDEX IF NOT EXISTS idx_player_familiars_user ON public.player_familiars(user_id);

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familiars ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_familiars ENABLE ROW LEVEL SECURITY;

-- Catalog Policies (Public Read)
CREATE POLICY "Public levels are readable by everyone"
  ON public.levels FOR SELECT USING (true);

CREATE POLICY "Public achievements are readable by everyone"
  ON public.achievements FOR SELECT USING (true);

CREATE POLICY "Public familiars are readable by everyone"
  ON public.familiars FOR SELECT USING (true);

-- Profiles Policies
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile appearance"
  ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Player Progress Policies
CREATE POLICY "Users can read their own progress"
  ON public.player_progress FOR SELECT USING (auth.uid() = user_id);

-- Level Attempts Policies
CREATE POLICY "Users can read their own level attempts"
  ON public.level_attempts FOR SELECT USING (auth.uid() = user_id);

-- Player Achievements Policies
CREATE POLICY "Users can read their own unlocked achievements"
  ON public.player_achievements FOR SELECT USING (auth.uid() = user_id);

-- Player Familiars Policies
CREATE POLICY "Users can read their own familiars collection"
  ON public.player_familiars FOR SELECT USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. AUTH HOOKS & ONBOARDING TRIGGERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_username TEXT;
  v_display_name TEXT;
  v_avatar_id TEXT;
BEGIN
  v_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    SPLIT_PART(NEW.email, '@', 1),
    'apprentice_' || SUBSTRING(NEW.id::text, 1, 8)
  );

  v_username := REGEXP_REPLACE(LOWER(v_username), '[^a-z0-9_]', '_', 'g');
  IF LENGTH(v_username) < 3 THEN
    v_username := v_username || '_' || SUBSTRING(NEW.id::text, 1, 4);
  END IF;

  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) LOOP
    v_username := v_username || SUBSTRING(gen_random_uuid()::text, 1, 4);
  END LOOP;

  v_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', 'Penyihir Cilik');
  v_avatar_id := COALESCE(NEW.raw_user_meta_data->>'avatar_id', 'apprentice_default');

  INSERT INTO public.profiles (
    id,
    username,
    display_name,
    avatar_id,
    total_xp,
    wizard_rank,
    active_familiar_id
  ) VALUES (
    NEW.id,
    v_username,
    v_display_name,
    v_avatar_id,
    0,
    'Novice Conjurer',
    'pyx_fire_cat'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.player_familiars (user_id, familiar_id)
  VALUES (NEW.id, 'pyx_fire_cat')
  ON CONFLICT (user_id, familiar_id) DO NOTHING;

  INSERT INTO public.player_progress (user_id, level_id, status, stars, best_step_count, attempts_count)
  VALUES (NEW.id, 'w1-l1', 'unlocked', 0, 0, 0)
  ON CONFLICT (user_id, level_id) DO NOTHING;

  INSERT INTO public.player_achievements (user_id, achievement_id)
  VALUES (NEW.id, 'welcome_apprentice')
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 5. SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO public.familiars (id, name, element, description, rarity)
VALUES
  ('pyx_fire_cat', 'Pyx Sang Kucing Api', 'Fire', 'Familiar pemula yang hangat dan setia mendampingi murid magang.', 'common'),
  ('aquila_ice_owl', 'Aquila Sang Burung Hantu Salju', 'Ice', 'Burung hantu kristal yang tenang dan ahli dalam kalkulasi perulangan.', 'rare'),
  ('terra_golem', 'Grom Sang Golem Tanah', 'Earth', 'Pelindung kokoh yang membimbing penyihir melewati rintangan batu.', 'epic')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  element = EXCLUDED.element,
  description = EXCLUDED.description,
  rarity = EXCLUDED.rarity;

INSERT INTO public.achievements (id, title, description, icon_name, category, xp_reward)
VALUES
  ('welcome_apprentice', 'Selamat Datang di Akademi', 'Memulai petualangan sihir sebagai murid magang baru.', 'Sparkles', 'onboarding', 25),
  ('first_spell', 'Mantra Pertama Terpancar', 'Menyelesaikan level pertama dengan sukses.', 'Flame', 'progression', 50),
  ('three_stars_perfection', 'Kesempurnaan Tiga Bintang', 'Meraih skor sempurna 3 bintang dalam satu misi.', 'Star', 'mastery', 75),
  ('forest_guardian', 'Pelindung Hutan Berbisik', 'Menyelesaikan seluruh tantangan Dunia 1.', 'Trees', 'milestone', 150),
  ('loop_master', 'Penjinak Perulangan', 'Menggunakan mantra Ulangi untuk menghemat instruksi secara efektif.', 'Repeat', 'concept', 100),
  ('flawless_debugger', 'Mata Pengurai Masalah', 'Memperbaiki kode yang rusak dan mencapai target tanpa kesalahan.', 'Wrench', 'concept', 100),
  ('grand_magus', 'Penyihir Agung SpellCode', 'Menyelesaikan seluruh 12 level petualangan MVP.', 'Crown', 'milestone', 300)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  category = EXCLUDED.category,
  xp_reward = EXCLUDED.xp_reward;

INSERT INTO public.levels (
  id,
  world_number,
  level_number,
  world_title,
  title,
  description,
  concept_tag,
  par_steps,
  base_xp,
  allowed_runes
) VALUES
  ('w1-l1', 1, 1, 'Whispering Woods', 'Langkah Pertama Magang', 'Langkahkan penyihir lurus melintasi jembatan kayu kuno menuju gerbang portal akademi.', 'Sequencing', 3, 50, '["STEP_FORWARD"]'::jsonb),
  ('w1-l2', 1, 2, 'Whispering Woods', 'Belokan di Tikungan Peri', 'Jalan setapak terputus oleh jurang tebing. Ubah arah hadap penyihir menggunakan mantra putar.', 'Movement & Direction', 3, 50, '["STEP_FORWARD", "TURN_RIGHT"]'::jsonb),
  ('w1-l3', 1, 3, 'Whispering Woods', 'Cahaya Lentera & Kristal Mana', 'Gerbang portal terkunci tanpa energi suci. Nyalakan lentera dan petik kristal mana untuk membukanya.', 'Object Activation', 6, 60, '["STEP_FORWARD", "LIGHT_TORCH", "COLLECT_SHARD"]'::jsonb),
  ('w1-l4', 1, 4, 'Whispering Woods', 'Menembus Semak Berduri', 'Semak berduri menghalangi lorong utama. Susun manuver kiri dan kanan untuk mencari rute memutar yang aman.', 'Movement & Direction', 7, 70, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb),
  ('w1-l5', 1, 5, 'Whispering Woods', 'Mantra Magang yang Tersesat', 'Seorang murid magang meninggalkan mantra yang salah sehingga penyihir menabrak batu! Analisis kesalahannya dan perbaiki.', 'Debugging', 4, 80, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb),
  ('w1-l6', 1, 6, 'Whispering Woods', 'Ujian Harmoni Dua Lentera', 'Tantangan penutup hutan peri: nyalakan 2 lentera penjaga di dua sisi sungai gaib untuk membuka gerbang alam kristal.', 'Sequencing', 9, 100, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT", "LIGHT_TORCH"]'::jsonb),
  ('w2-l1', 2, 1, 'Crystal Caverns', 'Lorong Kristal Berulang', 'Lorong gua kristal yang lurus dan panjang. Gunakan blok Ulangi agar mantramu lebih hemat dan ringkas!', 'Loops', 1, 80, '["STEP_FORWARD"]'::jsonb),
  ('w2-l2', 2, 2, 'Crystal Caverns', 'Tangga Kristal Berundak', 'Naiki undakan kristal dengan mengenali pola gerakan yang berulang secara teratur.', 'Loops', 1, 90, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb),
  ('w2-l3', 2, 3, 'Crystal Caverns', 'Sensor Kabut Kristal', 'Kabut tebal menutupi rintangan. Gunakan mantra Jika (Ada Rintangan di Depan) untuk memandu langkah penyihir.', 'Conditionals', 4, 100, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb),
  ('w2-l4', 2, 4, 'Crystal Caverns', 'Labirin Simpang Kristal', 'Navigasi persimpangan ganda dengan kombinasi keputusan sensor dan perulangan mantra.', 'Conditionals', 5, 110, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb),
  ('w2-l5', 2, 5, 'Crystal Caverns', 'Mengurai Kalibrasi Rusak', 'Program perulangan otomatis mengalami anomali dan melewati lentera kristal. Debug dan perbaiki instruksi di dalamnya.', 'Debugging', 4, 120, '["STEP_FORWARD", "LIGHT_TORCH", "TURN_RIGHT"]'::jsonb),
  ('w2-l6', 2, 6, 'Crystal Caverns', 'Puncak Menara Kristal Abadi', 'Ujian agung: kumpulkan 3 kristal mana dan nyalakan lentera suci menggunakan kombinasi loop dan sequencing tingkat lanjut.', 'Pattern Recognition', 6, 150, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT", "LIGHT_TORCH", "COLLECT_SHARD"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  world_number = EXCLUDED.world_number,
  level_number = EXCLUDED.level_number,
  world_title = EXCLUDED.world_title,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  concept_tag = EXCLUDED.concept_tag,
  par_steps = EXCLUDED.par_steps,
  base_xp = EXCLUDED.base_xp,
  allowed_runes = EXCLUDED.allowed_runes;
