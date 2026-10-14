# Security Review dan Data Quality Assessment: Supabase Backend

Dokumen ini memuat laporan audit komprehensif terkait keamanan, isolasi data, integritas aturan permainan, dan kualitas skema database pada SpellCode.

---

## 1. Ringkasan Eksekutif & Status Kesiapan (Readiness Assessment)

| Parameter | Status | Catatan Evaluasi |
| :--- | :---: | :--- |
| **Row Level Security (RLS)** | **PASS** | RLS aktif pada seluruh 8 tabel dengan kebijakan least privilege. |
| **Isolasi Lintas Pengguna** | **PASS** | Pengguna A terbukti tidak dapat membaca/memodifikasi data Pengguna B. |
| **Proteksi Secret Klien** | **PASS** | `SERVICE_ROLE_KEY` terisolasi di server; tidak bocor ke bundel browser. |
| **Validasi Endpoint Server** | **PASS** | `/api/progress/submit` dan `/api/progress/sync` memvalidasi sesi dan input. |
| **Integritas Reward & XP** | **PASS** | Simulasi server-authoritative; reward tidak dapat dimanipulasi browser. |
| **Pencegahan Duplikasi** | **PASS** | Idempotensi teruji; replay level bintang sama menghasilkan 0 extra XP. |
| **Ketahanan Injeksi SQL** | **PASS** | Seluruh query menggunakan parameterized API dari Supabase PostgREST. |
| **Sanitasi Error** | **PASS** | Pesan kesalahan internal Postgres dimasking menjadi pesan ramah anak. |
| **Batasan Database** | **PASS** | Foreign keys berjenjang (CASCADE), UNIQUE, dan CHECK constraints aktif. |
| **Higienitas Environment** | **PASS** | `.env*.local` diabaikan git; `.env.example` hanya memuat placeholder. |

> [!WARNING]
> **Pernyataan Status Produksi:**
> Aplikasi SpellCode telah lulus audit kode internal, verifikasi statis, dan 163 skenario pengujian unit/integrasi. Namun, aplikasi **belum dapat dinyatakan 100% production-ready** sebelum pemilik proyek mengeksekusi berkas migrasi SQL pada database live Supabase production dan memverifikasi interaksi end-to-end dengan server Supabase Auth aktif.

---

## 2. Analisis Rinci Domain Keamanan

### 2.1. Row Level Security (RLS) dan Isolasi Multi-Tenant
Seluruh 8 tabel database pada berkas `supabase/migrations/20261014000002_row_level_security.sql` mengaktifkan RLS:
- **Tabel Publik (`levels`, `achievements`, `familiars`):**
  - Hanya mengizinkan operasi `SELECT` publik (`USING (is_published = true)` atau `USING (true)`).
  - Kebijakan `INSERT`, `UPDATE`, dan `DELETE` ditiadakan untuk peran `anon` maupun `authenticated`, sehingga hanya dapat dikelola oleh proses backend berprivilese (`service_role`).
- **Tabel Privat Pemain (`profiles`, `player_progress`, `player_achievements`, `player_familiars`):**
  - Menerapkan batasan ketat `auth.uid() = user_id` (atau `auth.uid() = id` pada `profiles`).
  - Pengguna tidak memiliki akses lintas akun.
- **Tabel Audit Log (`level_attempts`):**
  - Hanya mengizinkan `SELECT` dan `INSERT` bagi pemilik akun.
  - Operasi `UPDATE` dan `DELETE` dilarang untuk menjamin keaslian riwayat eksekusi (immutable audit trail).

