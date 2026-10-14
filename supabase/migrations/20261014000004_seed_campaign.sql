-- ==============================================================================
-- SPELLCODE SUPABASE MIGRATION 004: SEED CAMPAIGN DATA
-- Description: Seed 12 MVP campaign levels, starter familiars, and achievements
-- ==============================================================================

-- 1. Seed Familiars Catalog
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

-- 2. Seed Achievements Catalog
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

-- 3. Seed 12 MVP Levels Catalog
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
  (
    'w1-l1',
    1,
    1,
    'Whispering Woods',
    'Langkah Pertama Magang',
    'Langkahkan penyihir lurus melintasi jembatan kayu kuno menuju gerbang portal akademi.',
    'Sequencing',
    3,
    50,
    '["STEP_FORWARD"]'::jsonb
  ),
  (
    'w1-l2',
    1,
    2,
    'Whispering Woods',
    'Belokan di Tikungan Peri',
    'Jalan setapak terputus oleh jurang tebing. Ubah arah hadap penyihir menggunakan mantra putar.',
    'Movement & Direction',
    3,
    50,
    '["STEP_FORWARD", "TURN_RIGHT"]'::jsonb
  ),
  (
    'w1-l3',
    1,
    3,
    'Whispering Woods',
    'Cahaya Lentera & Kristal Mana',
    'Gerbang portal terkunci tanpa energi suci. Nyalakan lentera dan petik kristal mana untuk membukanya.',
    'Object Activation',
    6,
    60,
    '["STEP_FORWARD", "LIGHT_TORCH", "COLLECT_SHARD"]'::jsonb
  ),
  (
    'w1-l4',
    1,
    4,
    'Whispering Woods',
    'Menembus Semak Berduri',
    'Semak berduri menghalangi lorong utama. Susun manuver kiri dan kanan untuk mencari rute memutar yang aman.',
    'Movement & Direction',
    7,
    70,
    '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb
  ),
  (
    'w1-l5',
    1,
    5,
    'Whispering Woods',
    'Mantra Magang yang Tersesat',
    'Seorang murid magang meninggalkan mantra yang salah sehingga penyihir menabrak batu! Analisis kesalahannya dan perbaiki.',
    'Debugging',
    4,
    80,
    '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb
  ),
  (
    'w1-l6',
    1,
    6,
    'Whispering Woods',
    'Ujian Harmoni Dua Lentera',
    'Tantangan penutup hutan peri: nyalakan 2 lentera penjaga di dua sisi sungai gaib untuk membuka gerbang alam kristal.',
    'Sequencing',
    9,
    100,
    '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT", "LIGHT_TORCH"]'::jsonb
  ),
  (
    'w2-l1',
    2,
    1,
    'Crystal Caverns',
    'Lorong Kristal Berulang',
    'Lorong gua kristal yang lurus dan panjang. Gunakan blok Ulangi agar mantramu lebih hemat dan ringkas!',
    'Loops',
    1,
    80,
    '["STEP_FORWARD"]'::jsonb
  ),
  (
    'w2-l2',
    2,
    2,
    'Crystal Caverns',
    'Tangga Kristal Berundak',
    'Naiki undakan kristal dengan mengenali pola gerakan yang berulang secara teratur.',
    'Loops',
    1,
    90,
    '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb
  ),
  (
    'w2-l3',
    2,
    3,
    'Crystal Caverns',
    'Sensor Kabut Kristal',
    'Kabut tebal menutupi rintangan. Gunakan mantra Jika (Ada Rintangan di Depan) untuk memandu langkah penyihir.',
    'Conditionals',
    4,
    100,
    '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb
  ),
  (
    'w2-l4',
    2,
    4,
    'Crystal Caverns',
    'Labirin Simpang Kristal',
    'Navigasi persimpangan ganda dengan kombinasi keputusan sensor dan perulangan mantra.',
    'Conditionals',
    5,
    110,
    '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb
  ),
  (
    'w2-l5',
    2,
    5,
    'Crystal Caverns',
    'Mengurai Kalibrasi Rusak',
    'Program perulangan otomatis mengalami anomali dan melewati lentera kristal. Debug dan perbaiki instruksi di dalamnya.',
    'Debugging',
    4,
    120,
    '["STEP_FORWARD", "LIGHT_TORCH", "TURN_RIGHT"]'::jsonb
  ),
  (
    'w2-l6',
    2,
    6,
    'Crystal Caverns',
    'Puncak Menara Kristal Abadi',
    'Ujian agung: kumpulkan 3 kristal mana dan nyalakan lentera suci menggunakan kombinasi loop dan sequencing tingkat lanjut.',
    'Pattern Recognition',
    6,
    150,
    '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT", "LIGHT_TORCH", "COLLECT_SHARD"]'::jsonb
  )
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
