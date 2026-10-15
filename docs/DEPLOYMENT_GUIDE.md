# Panduan Deployment & Konfigurasi Rilis (Deployment Guide)

**Aplikasi**: SpellCode: Cast Spells with Code  
**Target Platform**: Vercel (Frontend & Serverless Edge) + Supabase (Database PostgreSQL, Auth, & Storage)  
**Versi**: MVP 1.0.0 Production Ready  

---

## 1. Arsitektur Deployment

SpellCode dibangun dengan pola arsitektur modern berlatensi rendah:
- **Frontend & API Routes**: Next.js 15 App Router dideploy ke Vercel Edge/Serverless Network.
- **Database & Autentikasi**: Supabase PostgreSQL dengan Row Level Security (RLS) dan Supabase Auth (GoTrue).
- **Client/Server Boundary**:
  - Browser Client hanya menggunakan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Serverless API Routes (`/api/progress/submit`, `/api/progress/sync`, `/auth/signout`) menggunakan `SUPABASE_SERVICE_ROLE_KEY` secara terisolasi untuk simulasi validasi skor server.

---

## 2. Matriks Environment Variables

Konfigurasikan variabel lingkungan berikut di dashboard hosting Vercel dan file lokal `.env.local`:

| Nama Variabel | Lingkup | Wajib | Nilai Contoh / Format | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Ya | `https://xyzproject.supabase.co` | URL endpoint API instance Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client & Server | Ya | `eyJhbGciOiJIUzI1Ni...` | Kunci publik Supabase (dibatasi oleh RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-Only | Ya | `eyJhbGciOiJIUzI1Ni...` | Kunci administratif untuk validasi progres server |
| `NEXT_PUBLIC_SITE_URL` | Client & Server | Opsional | `https://spell-code-nine.vercel.app` | URL dasar untuk redirect callback autentikasi |

> **PERINGATAN KEAMANAN**:  
> Jangan pernah menambahkan awalan `NEXT_PUBLIC_` pada `SUPABASE_SERVICE_ROLE_KEY`. Kunci ini memiliki privilese bypass RLS dan hanya boleh diakses di lingkungan Node.js server.

---

## 3. Langkah Setup Database Supabase

Jika melakukan inisialisasi pada proyek Supabase baru, ikuti urutan migrasi berikut melalui **Supabase Dashboard > SQL Editor**:

### Langkah 1: Eksekusi Skema Fondasi
Jalankan file skema inti di repository:
```bash
supabase/schema.sql
```
Skema ini mencakup:
- Ekstensi UUID: `uuid-ossp`
- Tabel data pemain: `profiles`, `player_progress`, `player_achievements`
- Tabel katalog referensi: `levels`, `familiars`, `achievements`
- Seluruh kebijakan keamanan RLS (*Row Level Security*)
- Trigger otomatis pembuatan profil saat pengguna mendaftar (`on_auth_user_created`)

### Langkah 2: Eksekusi Migrasi Bertahap (Jika Menggunakan Supabase CLI)
Jika menggunakan Supabase CLI lokal, jalankan migrasi berurutan:
```bash
supabase migration up
```
Daftar file migrasi di folder `supabase/migrations/`:
1. `20261014000001_initial_schema.sql`: Inisialisasi struktur tabel.
2. `20261014000002_row_level_security.sql`: Penguatan kebijakan Row Level Security.
3. `20261014000003_auth_triggers.sql`: Function dan trigger pembuatan profil otomatis.
4. `20261014000004_seed_campaign.sql`: Seed data katalog World 1 & World 2.
5. `20261015000005_seed_world3.sql`: Seed data katalog World 3 (Cloud Citadel / Benteng Awan).

### Langkah 3: Konfigurasi Supabase Auth Redirect
Buka **Supabase Dashboard > Authentication > URL Configuration**:
- **Site URL**: `https://spell-code-nine.vercel.app` (atau `http://localhost:3000` untuk development)
- **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `https://spell-code-nine.vercel.app/auth/callback`
  - `https://*.vercel.app/auth/callback` (untuk preview branch deployments)

---

## 4. Instruksi Setup dari Repository Bersih (Clean Clone)

Untuk menguji atau menjalankan aplikasi dari nol di mesin pengembang baru:

```bash
# 1. Kloning repository
git clone https://github.com/FirmanDN0/SpellCode.git
cd SpellCode

# 2. Instal seluruh dependensi
npm install

# 3. Salin template variabel lingkungan
cp .env.example .env.local

# 4. Buka .env.local dan masukkan kredensial Supabase Anda
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# 5. Jalankan validasi statis dan test suite
npm run lint
npx tsc --noEmit
npm test

# 6. Uji build produksi Next.js
npm run build

# 7. Jalankan server pengembangan lokal
npm run dev
```

Aplikasi dapat dibuka di browser pada alamat: `http://localhost:3000`.

---

## 5. Panduan Deployment ke Vercel

### Melalui Vercel Web Dashboard (Rekomendasi)
1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **"Add New..."** > **"Project"**.
3. Pilih repository **`FirmanDN0/SpellCode`** dan klik **"Import"**.
4. Konfigurasi Project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)
5. Masukkan **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = nilai dari Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = nilai dari Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` = nilai service role Supabase
   - `NEXT_PUBLIC_SITE_URL` = URL domain Vercel Anda (`https://spell-code-nine.vercel.app`)