### 2.2. Proteksi Kunci Rahasia dan Isolasi Bundel Klien
- **Pemisahan Klien Supabase:**
  - `lib/supabase/client.ts` menggunakan `createBrowserClient` dari `@supabase/ssr` dan hanya membaca `NEXT_PUBLIC_SUPABASE_URL` serta `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - `lib/supabase/admin.ts` menginisialisasi `createClient` berprivilese tinggi dengan `SUPABASE_SERVICE_ROLE_KEY` dan disetel dengan `persistSession: false`.
- **Verifikasi Dependensi Klien:**
  - Audit kode memverifikasi bahwa `createAdminClient` hanya diimpor oleh Route Handlers sisi server (`app/api/progress/submit/route.ts` dan `app/api/progress/sync/route.ts`).
  - Tidak ada komponen React berlabel `"use client"` yang mengimpor pustaka atau kunci admin.
- **Higienitas Repositori:**
  - Berkas `.gitignore` secara eksplisit mengecualikan `.env*.local` dan `.env`.
  - `git ls-files .env.local` mengonfirmasi berkas lokal tidak terlacak.
  - Berkas `.env.example` hanya memuat placeholder publik tanpa token nyata.

### 2.3. Validasi Server-Authoritative dan Hardening Endpoint API
- **Endpoint `/api/progress/submit`:**
  - Memeriksa sesi pengguna via `supabase.auth.getUser()`.
  - Memvalidasi batas panjang string `levelId` (maksimal 50 karakter alfanumerik dan tanda hubung).
  - Membatasi jumlah node program mantra AST maksimal 100 node untuk mencegah serangan Denial of Service (DoS) melalui eksekusi program berukuran raksasa.
  - Membatasi panjang string `idempotencyKey` maksimal 100 karakter.
  - Menjalankan program mantra pemain menggunakan game engine deterministik independen (`runSpellProgram`) di sisi server. Hasil evaluasi klien diabaikan sepenuhnya.
- **Endpoint `/api/progress/sync`:**
  - Memeriksa autentikasi aktif; menolak permintaan tanpa sesi (HTTP 401).
  - Membatasi jumlah entri sinkronisasi maksimal 50 level.
  - Menolak ID level yang tidak terdaftar dalam katalog `getLevelById`.
  - Menjalankan verifikasi ulang terhadap `bestSolutionAst` yang dikirim dari penyimpanan lokal sebelum mengakui status selesai (`completed`).
  - Menghitung ulang akumulasi Total XP dan Rank secara deterministik di server berdasarkan bintang yang tervalidasi, bukan dari angka mentah yang dikirim browser.
  - Memvalidasi ID achievement terhadap daftar putih resmi sebelum menyimpannya ke database.

### 2.4. Integritas Sistem Reward dan Idempotensi
- **Aturan Reward Eksplisit:**
  - *First Completion:* Pemain memperoleh XP dasar level dan bintang sesuai par langkah. Level berikutnya terbuka otomatis.
  - *Replay (Bintang Sama atau Turun):* Tidak ada penambahan XP (0 extra XP) untuk mencegah eksploitasi perolehan XP tak terbatas.
  - *Peningkatan Bintang (Delta Reward):* Hanya memberikan selisih peningkatan bintang (contoh: naik dari 1 bintang 60 XP ke 3 bintang 100 XP memberikan +40 XP).
- **Idempotensi Submisi:**
  - Setiap submisi menyertakan `idempotencyKey` unik.
  - Penyimpanan progres menggunakan klausa `ON CONFLICT (user_id, level_id) DO UPDATE` dengan fungsi `GREATEST` pada bintang dan `LEAST` pada langkah terbaik, menjaga data selalu optimal.

### 2.5. Pencegahan Injeksi SQL
- SpellCode tidak menggunakan penyusunan query string mentah (`raw SQL string concatenation`).
- Seluruh interaksi database dilakukan melalui Supabase JavaScript SDK (`@supabase/supabase-js` dan `@supabase/ssr`), yang mentransformasikan perintah menjadi kueri terparameterisasi PostgREST.

### 2.6. Masking Pesan Kesalahan dan Penanganan Informasi Sensitif
- Fungsi `getFriendlyAuthErrorMessage` pada `lib/supabase/auth.ts` menyaring dan menerjemahkan seluruh galat teknis Supabase:
  - Galat autentikasi diubah menjadi instruksi yang santun dan mudah dipahami.
  - Pesan galat internal PostgreSQL (nama relasi, nama constraint unik, kegagalan koneksi host, tanda tangan JWT) disembunyikan dan diganti dengan pesan standar yang aman: *"Gerbang sihir sedang sibuk. Mohon coba beberapa saat lagi."*
- Handler API menangkap eksepsi tak terduga dan mengembalikan respons HTTP 500 dengan pesan ringkas tanpa membocorkan stack trace.

### 2.7. Integritas Relasional dan Batasan Database (Constraints)
Skema tabel pada `supabase/migrations/20261014000001_initial_schema.sql` dilengkapi pengaman tingkat database:
1. `profiles.total_xp CHECK (total_xp >= 0)`
2. `player_progress.stars CHECK (stars BETWEEN 0 AND 3)`
3. `player_progress.status CHECK (status IN ('unlocked', 'completed'))`
4. `level_attempts.stars_earned CHECK (stars_earned BETWEEN 0 AND 3)`
5. `levels.par_steps CHECK (par_steps > 0)`
6. `levels.base_xp CHECK (base_xp >= 0)`
7. `CONSTRAINT uq_user_level UNIQUE (user_id, level_id)`
8. `CONSTRAINT uq_user_achievement UNIQUE (user_id, achievement_id)`
9. `CONSTRAINT uq_user_familiar UNIQUE (user_id, familiar_id)`
10. `REFERENCES auth.users(id) ON DELETE CASCADE`

---

## 3. Temuan Audit dan Remediasi yang Dilakukan

### Temuan 1: Kerentanan Injeksi Progres dan XP pada Endpoint Sinkronisasi (SEVERITY: TINGGI)
- **Kondisi Awal:** Rute `/api/progress/sync` menerima objek `guestData` dan langsung memperbarui database dengan `record.stars` serta `guestData.profile.totalXp` tanpa verifikasi program.
- **Risiko:** Pengguna terautentikasi dapat mengirimkan payload JSON buatan untuk langsung membuka seluruh level dengan 3 bintang dan 999.999 XP.
- **Tindakan Perbaikan:**
  - Ditambahkan validasi bahwa setiap `levelId` harus ada di katalog resmi.
  - Program mantra pada `bestSolutionAst` diuji ulang di server menggunakan `runSpellProgram`.
  - Total XP dihitung ulang secara mandiri oleh server dari level yang tervalidasi.
  - Nilai XP mentah dari browser diabaikan.

### Temuan 2: Potensi Serangan Denial of Service Ukuran Payload AST (SEVERITY: SEDANG)
- **Kondisi Awal:** Endpoint `/api/progress/submit` menerima array `program.nodes` tanpa batasan jumlah elemen.
- **Risiko:** Penyerang dapat mengirimkan ribuan node instruksi bersarang yang membebani CPU server saat menjalankan siklus simulasi.
- **Tindakan Perbaikan:**
  - Ditambahkan pembatasan ketat `program.nodes.length <= 100`.
  - Ditambahkan validasi pola string ID level `^[a-zA-Z0-9_-]+$` dengan panjang maksimal 50 karakter.

### Temuan 3: Sanitasi Input Nama Tampilan Profil (SEVERITY: RENDAH)
- **Kondisi Awal:** Fungsi `updateProfileAppearance` pada repositori menerima string nama tampilan tanpa pemotongan panjang karakter.
- **Risiko:** Karakter berlebih atau spasi liar dapat merusak tampilan kartu penyihir pada UI.
- **Tindakan Perbaikan:**
  - Ditambahkan pembersihan `trim()` dan pembatasan panjang string maksimal 30 karakter dengan fallback aman.

---

## 4. Hasil Pengujian Keamanan Terotomatisasi

Pengujian dijalankan melalui Vitest mencakup seluruh aspek backend dan logika domain:

```bash
> spellcode@0.1.0 test
> vitest run

 ✓ tests/backend/schema_rls_audit.test.ts (14 tests)
 ✓ tests/backend/auth_session.test.ts (13 tests)
 ✓ tests/backend/progress_submission.test.ts (6 tests)
 ✓ tests/backend/progression_rules.test.ts (8 tests)
 ✓ tests/backend/security_audit.test.ts (11 tests)
 ✓ tests/engine/* (111 tests across 12 suites)

 Test Files  17 passed (17)
      Tests  163 passed (163)
   Duration  5.93s
```

### Rincian Skenario Khusus Keamanan (`tests/backend/security_audit.test.ts`):
1. **Verifikasi Isolasi Kunci Rahasia:** Memastikan `client.ts` dan seluruh komponen visual tidak mengimpor atau memuat `SUPABASE_SERVICE_ROLE_KEY`.
2. **Uji Isolasi Lintas Pengguna (Pengguna A vs Pengguna B):**
   - Query Pengguna Alpha hanya mengembalikan data miliknya dan 0 baris data Pengguna Beta.
   - Upaya modifikasi data Pengguna Beta oleh Pengguna Alpha ditolak oleh simulator aturan RLS.
3. **Uji Ketahanan Manipulasi Reward:** Percobaan claim kemenangan dengan program yang belum mencapai portal ditolak oleh engine server dengan hasil 0 bintang dan 0 XP.
4. **Uji Idempotensi Submisi:** Submisi ulang pada level yang telah selesai tidak melipatgandakan reward XP.
5. **Uji Masking Error Database:** Pesan kesalahan Postgres yang memuat string sensitif berhasil disaring menjadi pesan edukatif yang aman.

---

## 5. Daftar Periksa Menuju Lingkungan Produksi (Staging/Production Checklist)

Sebelum merilis sistem ke lingkungan pengguna publik nyata, langkah berikut wajib diselesaikan:

1. [ ] **Eksekusi SQL Migration:** Jalankan migrasi `20261014000001` hingga `20261014000004` di Supabase Cloud Dashboard SQL Editor.
2. [ ] **Konfigurasi Environment Production:** Daftarkan `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` pada dashboard hosting (misal: Vercel) secara aman.
3. [ ] **Pengaturan Redirect URL Supabase Auth:** Pastikan Site URL dan Redirect URLs pada Supabase Auth Dashboard mengarah ke domain resmi produksi (bukan localhost).
4. [ ] **Pengujian Live Dual-Account:** Lakukan pengujian langsung di browser dengan mendaftarkan dua akun uji pada server staging untuk memvalidasi performa koneksi jaringan riil.
