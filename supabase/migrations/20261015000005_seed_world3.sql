-- Migration: Seed World 3 (Cloud Citadel / Benteng Awan)
-- Description: Menambahkan definisi level w3-l1 sampai w3-l6 ke tabel levels

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
  ('w3-l1', 3, 1, 'Cloud Citadel', 'Sensor Jurang Awan', 'Jembatan awan di depan rapuh. Gunakan mantra Jika (Jalan Terbuka di Depan) untuk memandu langkah penyihir dengan aman!', 'Conditionals', 'Capai gerbang portal langit di petak (4, 1) dengan selamat', 4, 120, true, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"]'::jsonb),
  ('w3-l2', 3, 2, 'Cloud Citadel', 'Detektor Kristal Langit', 'Kristal langit tersembunyi di balik kabut tebal. Gunakan sensor kondisi untuk menyerap kristal mana tepat saat penyihir berdiri di atasnya!', 'Conditionals', 'Serap energi kristal langit misterius dan capai portal petak (4, 1)', 5, 130, true, '["STEP_FORWARD", "COLLECT_SHARD"]'::jsonb),
  ('w3-l3', 3, 3, 'Cloud Citadel', 'Lentera Penjaga Awan', 'Lentera suci kuno menjaga pintu gerbang awan. Periksa keberadaan lentera dan nyalakan apinya agar portal terbuka lebar!', 'Conditionals', 'Nyalakan lentera suci penjaga awan dan masuki portal (4, 1)', 5, 140, true, '["STEP_FORWARD", "LIGHT_TORCH"]'::jsonb),
  ('w3-l4', 3, 4, 'Cloud Citadel', 'Patroli Awan Otomatis', 'Kombinasikan perulangan (Loop) dan keputusan cerdas (Jika) untuk memandu penyihir menelusuri koridor awan berangin kencang.', 'Conditionals', 'Nyalakan lentera, ambil kristal petir, dan masuki portal (5, 1)', 7, 150, true, '["STEP_FORWARD", "LIGHT_TORCH", "COLLECT_SHARD"]'::jsonb),
  ('w3-l5', 3, 5, 'Cloud Citadel', 'Simpang Labirin Langit', 'Batu awan padat menghalangi jalur lurusmu. Deteksi rintangan dengan Jika (Ada Rintangan di Depan) lalu putar haluan ke kanan untuk mencari jalan aman!', 'Conditionals', 'Navigasi labirin awan dan tiba di portal (3, 3)', 6, 160, true, '["STEP_FORWARD", "TURN_RIGHT", "TURN_LEFT"]'::jsonb),
  ('w3-l6', 3, 6, 'Cloud Citadel', 'Puncak Istana Awan Abadi', 'Ujian agung Benteng Langit: kumpulkan semua kristal petir, nyalakan lentera badai, dan buka portal agung menggunakan kombinasi kondisi dan perulangan tingkat tinggi!', 'Conditionals', 'Kumpulkan semua kristal, nyalakan lentera puncak, dan tembus portal (5, 2)', 8, 200, true, '["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT", "LIGHT_TORCH", "COLLECT_SHARD"]'::jsonb)
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
