# Panduan Setup Supabase Backend & Player Progression

Dokumentasi resmi integrasi backend PostgreSQL, Supabase Auth, Row Level Security (RLS), dan arsitektur Server-Authoritative Progression untuk **SpellCode: Cast Spells with Code**.

---

## 1. Ikhtisar Arsitektur

SpellCode menggunakan pendekatan **Server-Authoritative Progression**:
* **Client (Browser)**: Bertanggung jawab merender arena visual, menangani drag-and-drop / klik rune, memvisualisasikan eksekusi mantra langkah demi langkah, dan menyediakan fallback offline (Guest LocalStorage).
* **Server (Next.js App Router + Supabase)**: Menjadi satu-satunya sumber kebenaran (single source of truth) untuk validasi hasil program, pemberian bintang, perhitungan XP, pembukaan level baru, dan peraihan lencana (achievements). Browser **tidak pernah** dipercaya untuk mengirim skor, bintang, atau XP secara bebas.
* **Row Level Security (RLS)**: Diaktifkan pada seluruh tabel. Katalog publik (`levels`, `achievements`, `familiars`) dapat dibaca secara bebas, sedangkan data pribadi pemain (`profiles`, `player_progress`, `level_attempts`, `player_achievements`, `player_familiars`) dilindungi ketat hanya untuk pemilik data (`auth.uid() = user_id`). Mutasi progres divalidasi dan dicatat oleh server menggunakan service role key.

---

## 2. Struktur Tabel Database (Data Domain)

| Nama Tabel | Deskripsi | Aturan RLS |
| :--- | :--- | :--- |
| `profiles` | Profil magang, terhubung 1-to-1 dengan `auth.users(id)` | Pengguna hanya dapat membaca dan mengubah profil miliknya sendiri |
| `levels` | Katalog 12 level kampanye resmi (World 1 & 2) | Publik dapat membaca (`SELECT USING (is_published = true)`), mutasi hanya oleh server |
| `player_progress` | Status unlock, bintang (0-3), langkah terbaik, dan AST solusi | Pengguna hanya dapat membaca dan mengelola miliknya sendiri (`auth.uid() = user_id`) |
| `level_attempts` | Audit trail riwayat eksekusi program pemain (append-only) | Pengguna hanya dapat membaca dan mencatat miliknya sendiri (`auth.uid() = user_id`) |
| `achievements` | Definisi katalog lencana prestasi dan reward XP | Publik dapat membaca (`SELECT USING (true)`) |
| `player_achievements` | Lencana yang telah diraih oleh pemain | Pengguna hanya dapat membaca dan mencatat miliknya sendiri (`auth.uid() = user_id`) |
| `familiars` | Definisi katalog hewan pendamping magang | Publik dapat membaca (`SELECT USING (true)`) |
| `player_familiars` | Koleksi familiar yang dimiliki pemain | Pengguna hanya dapat membaca dan mengelola miliknya sendiri (`auth.uid() = user_id`) |

---

## 3. Konfigurasi Environment Variables

Simpan kredensial pada file `.env.local` di root proyek (file ini sudah diabaikan di `.gitignore` untuk mencegah kebocoran secret):

```bash
# Supabase Public Configuration (Dapat diakses di browser client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-publishable-key-here

# Supabase Server-Only Configuration (HANYA diakses di server, JANGAN ekspos ke browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key-here

# URL Aplikasi untuk Redirect Auth
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Catatan Keamanan Penting**: `SUPABASE_SERVICE_ROLE_KEY` memiliki hak administratif penuh yang mengabaikan RLS. Variabel ini hanya diimpor oleh `lib/supabase/admin.ts` di lingkungan Node.js server. Jangan pernah menambahkan awalan `NEXT_PUBLIC_` pada kunci ini.

---

## 4. Langkah Menjalankan Migrasi SQL

Terdapat dua cara untuk menerapkan skema database:

### Opsi A: Supabase Dashboard SQL Editor (Direkomendasikan: 1 Kali Klik)
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan pilih proyek Anda.
2. Masuk ke menu **SQL Editor** pada navigasi bilah sisi kiri.
3. Klik tombol **New Query**.
4. Buka file `supabase/schema.sql` pada repository ini, salin seluruh isinya, dan tempelkan ke SQL Editor.
5. Klik tombol **Run** (atau tekan `Ctrl+Enter`). Seluruh tabel, fungsi `handle_updated_at()`, trigger `handle_new_user()`, kebijakan RLS, serta data awal (seed) 12 level MVP, familiars, dan achievements akan dibuat seketika.

### Opsi B: Migrasi Terpisah Berurutan (Incremental Migrations)
Jika Anda menggunakan Supabase CLI atau ingin menerapkan migrasi secara bertahap:
1. `supabase/migrations/20261014000001_initial_schema.sql` (Tabel, constraint, index, dan trigger update)
2. `supabase/migrations/20261014000002_row_level_security.sql` (Aktivasi RLS dan kebijakan akses least privilege)
3. `supabase/migrations/20261014000003_auth_triggers.sql` (Hook pendaftaran pengguna baru dengan exception handling terisolasi)
4. `supabase/migrations/20261014000004_seed_campaign.sql` (Katalog level, familiars, dan achievements)

---

## 5. Konfigurasi Supabase Auth

1. Masuk ke **Authentication > URL Configuration** di dashboard Supabase:
   * **Site URL**: `http://localhost:3000` (atau domain produksi Anda).
   * **Redirect URLs**: Tambahkan `http://localhost:3000/auth/callback` dan `https://<domain-anda>/auth/callback`.
