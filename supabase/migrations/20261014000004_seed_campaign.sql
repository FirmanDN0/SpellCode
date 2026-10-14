-- ==============================================================================
-- SPELLCODE SUPABASE MIGRATION 004: REPRODUCIBLE SEED DATA
-- Description: Seed 12 MVP campaign levels, starter familiars, and achievements
-- ==============================================================================

-- 1. Seed Familiars Catalog
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

-- 2. Seed Achievements Catalog
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

-- 3. Seed 12 MVP Levels Catalog
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
  (
    'w1-l1',
    1,
    1,
    'Whispering Woods',
    'Langkah Pertama Magang',
    'Langkahkan penyihir lurus melintasi jembatan kayu kuno menuju gerbang portal akademi.',
    'Sequencing',
    'Capai portal di ujung jembatan petak (3, 1)',
    3,
    50,
    true,
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
    'Belok ke selatan dan capai portal di petak (1, 2)',
    3,
    50,
    true,
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
    'Nyalakan lentera, petik kristal mana, dan capai portal (4, 1)',
    6,
    60,
    true,
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
    'Hindari semak berduri dan capai portal di seberang (2, 1)',
    7,
    70,
    true,
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
    'Perbaiki mantra agar berbelok ke selatan dan tiba di portal (1, 3)',
    4,
    80,
    true,
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
    'Nyalakan kedua lentera suci penjaga sungai dan tiba di portal (4, 2)',
    9,
    100,
    true,
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
    'Capai portal di petak (5, 1) menggunakan perulangan mantra',
    1,
    80,
    true,
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
    'Naiki tangga menggunakan perulangan pola dan capai portal (3, 0)',
    1,
    90,
    true,
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
    'Deteksi rintangan kabut dengan balok JIKA dan capai portal (3, 2)',
    4,
    100,
    true,
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
    'Pilih cabang rute yang aman dan capai portal akhir',
    5,
    110,
    true,
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
    'Perbaiki loop agar menyalakan lentera sebelum melangkah maju',
    4,
    120,
    true,
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
    'Kumpulkan seluruh kristal, nyalakan lentera puncak, dan masuki portal agung',
    6,
    150,
    true,
    '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT", "LIGHT_TORCH", "COLLECT_SHARD"]'::jsonb
  )
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
