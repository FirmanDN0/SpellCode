-- ==============================================================================
-- SPELLCODE SUPABASE FULL CONSOLIDATED SCHEMA (MIGRATIONS 001 - 004)
-- Based on: docs/DATABASE_DESIGN.md
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

-- Levels Catalog
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

-- Player Progress
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

-- Level Attempts (Audit log of program executions)
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

-- Achievements Catalog
CREATE TABLE IF NOT EXISTS public.achievements (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon_name VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  xp_reward INTEGER NOT NULL DEFAULT 50 CHECK (xp_reward >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Player Achievements
CREATE TABLE IF NOT EXISTS public.player_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id VARCHAR(50) NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_player_achievements_user ON public.player_achievements(user_id);

-- Familiars Catalog
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

-- Player Familiars
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
DROP POLICY IF EXISTS "Published levels are readable by everyone" ON public.levels;
CREATE POLICY "Published levels are readable by everyone"
  ON public.levels FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Achievements are readable by everyone" ON public.achievements;
CREATE POLICY "Achievements are readable by everyone"
  ON public.achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Familiars are readable by everyone" ON public.familiars;
CREATE POLICY "Familiars are readable by everyone"
  ON public.familiars FOR SELECT USING (true);

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Player Progress Policies
DROP POLICY IF EXISTS "Users can read own progress" ON public.player_progress;
CREATE POLICY "Users can read own progress"
  ON public.player_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.player_progress;
CREATE POLICY "Users can insert own progress"
  ON public.player_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.player_progress;
CREATE POLICY "Users can update own progress"
  ON public.player_progress FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Level Attempts Policies (Append-only)
DROP POLICY IF EXISTS "Users can view own attempts" ON public.level_attempts;
CREATE POLICY "Users can view own attempts"
  ON public.level_attempts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own attempts" ON public.level_attempts;
CREATE POLICY "Users can insert own attempts"
  ON public.level_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Player Achievements Policies
DROP POLICY IF EXISTS "Users can view own achievements" ON public.player_achievements;
CREATE POLICY "Users can view own achievements"
  ON public.player_achievements FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own achievements" ON public.player_achievements;
CREATE POLICY "Users can insert own achievements"
  ON public.player_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Player Familiars Policies
DROP POLICY IF EXISTS "Users can view own familiars" ON public.player_familiars;
CREATE POLICY "Users can view own familiars"
  ON public.player_familiars FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own familiars" ON public.player_familiars;
CREATE POLICY "Users can insert own familiars"
  ON public.player_familiars FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own active familiar" ON public.player_familiars;
CREATE POLICY "Users can update own active familiar"
  ON public.player_familiars FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 4. AUTH HOOKS & ONBOARDING TRIGGERS (RESILIENT)
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
  -- Inner block with exception handler:
  -- Failure inside this block will NOT abort the auth.users INSERT transaction.
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

    INSERT INTO public.player_familiars (user_id, familiar_id, bond_level, is_active)
    VALUES (NEW.id, 'pyx_fire_cat', 1, true)
    ON CONFLICT (user_id, familiar_id) DO NOTHING;

    INSERT INTO public.player_progress (user_id, level_id, status, stars, best_step_count, attempts_count)
    VALUES (NEW.id, 'w1-l1', 'unlocked', 0, 0, 0)
    ON CONFLICT (user_id, level_id) DO NOTHING;

    INSERT INTO public.player_achievements (user_id, achievement_id)
    VALUES (NEW.id, 'welcome_apprentice')
    ON CONFLICT (user_id, achievement_id) DO NOTHING;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user trigger encountered an error for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 5. REPRODUCIBLE SEED DATA
-- ------------------------------------------------------------------------------
INSERT INTO public.familiars (
  id,
  name,
  species,
  element,
  lore_description,
  description,
  asset_key,
  rarity,
  unlock_xp_required
) VALUES
  (
    'pyx_fire_cat',
    'Pyx Sang Kucing Api',
    'Fire Cat',
    'Fire',
    'Familiar pemula yang hangat dan setia mendampingi murid magang.',
    'Familiar pemula yang hangat dan setia mendampingi murid magang.',
    'pyx_fire_cat',
    'common',
    0
  ),
  (
    'aquila_ice_owl',
    'Aquila Sang Burung Hantu Salju',
    'Crystal Owl',
    'Ice',
    'Burung hantu kristal yang tenang dan ahli dalam kalkulasi perulangan.',
    'Burung hantu kristal yang tenang dan ahli dalam kalkulasi perulangan.',
    'aquila_ice_owl',
    'rare',
    300
  ),
  (
    'terra_golem',
    'Grom Sang Golem Tanah',
    'Earth Golem',
    'Earth',
    'Pelindung kokoh yang membimbing penyihir melewati rintangan batu.',
    'Pelindung kokoh yang membimbing penyihir melewati rintangan batu.',
    'terra_golem',
    'epic',
    800
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  species = EXCLUDED.species,
  element = EXCLUDED.element,
  lore_description = EXCLUDED.lore_description,
  description = EXCLUDED.description,
  asset_key = EXCLUDED.asset_key,
  rarity = EXCLUDED.rarity,
  unlock_xp_required = EXCLUDED.unlock_xp_required;

INSERT INTO public.achievements (
  id,
  title,
  description,
  icon_name,
  category,
  xp_reward
) VALUES
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
  objective_text,
  par_steps,
  base_xp,
  is_published,
  allowed_runes
) VALUES
  ('w1-l1', 1, 1, 'Whispering Woods', 'Langkah Pertama Magang', 'Langkahkan penyihir lurus melintasi jembatan kayu kuno menuju gerbang portal akademi.', 'Sequencing', 'Capai portal di ujung jembatan petak (3, 1)', 3, 50, true, '["STEP_FORWARD"]'::jsonb),
  ('w1-l2', 1, 2, 'Whispering Woods', 'Belokan di Tikungan Peri', 'Jalan setapak terputus oleh jurang tebing. Ubah arah hadap penyihir menggunakan mantra putar.', 'Movement & Direction', 'Belok ke selatan dan capai portal di petak (1, 2)', 3, 50, true, '["STEP_FORWARD", "TURN_RIGHT"]'::jsonb),
  ('w1-l3', 1, 3, 'Whispering Woods', 'Cahaya Lentera & Kristal Mana', 'Gerbang portal terkunci tanpa energi suci. Nyalakan lentera dan petik kristal mana untuk membukanya.', 'Object Activation', 'Nyalakan lentera, petik kristal mana, dan capai portal (4, 1)', 6, 60, true, '["STEP_FORWARD", "LIGHT_TORCH", "COLLECT_SHARD"]'::jsonb),
  ('w1-l4', 1, 4, 'Whispering Woods', 'Menembus Semak Berduri', 'Semak berduri menghalangi lorong utama. Susun manuver kiri dan kanan untuk mencari rute memutar yang aman.', 'Movement & Direction', 'Hindari semak berduri dan capai portal di seberang (2, 1)', 7, 70, true, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb),
  ('w1-l5', 1, 5, 'Whispering Woods', 'Mantra Magang yang Tersesat', 'Seorang murid magang meninggalkan mantra yang salah sehingga penyihir menabrak batu! Analisis kesalahannya dan perbaiki.', 'Debugging', 'Perbaiki mantra agar berbelok ke selatan dan tiba di portal (1, 3)', 4, 80, true, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb),
  ('w1-l6', 1, 6, 'Whispering Woods', 'Ujian Harmoni Dua Lentera', 'Tantangan penutup hutan peri: nyalakan 2 lentera penjaga di dua sisi sungai gaib untuk membuka gerbang alam kristal.', 'Sequencing', 'Nyalakan kedua lentera suci penjaga sungai dan tiba di portal (4, 2)', 9, 100, true, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT", "LIGHT_TORCH"]'::jsonb),
  ('w2-l1', 2, 1, 'Crystal Caverns', 'Lorong Kristal Berulang', 'Lorong gua kristal yang lurus dan panjang. Gunakan blok Ulangi agar mantramu lebih hemat dan ringkas!', 'Loops', 'Capai portal di petak (5, 1) menggunakan perulangan mantra', 1, 80, true, '["STEP_FORWARD"]'::jsonb),
  ('w2-l2', 2, 2, 'Crystal Caverns', 'Tangga Kristal Berundak', 'Naiki undakan kristal dengan mengenali pola gerakan yang berulang secara teratur.', 'Loops', 'Naiki tangga menggunakan perulangan pola dan capai portal (3, 0)', 1, 90, true, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb),
  ('w2-l3', 2, 3, 'Crystal Caverns', 'Sensor Kabut Kristal', 'Kabut tebal menutupi rintangan. Gunakan mantra Jika (Ada Rintangan di Depan) untuk memandu langkah penyihir.', 'Conditionals', 'Deteksi rintangan kabut dengan balok JIKA dan capai portal (3, 2)', 4, 100, true, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb),
  ('w2-l4', 2, 4, 'Crystal Caverns', 'Labirin Simpang Kristal', 'Navigasi persimpangan ganda dengan kombinasi keputusan sensor dan perulangan mantra.', 'Conditionals', 'Pilih cabang rute yang aman dan capai portal akhir', 5, 110, true, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb),
  ('w2-l5', 2, 5, 'Crystal Caverns', 'Mengurai Kalibrasi Rusak', 'Program perulangan otomatis mengalami anomali dan melewati lentera kristal. Debug dan perbaiki instruksi di dalamnya.', 'Debugging', 'Perbaiki loop agar menyalakan lentera sebelum melangkah maju', 4, 120, true, '["STEP_FORWARD", "LIGHT_TORCH", "TURN_RIGHT"]'::jsonb),
  ('w2-l6', 2, 6, 'Crystal Caverns', 'Puncak Menara Kristal Abadi', 'Ujian agung: kumpulkan 3 kristal mana dan nyalakan lentera suci menggunakan kombinasi loop dan sequencing tingkat lanjut.', 'Pattern Recognition', 'Kumpulkan seluruh kristal, nyalakan lentera puncak, dan masuki portal agung', 6, 150, true, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT", "LIGHT_TORCH", "COLLECT_SHARD"]'::jsonb),
  ('w3-l1', 3, 1, 'Cloud Citadel', 'Sensor Jurang Awan', 'Jembatan awan di depan rapuh. Gunakan mantra Jika (Jalan Terbuka di Depan) untuk memandu langkah penyihir dengan aman!', 'Conditionals', 'Capai gerbang portal langit di petak (4, 1) dengan selamat', 4, 120, true, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb),
  ('w3-l2', 3, 2, 'Cloud Citadel', 'Detektor Kristal Langit', 'Kristal langit tersembunyi di balik kabut tebal. Gunakan sensor kondisi untuk menyerap kristal mana tepat saat penyihir berdiri di atasnya!', 'Conditionals', 'Serap energi kristal langit misterius dan capai portal petak (4, 1)', 5, 130, true, '["STEP_FORWARD", "COLLECT_SHARD"]'::jsonb),
  ('w3-l3', 3, 3, 'Cloud Citadel', 'Lentera Penjaga Awan', 'Lentera suci kuno menjaga pintu gerbang awan. Periksa keberadaan lentera dan nyalakan apinya agar portal terbuka lebar!', 'Conditionals', 'Nyalakan lentera suci penjaga awan dan masuki portal (4, 1)', 5, 140, true, '["STEP_FORWARD", "LIGHT_TORCH"]'::jsonb),
  ('w3-l4', 3, 4, 'Cloud Citadel', 'Patroli Awan Otomatis', 'Kombinasikan perulangan (Loop) dan keputusan cerdas (Jika) untuk memandu penyihir menelusuri koridor awan berangin kencang.', 'Conditionals', 'Nyalakan lentera, ambil kristal petir, dan masuki portal (5, 1)', 5, 150, true, '["STEP_FORWARD", "LIGHT_TORCH", "COLLECT_SHARD"]'::jsonb),
  ('w3-l5', 3, 5, 'Cloud Citadel', 'Simpang Labirin Langit', 'Batu awan padat menghalangi jalur lurusmu. Deteksi rintangan dengan Jika (Ada Rintangan di Depan) lalu putar haluan ke kanan untuk mencari jalan aman!', 'Conditionals', 'Navigasi labirin awan dan tiba di portal (3, 3)', 6, 160, true, '["STEP_FORWARD", "TURN_RIGHT", "TURN_LEFT"]'::jsonb),
  ('w3-l6', 3, 6, 'Cloud Citadel', 'Puncak Istana Awan Abadi', 'Ujian agung Benteng Langit: kumpulkan semua kristal petir, nyalakan lentera badai, dan buka portal agung menggunakan kombinasi kondisi dan perulangan tingkat tinggi!', 'Conditionals', 'Kumpulkan semua kristal, nyalakan lentera puncak, dan tembus portal (5, 2)', 6, 200, true, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT", "LIGHT_TORCH", "COLLECT_SHARD"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  world_number = EXCLUDED.world_number,
  level_number = EXCLUDED.level_number,
  world_title = EXCLUDED.world_title,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  concept_tag = EXCLUDED.concept_tag,
  objective_text = EXCLUDED.objective_text,
  par_steps = EXCLUDED.par_steps,
  base_xp = EXCLUDED.base_xp,
  is_published = EXCLUDED.is_published,
  allowed_runes = EXCLUDED.allowed_runes;