2. Masuk ke **Authentication > Providers**:
   * Pastikan provider **Email** diaktifkan.
   * Aktifkan opsi **Enable Email OTP / Magic Link** dan/atau **Enable Password-based sign in**.

---

## 6. Alur Autentikasi & Onboarding Otomatis

1. **Pendaftaran / Sign Up**:
   Ketika pengguna baru mendaftar (baik via email/password maupun Magic Link), trigger PostgreSQL `handle_new_user()` secara otomatis:
   * Membuat entri profil di `public.profiles` dengan username unik dan sanitasi string.
   * Memberikan familiar starter *Pyx Sang Kucing Api* di `public.player_familiars`.
   * Membuka level pertama `w1-l1` dengan status `'unlocked'` di `public.player_progress`.
   * Memberikan lencana pembuka *Selamat Datang di Akademi* di `public.player_achievements`.
   * **Ketahanan Kegagalan (Resilience)**: Seluruh blok inisialisasi dibungkus dalam blok `EXCEPTION WHEN OTHERS THEN`. Jika terjadi galat sampingan, registrasi akun primer di `auth.users` tetap berhasil tanpa crash.
2. **Mode Tamu (Guest Mode)**:
   Pemain anak-anak tidak dipaksa untuk langsung login. Mereka dapat langsung bermain di `/map` menggunakan penyimpanan lokal.
3. **Sinkronisasi Otomatis**:
   Ketika pemain tamu memutuskan untuk mendaftar/login di `/login`, sistem secara otomatis memanggil `/api/progress/sync` untuk memindahkan level yang sudah selesai dan total XP ke akun cloud Supabase tanpa kehilangan pencapaian.

---

## 7. Arsitektur Pencegahan Kecurangan (Anti-Tampering)

Endpoint `app/api/progress/submit/route.ts` menerapkan validasi ketat:
* **Eksekusi Ulang AST di Server**: Server mengambil data level kanonikal dan mengeksekusi AST program mantra pemain menggunakan mesin eksekusi deterministik (`runSpellProgram`). Hasil kemenangan hanya diakui jika objektif benar-benar tercapai di arena server.
* **Perhitungan Bintang Authoritative**:
  * Langkah `<= parSteps`: 3 Bintang (100 XP)
  * Langkah `<= parSteps + 2`: 2 Bintang (75 XP)
  * Langkah `> parSteps + 2`: 1 Bintang (60 XP)
* **Pencegahan Replay Attack**:
  * Replay pada level yang sudah selesai dengan jumlah bintang yang sama tidak memberikan tambahan XP (`xpDiff = 0`).
  * Jika pemain berhasil meningkatkan bintang (misal dari 1 bintang ke 3 bintang), pemain hanya menerima selisih XP peningkatan (`Math.max(0, newXp - oldXp)`).
* **Audit Trail**:
  * Setiap percobaan dicatat ke `level_attempts` beserta timestamp dan AST program yang diajukan.

---

## 8. Panduan Pengujian Kebijakan RLS (Security Verification Matrix)

Setelah migrasi dijalankan pada database PostgreSQL Supabase, Anda dapat menguji kebijakan isolasi data menggunakan SQL Editor:

```sql
-- Skenario Pengujian 1: Simulasi Akses sebagai Pemain A
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';

  -- Coba membaca progres Pemain B (harus mengembalikan 0 baris)
  SELECT * FROM public.player_progress WHERE user_id = '22222222-2222-2222-2222-222222222222';

  -- Coba memodifikasi data profil Pemain B (harus gagal atau mengembalikan 0 baris terpengaruh)
  UPDATE public.profiles SET display_name = 'Hacked' WHERE id = '22222222-2222-2222-2222-222222222222';
ROLLBACK;

-- Skenario Pengujian 2: Simulasi Akses Tamu Tanpa Autentikasi (Anon)
BEGIN;
  SET LOCAL ROLE anon;

  -- Membaca katalog level publik (harus berhasil membaca 12 baris level)
  SELECT count(*) FROM public.levels WHERE is_published = true;

  -- Coba membaca data progres privat pemain (harus mengembalikan 0 baris)
  SELECT * FROM public.player_progress;
ROLLBACK;
```

---

## 9. Status Pengujian & Catatan Tindakan Pemilik Proyek

* **Verifikasi Statis & Unit Test (Lokal)**:
  Telah diuji 100% menggunakan Vitest pada `tests/backend/schema_rls_audit.test.ts` dan `tests/backend/progress_submission.test.ts` (14 suites, 131 tests passing). Skrip SQL telah diaudit untuk memastikan keberadaan primary key, foreign key berjenjang, constraint, index, least privilege RLS, dan ketahanan exception handling pada trigger.
* **Pengujian Database Langsung (Cloud Instance)**:
  Pengujian interaktif secara langsung terhadap instance cloud PostgreSQL Supabase memerlukan eksekusi skrip `supabase/schema.sql` di Supabase Dashboard SQL Editor oleh pemilik proyek. Setelah langkah tersebut dijalankan, seluruh API endpoint dan session client akan terhubung langsung ke database aktif.
