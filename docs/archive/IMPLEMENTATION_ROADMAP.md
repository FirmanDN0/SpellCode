# SPELLCODE: IMPLEMENTATION ROADMAP & EXECUTION PLAN
*Rencana Kerja Bertahap, Milestone, dan Prioritas Pengembangan*

---

## 1. Ikhtisar Roadmap

Pengembangan SpellCode dibagi menjadi 7 fase terstruktur dengan pendekatan *Core-First* (membangun mekanik simulasi logika yang solid terlebih dahulu sebelum mempercantik antarmuka dan menambahkan layanan pihak ketiga).

```
[Fase 1: Discovery, Audit & Finalisasi MVP] (SELESAI)
       |
       v
[Fase 2: Base Setup & Core Deterministic Engine]
       |
       v
[Fase 3: Visual Block Editor & Viewport Arena]
       |
       v
[Fase 4: Kurikulum Level World 1 & 2 (15 Level)]
       |
       v
[Fase 5: State Pemain, Guest Mode & Supabase Sync]
       |
       v
[Fase 6: Polish Ramah Anak, Sound Engine & Aksesibilitas]
       |
       v
[Fase 7: Verifikasi Menyeluruh & Deployment]
```

---

## 2. Rincian Fase dan Tugas Kerja

### FASE 1: Product Discovery, Architecture, Audit & MVP Finalization
* **Status**: Selesai (Milestone Saat Ini)
* **Tujuan**: Memetakan kebutuhan produk, persona anak usia 7-12 tahun, arsitektur teknis, desain database, audit repository aktual, dan finalisasi cakupan MVP untuk demonstrasi kompetisi.
* **Deliverables**:
  * `docs/PRODUCT_SPEC.md` (Spesifikasi produk, persona, user journey, formula bintang & XP, behavior states)
  * `docs/TECHNICAL_ARCHITECTURE.md` (Arsitektur sistem, generator VM, batas keamanan)
  * `docs/DATABASE_DESIGN.md` (Skema Postgres Supabase, RLS policies, skema guest offline)
  * `docs/REPOSITORY_AUDIT.md` (Audit teknis aktual, gap analysis, mitigasi hydration & audio)
  * `docs/IMPLEMENTATION_ROADMAP.md` (Roadmap eksekusi terstruktur)
  * `docs/ACCEPTANCE_CRITERIA.md` (Kriteria penerimaan terukur)

---

### FASE 2: Project Base Setup & Core Deterministic Engine
* **Tujuan**: Menginisialisasi proyek Next.js 15 dan membangun fondasi komputasi permainan yang sepenuhnya terisolasi dari antarmuka visual (dapat dijalankan di Node.js maupun Browser).
* **Tugas Spesifik**:
  1. Inisialisasi struktur proyek Next.js 15 dengan TypeScript strict mode, Tailwind CSS, Motion, dan Lucide React.
  2. Implementasi `lib/engine/types.ts`: Definisi antarmuka tipe untuk state, grid, command, dan node.
  3. Implementasi `lib/engine/ast.ts`: Definisi tipe node AST untuk aksi (`STEP_FORWARD`, `TURN_LEFT`, `TURN_RIGHT`, `COLLECT_SHARD`, `LIGHT_TORCH`) dan blok kontrol (`REPEAT`).
  4. Implementasi `lib/engine/vm.ts`: Generator-based Virtual Machine dengan proteksi infinite loop (`maxExecutionSteps = 100`).
  5. Implementasi `lib/engine/grid.ts`: Matematika koordinat 2D, kalkulasi arah hadap (*facing direction*), dan deteksi benturan rintangan/dinding.
  6. Implementasi `lib/engine/evaluator.ts`: Evaluator kondisi kemenangan (apakah semua objektif tercapai dan portal dimasuki).
  7. Pembuatan test suite otomatis untuk memverifikasi determinisme 100% dan pencegahan *infinite loop overflow*.
* **Output Kunci**: Paket modul `lib/engine/` yang lulus pengujian tanpa error.

---

### FASE 3: Visual Block Editor & 2D Arena Viewport
* **Tujuan**: Menghadirkan representasi visual permainan yang dapat dimanipulasi oleh anak dengan umpan balik langsung.
* **Tugas Spesifik**:
  1. Membangun komponen `ArenaGrid.tsx`: Render petak grid menggunakan SVG/CSS Grid dengan tema fantasi yang cerah dan kontras tinggi.
  2. Membangun sprite `WizardCharacter.tsx`: Avatar penyihir cilik dengan animasi putar hadap dan gerakan melangkah.
  3. Membangun `BlockTray.tsx`: Rak koleksi rune sihir dengan ikon representatif dan teks instruksi singkat.
  4. Membangun `SpellDeck.tsx`: Meja penyusunan mantra yang mendukung klik-untuk-menambah (*click-to-slot*), hapus blok, dan drag-reorder.
  5. Membangun `ControlBar.tsx`: Tombol aksi ramah anak: "Rapalkan Mantra" (Play), "Satu Langkah" (Step), "Reset Posisi", dan "Kecepatan" (1x, 2x).
  6. Sinkronisasi *Active Step Highlighting*: Blok kode yang sedang dieksekusi VM berpijar kuning secara real-time.
