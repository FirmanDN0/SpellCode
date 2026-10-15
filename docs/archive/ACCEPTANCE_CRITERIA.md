# SPELLCODE: ACCEPTANCE CRITERIA & QUALITY ASSURANCE SPECIFICATION
*Kriteria Penerimaan Kualitas, Pengujian Fungsional, dan Standar Kepatuhan Non-Fungsional*

---

## 1. Kriteria Penerimaan Gameplay Engine & Simulasi

### AC-1.1: Determinisme Mutlak (100% Deterministic Execution)
* **Deskripsi**: Setiap kali program mantra yang sama dieksekusi pada konfigurasi level yang sama, hasil langkah, arah pergerakan, dan status akhir harus 100% identik tanpa variasi acak.
* **Metode Pengujian**: Jalankan 100 kali eksekusi otomatis dengan program uji yang sama dalam unit test; pastikan riwayat koordinat state identik di setiap iterasi.
* **Kriteria Lulus**: Tidak ada perbedaan koordinat, status item, atau waktu status akhir antar eksekusi.

### AC-1.2: Pencegahan Loop Tak Terbatas (Infinite Loop Guard)
* **Deskripsi**: Ketika program berisi perulangan bertingkat atau instruksi sangat panjang, mesin virtual tidak boleh membuat antarmuka browser membeku (*freeze*).
* **Metode Pengujian**: Berikan input blok `repeat(20)` yang bersarang di dalam `repeat(20)` dengan instruksi `stepForward()`.
* **Kriteria Lulus**: Mesin virtual secara otomatis menghentikan eksekusi pada batas aman maksimum (`maxExecutionSteps = 100`), memancarkan status `OVERFLOW`, dan menampilkan dialog ramah dari Familiar: *"Energi manamu habis! Coba periksa apakah perulangan mantramu terlalu banyak."*

### AC-1.3: Penegakan Batas Grid dan Rintangan
* **Deskripsi**: Karakter penyihir tidak boleh menembus dinding batas grid atau menginjak petak rintangan (batu, semak berduri, jurang).
* **Metode Pengujian**: Eksekusi perintah `stepForward` ke arah petak rintangan.
* **Kriteria Lulus**: Karakter berhenti di petak sebelum rintangan, animasi benturan kartun dimainkan, status berubah menjadi `FAILED_OBSTACLE`, dan posisi karakter tidak berpindah ke petak terlarang.

### AC-1.4: Sinkronisasi Sorotan Blok (Active Step Highlight)
* **Deskripsi**: Saat karakter bergerak di petak grid, blok kode yang sedang memicu gerakan tersebut harus disorot secara visual di meja mantra (*Spell Deck*).
* **Metode Pengujian**: Amati eksekusi 3 blok berurutan pada kecepatan 1x.
* **Kriteria Lulus**: Sorotan berpindah serempak dengan gerakan karakter pada frame waktu yang sama.

---

## 2. Kriteria Penerimaan Antarmuka Ramah Anak (Child-Friendly UI/UX)

### AC-2.1: Target Sentuh dan Ergonomi (Touch Target)
* **Deskripsi**: Semua elemen interaktif (tombol, blok rune, ikon menu) harus mudah ditekan oleh anak-anak menggunakan jari di layar sentuh atau kursor mouse.
* **Kriteria Lulus**:
  * Ukuran minimum area sentuh adalah 48px x 48px.
  * Jarak renggang antar tombol interaktif minimal 8px untuk mencegah salah tekan.

### AC-2.2: Kontras Warna dan Aksesibilitas Visual (WCAG AA)
* **Deskripsi**: Teks instruksi, label tombol, dan ikon harus memiliki keterbacaan tinggi bagi anak-anak.
* **Kriteria Lulus**:
  * Teks reguler memiliki rasio kontras minimal 4.5:1 terhadap warna latar belakangnya.
  * Teks tebal atau berukuran besar (18px+) memiliki rasio kontras minimal 3:1.
  * Lulus audit kontras otomatis tanpa kegagalan elemen teks inti.

