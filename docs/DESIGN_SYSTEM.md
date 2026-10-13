# SPELLCODE: DESIGN SYSTEM SPECIFICATION
*Sistem Desain Visual, Token Tipografi, Interaksi Mikro, dan Aksesibilitas Anak*

---

## 1. Konsep & Identitas Visual (Whimsical Fantasy)

SpellCode dibangun dengan bahasa visual **Whimsical Fantasy Modern**: dunia akademi sihir yang memadukan kehangatan ilustrasi buku cerita fantasi dengan ketegasan antarmuka game modern yang responsif dan terstruktur.

### Karakteristik Desain:
* **Bersahabat & Tidak Mengintimidasi**: Bentuk elemen membulat (*curved & organic borders*), tombol bergaya 3D timbul (*tactile chunky buttons*), dan palet warna kontras yang memanjakan mata anak usia 7-12 tahun.
* **Menghindari Pola SaaS Generik**: Menolak gaya bento-grid korporat datar, abu-abu pucat monokromatik, atau estetika teks monospace hitam-putih yang kering.
* **Taktil & Responsif**: Setiap blok mantra terasa seperti lempengan batu rune kuno yang berpijar saat diaktifkan, memberikan kepuasan motorik saat disusun dan dijalankan.
* **Fokus Fungsional**: Ornamen sihir (kristal, bintang, kilau partikel) selalu memiliki arti status gameplay (posisi aktif, energi cukup, level selesai), bukan sekadar hiasan mati.

---

## 2. Token Desain (Design Tokens)

### 2.1 Palet Warna Utama & Semantik

| Token Tailwind | Kode Hex | Peran & Penggunaan | Rasio Kontras (WCAG) |
|---|---|---|---|
| `spell-purple-950` | `#0F0622` | Latar belakang malam kosmik akademi | Latar Dasar |
| `spell-purple-900` | `#1A0B36` | Permukaan kartu, panel arena, dan dialog | 14.2:1 thd teks putih |
| `spell-purple-800` | `#2E165B` | Garis batas (*borders*) & slot mantra pasif | 9.8:1 thd teks emas |
| `spell-purple-600` | `#7C3AED` | Aksen sihir violet & status aktif | 4.8:1 thd putih |
| `spell-purple-300` | `#D8B4FE` | Teks sekunder & label penjelasan | 8.5:1 thd background |
| `spell-teal-400` | `#2DD4BF` | Kristal energi, jalur terbuka, fokus keyboard | 7.6:1 thd background |
| `spell-teal-600` | `#0D9488` | Tombol sekunder & ward pelindung | 4.9:1 thd teks putih |
| `spell-gold-400` | `#FBBF24` | Bintang penilaian, lencana XP, tombol utama | 11.2:1 thd background |
| `spell-gold-600` | `#D97706` | Bayangan 3D tombol emas & bingkai berharga | Aksen Taktil |
| `spell-emerald-500` | `#10B981` | Tombol 'Rapalkan Mantra' & portal kemenangan | 5.1:1 thd putih |
| `spell-coral-500` | `#F43F5E` | Misfire mantra, semak duri, tombol hapus | 5.3:1 thd putih |

### 2.2 Tipografi Ramah Anak

* **Font Judul & Header (Display)**: `Fredoka` / `Outfit`
  * Karakter: Rounded geometric sans-serif dengan proporsi ramah, ekspresif, dan mudah dibaca oleh anak yang baru lancar membaca.
  * Ukuran: `h1` (32px - 40px), `h2` (24px - 28px), `h3` (18px - 22px).
* **Font Teks Utama (Body)**: `Outfit` / `Nunito` / `Inter`
  * Karakter: Keterbacaan tinggi dengan spasi antar huruf seimbang.
  * Ukuran: `body-lg` (18px), `body-md` (16px - ukuran standar anak), `body-sm` (14px).
* **Font Angka & Langkah (Code/Step)**: `JetBrains Mono` / `Outfit SemiBold`
  * Karakter: Angka tabular dengan lebar seragam untuk nomor slot langkah mantra (1, 2, 3...) dan kalkulasi XP.

### 2.3 Ukuran Sudut (Border Radius)
* `rounded-rune`: `16px` (Batu rune dan tombol aksi kontrol).
* `rounded-card`: `22px` (Kartu level, rak mantra, panel arena).
* `rounded-dialog`: `28px` (Modal kemenangan, dialog sambutan Familiar).
* `rounded-pill`: `9999px` (Badge gelar, counter bintang, pill switch).

### 2.4 Elevasi Taktil & Bayangan (Tactile Shadows)
Untuk memberi kesan mainan fisik yang bisa ditekan oleh anak:
* **Tombol Hijau (Cast Play)**: `box-shadow: 0 4px 0 #059669, 0 8px 16px rgba(16, 185, 129, 0.3)`
  * Saat ditekan (*active*): `transform: translateY(3px); box-shadow: 0 1px 0 #059669;`