6. Klik **"Deploy"**. Vercel akan otomatis melakukan build produksi, static page generation, dan mempublikasikan aplikasi.

---

## 6. Smoke Test & Checklist Verifikasi Pasca-Deployment

### Status Verifikasi Smoke Test
* **Smoke Test Lokal (Node.js & Playwright E2E):** **LULUS (13/13 Skenario Lulus 100%)**
* **Smoke Test Eksternal Cloud Live Deployment:** **PENDING (Menunggu penautan akun eksternal Vercel & Supabase oleh pengguna)**

### Prosedur Smoke Test Pasca-Deployment Live
Jalankan verifikasi berurutan berikut segera setelah URL produksi Vercel (`https://your-domain.vercel.app`) aktif:
1. **Pemeriksaan Halaman Utama (`/`):**
   - Pastikan visual hero, ilustrasi SVG, lencana, dan tombol CTA 'Mulai Petualangan' ter-render tanpa pergeseran tata letak (CLS).
2. **Pemeriksaan Peta Dunia (`/map`):**
   - Buka dalam mode tamu. Pastikan World 1 Level 1 berstatus aktif dan siap dimainkan.
   - Klik kartu World 2 dan World 3 yang terkunci, pastikan modal prasyarat muncul dengan benar.
3. **Pemeriksaan Gameplay & Evaluasi Engine (`/play/w1-l1`):**
   - Tambahkan 3 balok 'Maju 1 Langkah'.
   - Tekan 'Rapalkan Mantra', amati animasi langkah dan pastikan Modal Kemenangan (3 Bintang + XP) muncul.
4. **Pemeriksaan Persistensi Data (Local-First):**
   - Refresh browser pada level yang baru saja dimenangkan. Pastikan status level tetap tersimpan dan Level 2 otomatis terbuka.
5. **Pemeriksaan Autentikasi Cloud (`/login`):**
   - Coba lakukan pendaftaran akun baru menggunakan email dan password.
   - Verifikasi bahwa profil pengguna berhasil dibuat di tabel `public.profiles` Supabase.
6. **Pemeriksaan Error Handling Backend Offline:**
   - Putuskan koneksi internet sementara, lalu jalankan satu level.
   - Pastikan game tetap dapat diselesaikan 100% dan muncul indikator 'Mode Tamu / Offline' tanpa layar putih (crash).
7. **Pemeriksaan Konsol & Jaringan Browser (DevTools):**
   - Buka tab Console: pastikan 0 uncaught exception.
   - Buka tab Network: pastikan tidak ada request aset biner (font, icon, script) yang menghasilkan status HTTP 404 atau 500.

---

## 7. Solusi Kendala Umum (Troubleshooting)

| Gejala | Penyebab Umum | Solusi |
| :--- | :--- | :--- |
| `Cannot find module './server'` saat build client | Modul server diimpor oleh komponen client | Pastikan komponen berlabel `"use client"` hanya mengimpor dari `lib/supabase/client.ts` atau `auth.ts` murni. |
| Auth redirect mengarah ke `localhost` di Vercel | Supabase Site URL belum disetel ke domain Vercel | Tambahkan domain Vercel di menu Supabase Auth > URL Configuration. |
| Error `permission denied for table` pada Supabase | RLS aktif namun belum ada policy atau user belum login | Pastikan skema RLS di `supabase/schema.sql` telah dieksekusi lengkap. |
| Bintang level World 2 tidak pernah 3 | Target Par sebelumnya menghitung langkah fisik alih-alih jumlah balok | Engine SpellCode telah diperbarui untuk menghitung efisiensi kode (`instructionCount`) secara otomatis. |