### AC-2.3: Pesan Kesalahan Afirmatif & Ramah (Anti-Frustration Feedback)
* **Deskripsi**: Tidak boleh ada istilah teknis menakutkan seperti "NullPointer", "SyntaxError", atau layar merah pekat saat anak gagal.
* **Kriteria Lulus**:
  * Semua pesan kegagalan dibawakan oleh karakter Familiar dengan nada suportif.
  * Selalu menyertakan petunjuk konstruktif tentang apa yang bisa diperbaiki.
  * Tombol "Coba Lagi" (Reset) mengembalikan karakter ke titik awal dengan satu klik tanpa penalti poin dan **tidak menghapus susunan blok kode yang telah dibuat**.

### AC-2.4: Aksesibilitas Keyboard Penuh
* **Deskripsi**: Seluruh alur permainan dapat dioperasikan menggunakan keyboard saja.
* **Kriteria Lulus**:
  * Tombol dan blok dapat dinavigasi secara sekuensial dengan tombol `Tab` dan `Shift+Tab`.
  * Tombol aksi dapat diaktifkan dengan `Enter` atau `Space`.
  * Dialog modal dapat ditutup dengan menekan tombol `Escape`.
  * Indikator fokus keyboard (*focus ring*) terlihat jelas dan tidak dihilangkan.

### AC-2.5: Penanganan Empty State, Loading, dan Error Fallback
* **Deskripsi**: Antarmuka memiliki tampilan panduan ketika data belum tersedia, saat proses memuat, atau jika terjadi error rendering tak terduga.
* **Kriteria Lulus**:
  * Saat meja mantra kosong: Muncul teks panduan visual *"Tarik atau klik rune di bawah untuk meramu mantramu!"*.
  * Saat pergantian level: Menampilkan layar transisi kristal sihir berputar tanpa flicker putih.
  * Jika terjadi unhandled error: Ditangkap oleh React Error Boundary dengan tombol *"Mulai Ulang Arena"* ramah anak.

---

## 3. Kriteria Penerimaan Sistem Level dan Progres

### AC-3.1: Pembukaan Level Berjenjang (Gated Progression)
* **Deskripsi**: Level berikutnya hanya dapat dimainkan setelah level prasyarat berhasil diselesaikan.
* **Kriteria Lulus**:
  * Level 1 selalu berstatus `unlocked` untuk pemain baru.
  * Level 2 berstatus `locked` hingga Level 1 selesai dengan minimal 1 bintang.
  * Mengklik level yang terkunci menampilkan animasi gembok dan pesan lembut tentang level mana yang perlu diselesaikan terlebih dahulu.

### AC-3.2: Formula Bintang dan Par Steps
* **Deskripsi**: Bintang diberikan berdasarkan pencapaian objektif dan efisiensi kode.
* **Kriteria Lulus**:
  * 1 Bintang: Berhasil mencapai portal dan mengumpulkan seluruh target kristal.
  * 2 Bintang: Berhasil menyelesaikan misi dengan jumlah langkah di bawah toleransi (`par_steps + 2`).
  * 3 Bintang: Berhasil menyelesaikan misi dengan jumlah langkah optimal (`<= par_steps`).

### AC-3.3: Formula Mana XP dan Rank Progression
* **Deskripsi**: XP dihitung secara transparan dan meningkatkan gelar penyihir cilik.
* **Kriteria Lulus**:
  * 3 Bintang memberikan 100 XP (50 base + 50 bonus).
  * 2 Bintang memberikan 75 XP (50 base + 25 bonus).
  * 1 Bintang memberikan 60 XP (50 base + 10 bonus).
  * Memainkan ulang level yang sudah diselesaikan hanya memberikan selisih XP jika pemain berhasil menaikkan rating bintang.
  * Kenaikan pangkat otomatis: Novice Conjurer (0-199 XP), Apprentice Elementalist (200-499 XP), Rune Weaver (500-999 XP), Master Spellcoder (1000+ XP).