* **Tombol Emas (Primary Action)**: `box-shadow: 0 4px 0 #B45309, 0 8px 16px rgba(245, 158, 11, 0.3)`
* **Rune Slot (Meja Mantra)**: `box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4), 0 1px 0 rgba(255, 255, 255, 0.08)`

---

## 3. Komponen Antarmuka Inti

### 3.1 Arena Grid (Viewport 2D)
* Grid berbentuk petak-petak ubin batu akademi sihir berpola checkerboard halus (`#1A0B36` dan `#220F45`).
* Batas ubin diarsir dengan garis tipis teal redup (`rgba(45, 212, 191, 0.2)`).
* Objek di atas ubin:
  * **Magang Sihir**: Avatar penyihir cilik dengan jubah violet dan topi sihir berujung bintang yang berputar hadap sesuai arah (`UP`, `RIGHT`, `DOWN`, `LEFT`).
  * **Lentera Suci**: Obor lentera yang berubah dari padam (abu-abu) menjadi berpijar emas-oranye terang saat disulut mantra.
  * **Kristal Mana**: Prisma kristal bercahaya biru-teal dengan animasi mengambang halus (*floating animation*).
  * **Portal Sasaran**: Gerbang dimensi berbentuk lingkaran sihir berputar perlahan yang terbuka saat seluruh objektif terpenuhi.
  * **Rintangan**: Semak berduri atau bebatuan magis berlumut.

### 3.2 Meja Mantra (Spell Deck) & Rak Rune (Block Tray)
* **Rak Rune**:
  * Menampilkan balok-balok mantra dengan ikon jelas:
    * `Maju`: Ikon panah melangkah ke depan (Biru-Teal).
    * `Putar Kiri`: Ikon panah belok kiri 90° (Ungu).
    * `Putar Kanan`: Ikon panah belok kanan 90° (Ungu).
    * `Nyalakan Lentera`: Ikon api lentera suci (Emas).
    * `Ambil Kristal`: Ikon permata berpijar (Cyan).
    * `Ulangi (Repeat)`: Balok pembungkus dengan kotak angka interaktif (Gold-Amber).
* **Slot Meja Mantra**:
  * Menampilkan deretan balok vertikal bernomor urut.
  * Memiliki tombol silang kecil di kanan untuk membatalkan langkah.
  * Memberikan efek **Pijar Kuning Terang (Active Step)** saat baris tersebut sedang diproses oleh Virtual Machine.

### 3.3 Dialog & Maskot Pendamping (Pyx si Kucing Api)
* Maskot Familiar ditempatkan di sudut bawah dengan ekspresi wajah kontekstual:
  * **Gembira**: Saat level berhasil diselesaikan.
  * **Penasaran & Menunjuk**: Saat memberikan petunjuk awal misi.
  * **Menghibur**: Saat terjadi misfire atau tabrakan rintangan.
* Balon kata menggunakan latar belakang ungu lembut (`#2E165B`) dengan kontras teks putih yang ramah anak.

### 3.4 Modal Kemenangan (Victory Screen)
* Fanfare visual: Bintang 1, 2, atau 3 bermunculan dengan animasi pegas (*spring animation*) secara berurutan.
* Menampilkan meteran efisiensi langkah (`Langkahmu: X | Par: Y`).
* Meteran Mana XP bertambah dengan suara koin sihir gemerincing.

---

## 4. Prinsip Aksesibilitas (WCAG AA & Ergonomi Anak)

1. **Target Sentuh Minimum 48px**:
   * Seluruh tombol kontrol, balok rune, dan item menu memiliki ukuran fisik minimal 48px x 48px di layar.
2. **Navigasi Keyboard Penuh**:
   * Semua kontrol dapat diakses dengan tombol `Tab` dan `Shift+Tab`.
   * Penekanan tombol dapat dilakukan menggunakan `Enter` atau `Space`.
   * Modal dapat ditutup menggunakan `Escape`.
   * Cincin fokus keyboard yang sangat terlihat: `ring-4 ring-spell-teal-400 outline-none`.
3. **Pemberian Petunjuk Multimodal**:
   * Informasi tidak hanya mengandalkan warna semata; setiap status level selalu disertai ikon (misal: ikon gembok untuk level terkunci, ikon bintang untuk level selesai, bukan hanya warna abu-abu vs hijau).
4. **Pencegahan Kelelahan Gerak (Reduced Motion)**:
   * Menghormati pengaturan OS `prefers-reduced-motion: reduce`; animasi mengambang dan transisi cepat dinonaktifkan jika preferensi pengguna aktif.
