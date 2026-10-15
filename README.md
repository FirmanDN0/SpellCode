# SpellCode: Cast Spells with Code ✨

> **Akademi Sihir Pemrograman Interaktif untuk Generasi Muda (Usia 7-12 Tahun)**  
> Belajar *Computational Thinking*, Algoritma, dan Logika Komputasi melalui Petualangan Meramu Mantra Sihir!

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Tests-173%20Passed-brightgreen?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![E2E](https://img.shields.io/badge/Playwright%20E2E-13%2F13%20Passed-blue?style=for-the-badge&logo=playwright)](tests/e2e-user-journey.mjs)

---

## 🌟 Tentang SpellCode

**SpellCode** adalah platform game edukasi interaktif yang mentransformasi konsep pemrograman abstrak menjadi mekanika fantasi sihir yang memikat. Anak-anak berperan sebagai penyihir cilik di Akademi SpellCode yang harus menyusun balok rune instruksi untuk memandu karakter melintasi arena petualangan, menyalakan lentera suci, mengumpulkan kristal mana, dan membuka gerbang portal misterius.

### Pilar Pedagogis Utama:
1. **Sequencing (Urutan Logika)**: Memahami bahwa komputer mengeksekusi instruksi dari atas ke bawah secara teratur.
2. **Orientasi Spasial & Arah**: Mengembangkan kemampuan spasial melalui perintah belok relatif terhadap arah hadap karakter.
3. **Loops (Perulangan)**: Mengenali pola repetitif dan mengoptimalkan kode menggunakan blok pengulangan dengan batas iterasi yang aman.
4. **Conditionals (Percabangan)**: Membaca sensor lingkungan (*IF / ELSE*) untuk mengambil keputusan otomatis.
5. **Debug Vision**: Mengembangkan resiliensi belajar melalui visualisasi langkah kesalahan, panduan ramah, dan hint bertingkat dari peri Pyx.

---

## 🚀 Fitur Unggulan

- **Meja Mantra Reaktif (Spell Deck)**: Antarmuka penyusunan blok yang intuitif tanpa ketakutan salah sintaks atau *syntax error*.
- **Arena Grid Fantasi Deterministik**: Simulasi 2D presisi berbasis SVG dengan partikel bercahaya, animasi langkah per langkah, dan efek suara chiptune yang responsif.
- **Sistem Debug Vision**: Menyorot blok instruksi yang sedang aktif secara real-time dan memberikan umpan balik bersahabat saat terjadi *misfire* (tabrakan rintangan atau batas grid).
- **Evaluasi Par & Bintang Bertingkat**: Memberikan penghargaan tidak hanya untuk solusi yang berhasil, tetapi juga untuk efisiensi kode (1 bintang: Selesai, 2 bintang: Efisien, 3 bintang: Optimal).
- **Arsitektur Progres Ganda (Local-First + Cloud Sync)**: Pengguna dapat langsung bermain tanpa hambatan registrasi (mode tamu). Saat login dengan akun keluarga, progres lokal langsung tersinkronisasi aman ke cloud Supabase.
- **Anti-Cheat Server-Authoritative Simulation**: Penilaian skor, bintang, dan perolehan Mana XP divalidasi ulang oleh engine simulasi di server untuk menjamin integritas data.
- **Responsivitas Ekstrem**: Tampilan adaptif sempurna dari ponsel berlayar ringkas (360px), tablet, hingga monitor desktop ultra-wide (1440px).

---

## 🛠️ Arsitektur Teknologi

```
SpellCode/
├── app/                        # Next.js 15 App Router Pages & API Endpoints
│   ├── api/progress/           # Serverless Endpoints: submit & sync progres tervalidasi
│   ├── auth/                   # Server routes callback & signout
│   ├── grimoire/               # Buku ensiklopedia panduan mantra
│   ├── login/                  # Autentikasi ramah anak (Email, Kata Sandi, Magic Link)
│   ├── map/                    # World Map petualangan (World 1 & World 2)
│   ├── play/[levelId]/         # Arena interaktif & editor mantra gameplay
│   └── profile/                # Profil pemain, gelar penyihir, dan pencapaian
├── components/                 # Komponen UI modular berprinsip Atomic Design
│   ├── game/                   # ArenaGrid, SpellDeck, BlockTray, VictoryModal, ControlBar
│   ├── shared/                 # Navbar responsif, Footer, SoundToggle
│   └── ui/                     # Primitif button, modal dialog, toast feedback
├── lib/                        # Domain logic & pure engine
│   ├── audio/                  # Web Audio API sound manager & SFX generator
│   ├── engine/                 # AST compiler, bytecode VM, pure state reducer, evaluator
│   ├── levels/                 # Definisi level pedagogis World 1 & 2
│   ├── storage/                # LocalStorage optimistic cache & draft AST autosave
│   └── supabase/               # Client, server, middleware, auth validation, repository
├── supabase/                   # Konfigurasi basis data & RLS policies
│   ├── migrations/             # 4 file migrasi bertahap reproducible
│   └── schema.sql              # Skema fondasi lengkap PostgreSQL
└── tests/                      # Rangkaian pengujian terotomasi
    ├── backend/                # Audit RLS, isolasi data, dan server anti-cheat
    ├── engine/                 # Test suite logika instruksi, loop, kondisi, dan par
    └── audit.mjs               # Playwright cross-viewport automated audit runner
```

---

## 💻 Panduan Menjalankan Aplikasi Secara Lokal

### Prasyarat
- **Node.js**: Versi 20.x atau 22.x LTS
- **NPM**: Versi 10.x atau lebih baru

### 1. Kloning Repository
```bash
git clone https://github.com/FirmanDN0/SpellCode.git
cd SpellCode
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Variabel Lingkungan
Salin berkas `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan nilai konfigurasi Supabase Anda di `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser Anda di `http://localhost:3000`.

---

## 🧪 Rangkaian Pengujian & Kualitas Kode

SpellCode dilengkapi dengan 164 pengujian otomatis yang mencakup seluruh lapisan aplikasi:

```bash
# Menjalankan seluruh pengujian unit & integrasi (Vitest)
npm test

# Menjalankan static analysis linter (ESLint)
npm run lint

# Memvalidasi type-safety TypeScript
npx tsc --noEmit

# Memverifikasi build produksi Next.js
npm run build

# Menjalankan audit visual dan responsif lintas-perangkat (Playwright)
node tests/audit.mjs

# Menjalankan audit modal dialog dan gameplay di viewport kecil (360px)
node tests/audit-modals.mjs
```

---

## 📚 Dokumentasi Proyek Lengkap

Seluruh dokumen perancangan dan audit SpellCode tersedia di folder `docs/`:
- **[Product Requirements Document (PRD)](docs/PRD.md)**: Dokumen kebutuhan produk utama.
- **[Spesifikasi Produk & Desain Game](docs/PRODUCT_SPEC.md)**: Game design document, personas, dan pilar mekanik.
- **[Kriteria Penerimaan & Evaluasi](docs/ACCEPTANCE_CRITERIA.md)**: Checklist kriteria lolos pengujian.
- **[Arsitektur Teknis Sistem](docs/TECHNICAL_ARCHITECTURE.md)**: Arsitektur data flow, domain model, dan server.
- **[Panduan Deployment Komprehensif](docs/DEPLOYMENT_GUIDE.md)**: Konfigurasi Supabase dan Vercel.
- **[Laporan Rilis Resmi 5C & Checklist Lomba](docs/RELEASE_REPORT_5C.md)**: Status acceptance criteria dan checklist demo lomba.
- **[Laporan Audit Kualitas 5B](docs/QUALITY_AUDIT_5B.md)**: Laporan bug hunt, responsivitas, dan aksesibilitas.
- **[Laporan Audit Pengujian (QA Test Report)](docs/TEST_REPORT.md)**: Hasil pengujian otomatis Vitest & Playwright.
- **[Review Keamanan & RLS Audit](docs/SECURITY_REVIEW.md)**: Analisis keamanan basis data.
- **[Spesifikasi Teknis Engine Mantra](docs/SPELL_ENGINE_ARCHITECTURE.md)**: Mesin virtual AST deterministik.

---

## 📄 Lisensi

Dikembangkan untuk kompetisi inovasi edukasi dan teknologi oleh **FirmanDN**.  
Hak Cipta © 2026 SpellCode. Seluruh hak cipta dilindungi undang-undang.