### AC-3.4: Pelestarian Draf Kode saat Meninggalkan Level
* **Deskripsi**: Jerih payah anak menyusun blok kode tidak boleh hilang jika mereka tidak sengaja menutup tab atau kembali ke peta.
* **Kriteria Lulus**:
  * Susunan blok terakhir pada level aktif otomatis disimpan ke `localStorage`.
  * Saat membuka level itu kembali, blok langsung terisi seperti saat ditinggalkan.

---

## 4. Kriteria Penerimaan Mode Tamu & Sinkronisasi Cloud

### AC-4.1: Pengalaman Tanpa Registrasi (Guest-First Experience)
* **Deskripsi**: Anak dapat langsung memainkan game saat membuka situs tanpa disodori formulir pendaftaran akun.
* **Kriteria Lulus**:
  * Permainan menyimpan progres level, bintang, dan perolehan XP secara otomatis di LocalStorage browser (`spellcode_guest_v1`).
  * Menyegarkan halaman (*refresh*) tidak menghilangkan progres yang telah dicapai.

### AC-4.2: Migrasi Mulus dari Tamu ke Akun Terdaftar
* **Deskripsi**: Ketika anak atau orang tua memutuskan mendaftarkan akun, progres lokal tidak boleh hilang.
* **Kriteria Lulus**:
  * Sistem mendeteksi data tamu yang ada di LocalStorage saat proses login berhasil.
  * Seluruh level yang sudah selesai, bintang, dan XP diimpor ke akun Supabase pemain.
  * Status data di cloud dan lokal berada dalam kondisi sinkron.

### AC-4.3: Perilaku Offline-First
* **Deskripsi**: Permainan harus dapat dimainkan 100% meskipun koneksi internet terputus.
* **Kriteria Lulus**:
  * Seluruh 15 level World 1 dan World 2 dapat dimuat dan diselesaikan dalam kondisi offline.
  * Jika koneksi mati saat verifikasi cloud, aksi disimpan ke antrean lokal dan di-sync saat online.

---

## 5. Kriteria Penerimaan Keamanan dan Integritas Data

### AC-5.1: Verifikasi Server-Side Terhadap Solusi Level
* **Deskripsi**: Pengguna tidak dapat memanipulasi skor atau bintang secara langsung dari inspect element browser.
* **Kriteria Lulus**:
  * Klien hanya mengirimkan payload susunan blok AST ke server endpoint `/api/verify-solution`.
  * Server menjalankan simulasi headless yang sama untuk memvalidasi apakah solusi benar-benar mencapai portal.
  * Hanya server yang berhak menuliskan penambahan XP dan status bintang ke database Postgres.

### AC-5.2: Kerahasiaan Kunci Kredensial (Secret Keys Safety)
* **Deskripsi**: Tidak ada kredensial berprivilese tinggi yang bocor ke bundle JavaScript browser.
* **Kriteria Lulus**:
  * `SUPABASE_SERVICE_ROLE_KEY` tidak pernah diawali dengan awalan `NEXT_PUBLIC_` dan tidak diimpor ke komponen sisi klien.
  * Seluruh panggilan klien menggunakan `NEXT_PUBLIC_SUPABASE_ANON_KEY` yang dilindungi oleh Row Level Security (RLS).

---

## 6. Kriteria Penerimaan Performa & Kualitas Teknis

### AC-6.1: Bebas Error TypeScript & Lint
* **Kriteria Lulus**:
  * Perintah kompilasi `npm run build` berhasil tanpa peringatan tipe atau error TypeScript strict mode (`tsc --noEmit`).
  * Tidak ada error konsol (`console.error`) yang tidak tertangani selama siklus gameplay berjalan.

### AC-6.2: Responsivitas Layar
* **Kriteria Lulus**:
  * Tampilan antarmuka beradaptasi dengan mulus pada resolusi minimum ponsel/tablet kecil (360px lebar) hingga layar monitor desktop (1440px+ lebar).
  * Tidak ada overflow horizontal yang tidak disengaja (*no unwanted horizontal scrollbar*).