* **Output Kunci**: Arena gameplay interaktif di mana anak dapat menyusun blok dan melihat karakter bergerak di grid.

---

### FASE 4: Kurikulum Level Terkurasi (World 1 & World 2)
* **Tujuan**: Menyediakan konten edukasi terstruktur dengan kurva belajar yang ramah bagi anak (15 level lengkap).
* **Tugas Spesifik**:
  1. Merancang 8 level untuk **World 1: Whispering Woods** (Fokus: Sekuensial dan algoritma dasar).
  2. Merancang 7 level untuk **World 2: Crystal Caverns** (Fokus: Perulangan dan pengenalan pola).
  3. Mengonfigurasi parameter *par_steps* di setiap level untuk kalkulasi bintang (1 bintang: selesai, 2 bintang: efisien, 3 bintang: optimal).
  4. Implementasi komponen `DebuggerGuide.tsx`: Dialog Familiar (Pyx) yang memberikan petunjuk kontekstual saat terjadi kesalahan (*misfire*).
  5. Membangun komponen `VictoryModal.tsx`: Animasi perayaan kemenangan, bintang bercahaya, dan kalkulasi perolehan Mana XP.
* **Output Kunci**: 15 level edukasi lengkap yang dapat dimainkan dari awal hingga akhir.

---

### FASE 5: State Pemain, Guest Mode & Integrasi Supabase
* **Tujuan**: Menjamin progres anak tersimpan secara persisten, baik tanpa login maupun dengan akun terdaftar.
* **Tugas Spesifik**:
  1. Implementasi `lib/storage/guestStorage.ts`: Penyimpanan lokal otomatis di LocalStorage agar anak bisa langsung bermain tanpa registrasi awal.
  2. Integrasi Supabase SDK (`@supabase/ssr` & `@supabase/supabase-js`).
  3. Implementasi otentikasi ramah keluarga (Magic Link / Kode Akses Sederhana tanpa sandi rumit).
  4. Endpoint API `/api/verify-solution`: Re-eksekusi solusi di server secara headless untuk mencegah kecurangan pengiriman bintang dan XP.
  5. Mekanisme sinkronisasi progres dari mode tamu (*guest*) ke akun cloud saat pengguna mendaftar.
* **Output Kunci**: Sistem penyimpanan progres aman dengan perlindungan integritas data di server.

---

### FASE 6: Polishing Ramah Anak, Sound Engine & Aksesibilitas
* **Tujuan**: Meningkatkan kualitas estetika, keterlibatan emosional, dan kepatuhan standar aksesibilitas.
* **Tugas Spesifik**:
  1. Implementasi `lib/audio/soundManager.ts`: Generator efek suara procedural (Web Audio API) untuk langkah, putaran, klik rune, mantra sukses, dan fanfare kemenangan.
  2. Tombol kontrol suara (*Mute Audio*) yang mudah diakses dan menyimpan preferensi pengguna.
  3. Audit aksesibilitas WCAG AA: Memastikan rasio kontras warna teks dan latar belakang memenuhi standar minimal 4.5:1.
  4. Navigasi keyboard penuh (`Tab`, `Enter`, `Space`, `Escape`).
  5. Penyesuaian layout responsif untuk berbagai ukuran layar (desktop, laptop, dan tablet).
* **Output Kunci**: Antarmuka yang hidup, responsif, bersuara merdu, dan nyaman untuk anak.

---

### FASE 7: Verifikasi Menyeluruh & Deployment
* **Tujuan**: Pengujian akhir menyeluruh sebelum platform dirilis ke pengguna publik atau demonstrasi kompetisi.
* **Tugas Spesifik**:
  1. Pengujian skenario regresi: Menjalankan ulang seluruh 15 level untuk memastikan tidak ada level yang mustahil diselesaikan.
  2. Pengujian penanganan error: Memastikan jaringan terputus tidak merusak data lokal anak (offline-first).
  3. Audit performa (Lighthouse score): Memastikan skor Performance, Accessibility, dan Best Practices berada di atas 90.
  4. Konfigurasi CI/CD dan deployment ke platform hosting produksi (Vercel atau Cloud Run).
* **Output Kunci**: Aplikasi produksi SpellCode yang stabil, cepat, dan siap digunakan.

---

## 3. Matriks Estimasi dan Kompleksitas

| Fase | Perkiraan Bobot | Fokus Utama | Ketergantungan Kunci |
|---|---|---|---|
| **Fase 1** | 10% | Desain, Audit & Spesifikasi MVP | Selesai |
| **Fase 2** | 20% | Logika Komputasi Deterministik | Fase 1 |
| **Fase 3** | 25% | UI/UX & Visual Interaksi | Fase 2 |
| **Fase 4** | 15% | Desain Level & Pedagogi | Fase 3 |
| **Fase 5** | 15% | Database & Keamanan | Fase 2 & 4 |
| **Fase 6** | 10% | Audio, Aksesibilitas & Polish | Fase 3 & 4 |
| **Fase 7** | 5% | Quality Assurance & Rilis | Semua Fase |
