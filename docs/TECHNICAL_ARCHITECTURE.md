# SPELLCODE: TECHNICAL ARCHITECTURE SPECIFICATION
*Spesifikasi Arsitektur Sistem, Mesin Simulasi Deterministik, dan Keamanan Platform*

---

## 1. Ikhtisar Arsitektur Sistem

SpellCode dibangun dengan pendekatan arsitektur web modern yang mengutamakan kinerja rendering tinggi, keandalan eksekusi logika deterministik, dan pemisahan tanggung jawab (*Separation of Concerns*) yang bersih antara antarmuka pengguna, mesin simulasi game, dan layer persistensi data.

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT APPLICATION (Browser)                         |
|                                                                                         |
|  +--------------------+   +-----------------------+   +------------------------------+  |
|  |     UI Layer       |   |   Visual Code Block   |   |        Game Viewport         |  |
|  |  (Next.js Pages,   |   |   (Drag/Drop Tray,    |   |    (Canvas / SVG 2D Grid,    |  |
|  |   Motion, Tailwind)|   |    Rune Slot List)    |   |     Step Visualizer)         |  |
|  +---------+----------+   +-----------+-----------+   +--------------+---------------+  |
|            |                          |                              |                  |
|            v                          v                              v                  |
|  +-----------------------------------------------------------------------------------+  |
|  |                             SPELLCODE CLIENT CORE ENGINE                          |  |
|  |                                                                                   |  |
|  |   +-------------------+    +--------------------+    +------------------------+   |  |
|  |   |    AST Parser     | -> |  Step-by-Step VM   | -> |   Grid State Machine   |   |  |
|  |   | (Block to Opcode) |    |  (Generator Loop)  |    |  (Immutable Transition)|   |  |
|  |   +-------------------+    +--------------------+    +-----------+------------+   |  |
|  |                                                                  |                |  |
|  |                                                                  v                |  |
|  |                                                      +------------------------+   |  |
|  |                                                      |  Win Condition Checker |   |  |
|  |                                                      +------------------------+   |  |
|  +-----------------------------------------------------------------------------------+  |
|            |                                                         |                  |
|            v                                                         v                  |
|  +--------------------+                                     +------------------------+  |
|  |  Client State      |                                     |    Audio Manager       |  |
|  |  (Zustand / Local) |                                     |   (Web Audio API)      |  |
|  +---------+----------+                                     +------------------------+  |
+------------|----------------------------------------------------------------------------+
             | (Payload Verifikasi: Solusi Level)
             v
+-----------------------------------------------------------------------------------------+
|                                 SERVER & BACKEND LAYER                                  |
|                                                                                         |
|  +-------------------------------------+    +----------------------------------------+  |
|  | Next.js API Routes / Edge Handlers  |    | Supabase Backend                       |  |
|  |  - /api/verify-solution             |    |  - Supabase Auth (Magic Link/Anonymous)|  |
|  |    (Server Re-execution Engine)     |    |  - PostgreSQL Database                 |  |
|  |  - Anti-tampering score/XP audit    |    |  - Row Level Security (RLS) Policies   |  |
|  +-------------------------------------+    +----------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Pilihan Stack Teknologi & Rationale

| Teknologi | Versi Target | Peran Arsitektur | Rationale & Keputusan |
|---|---|---|---|
| **Next.js** | 15.x (App Router) | Web Application Framework | Memberikan SSR/SSG untuk halaman statis (kecepatan muat awal tinggi untuk perangkat anak), optimasi gambar otomatis, dan rute API terisolasi untuk verifikasi server. |
| **TypeScript** | 5.x | Bahasa Pemrograman Utama | Strict type safety mencegah runtime errors, menjamin kontrak skema level dan state machine game selalu konsisten. |
| **Tailwind CSS** | 3.4.x / 4.x | Styling & Design System | Utilitas styling yang konsisten dan cepat tanpa overhead runtime CSS-in-JS. Sangat mudah merancang token warna ramah anak dan responsivitas layout. |
| **Motion** (Framer Motion) | 11.x | Micro-interactions & UI Animation | Menghidupkan karakter, kartu sihir, transisi dialog, dan perayaan kemenangan secara deklaratif dengan performa 60 FPS berbasis GPU. |
| **Lucide React** | Latest | Ikonografi Terarah | Ikon SVG berbobot ringan untuk kontrol UI (Play, Pause, Step, Reset, Sound, Settings). Menghindari penggunaan aset raster berat. |
| **Zustand** | 5.x | Client State Management | State manager ringkas tanpa boilerplate berat, ideal untuk menghubungkan interaksi UI dengan status Game Loop yang sedang berjalan. |
| **Web Audio API** | Native Browser | Audio Engine | Pemutaran suara responsif dengan latensi mendekati nol tanpa ketergantungan pustaka luar yang membengkakkan bundle. |
| **Supabase** | Client SDK 2.x | Backend-as-a-Service | Mengelola database Postgres terstruktur, otentikasi tanpa sandi rumit, dan aturan keamanan berbasis Row Level Security (RLS). |

---

## 3. Struktur Modul dan Direktori

```
lomab-vibecoding/
├── app/                                 # Next.js App Router
│   ├── (auth)/                          # Kelompok rute otentikasi
│   │   ├── login/
│   │   └── callback/
│   ├── (game)/                          # Kelompok rute permainan
│   │   ├── play/
│   │   │   └── [levelId]/page.tsx       # Halaman utama game arena
│   │   ├── map/page.tsx                 # Peta dunia & seleksi level
│   │   └── grimoire/page.tsx            # Buku koleksi mantra & familiar
│   ├── (marketing)/
│   │   ├── page.tsx                     # Landing page pengenalan akademi
│   │   └── parent-guide/page.tsx        # Panduan untuk guru & orang tua
│   ├── api/
│   │   ├── levels/route.ts              # Endpoint metadata level publik
│   │   └── verify-solution/route.ts     # Endpoint verifikasi solusi deterministik
│   ├── globals.css                      # Global styles & Tailwind layers
│   └── layout.tsx                       # Root layout dengan theme & sound providers
├── components/
│   ├── ui/                              # Komponen antarmuka dasar ramah anak
│   │   ├── Button.tsx
│   │   ├── Dialog.tsx
│   │   ├── ProgressBar.tsx
│   │   └── SoundToggle.tsx
│   ├── game/                            # Komponen khusus arena permainan
│   │   ├── ArenaGrid.tsx                # Komponen render grid 2D & entitas
│   │   ├── WizardCharacter.tsx          # Sprite/visual avatar penyihir
│   │   ├── BlockTray.tsx                # Rak koleksi blok rune
│   │   ├── SpellDeck.tsx                # Tempat anak menyusun urutan blok
│   │   ├── ControlBar.tsx               # Tombol Cast, Step, Reset, Speed
│   │   ├── DebuggerGuide.tsx            # Petunjuk dan balon bicara Familiar
│   │   └── VictoryModal.tsx             # Modal perayaan kemenangan & bintang
│   └── shared/
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/
│   ├── engine/                          # Mesin inti simulasi game
│   │   ├── ast.ts                       # Tipe data & parser Abstract Syntax Tree
│   │   ├── compiler.ts                  # Konversi blok visual menjadi instruksi opcode
│   │   ├── vm.ts                        # Step-by-Step Virtual Machine (Generator based)
│   │   ├── grid.ts                      # Operasi matematika grid & deteksi tabrakan
│   │   ├── evaluator.ts                 # Evaluator kondisi menang/gagal
│   │   └── types.ts                     # Definisi tipe TypeScript engine
│   ├── levels/                          # Data definisi level terkurasi
│   │   ├── world1.ts                    # Whispering Woods (Sequencing)
│   │   ├── world2.ts                    # Crystal Caverns (Loops)
│   │   └── index.ts                     # Level registry & loader
│   ├── audio/                           # Sound Manager
│   │   ├── soundManager.ts              # Web Audio synthesizer & SFX player
│   │   └── soundEffects.ts              # Definisi frekuensi & waveform procedural
│   ├── supabase/                        # Integrasi database & auth
│   │   ├── client.ts                    # Browser Supabase Client (Anon Key)
│   │   ├── server.ts                    # Server Supabase Client (SSR/Cookies)
│   │   └── middleware.ts                # Auth guard middleware
│   └── storage/                         # Local persistence helper
│       └── guestStorage.ts              # LocalStorage fallback untuk mode tamu
├── hooks/
│   ├── useGameLoop.ts                   # Hook integrasi eksekusi simulasi
│   ├── useSound.ts                      # Hook akses audio
│   └── usePlayerProgress.ts             # Hook sinkronisasi progres pemain
├── types/
│   ├── database.types.ts                # Type mapping dari PostgreSQL schema
│   └── game.types.ts                    # Type sistem permainan
└── docs/                                # Dokumentasi proyek
```

---

## 4. Perancangan Mesin Simulasi Deterministik (Gameplay Engine)

Mekanik utama permainan dijalankan oleh 4 komponen yang saling terhubung:

### 4.1 Parser & Intermediate Representation (IR / AST)
Blok visual yang disusun anak diterjemahkan menjadi representasi pohon sintaks abstrak (AST) yang terstruktur:

```typescript
// Contoh Tipe AST SpellCode
export type CommandType = 
  | 'STEP_FORWARD'
  | 'TURN_LEFT'
  | 'TURN_RIGHT'
  | 'COLLECT_SHARD'
  | 'LIGHT_TORCH';

export interface BaseNode {
  id: string; // ID unik blok untuk visual highlighting
}

export interface ActionNode extends BaseNode {
  type: 'ACTION';
  command: CommandType;
}

export interface RepeatNode extends BaseNode {
  type: 'REPEAT';
  count: number;
  body: AstNode[];
}

export type AstNode = ActionNode | RepeatNode;

export interface SpellProgram {
  version: 1;
  nodes: AstNode[];
}
```

### 4.2 Mesin Virtual Berbasis Generator (Yield Per Step)
Untuk menganimasikan gerakan secara langkah-demi-langkah tanpa memblokir UI thread browser, virtual machine diimplementasikan menggunakan fungsi generator (`function*`):

```typescript
export interface ExecutionStep {
  activeNodeId: string;    // Blok yang sedang dieksekusi (untuk highlight kuning di UI)
  type: CommandType;
  stepNumber: number;
  energyCost: number;
}

export function* createSpellVM(
  program: SpellProgram, 
  maxExecutionSteps: number = 100
): Generator<ExecutionStep, void, unknown> {
  let stepCounter = 0;

  function* executeList(nodes: AstNode[]): Generator<ExecutionStep, void, unknown> {
    for (const node of nodes) {
      if (stepCounter >= maxExecutionSteps) {
        throw new Error('MANA_OVERFLOW: Terlalu banyak langkah, periksa perulanganmu!');
      }

      if (node.type === 'ACTION') {
        stepCounter++;
        yield {
          activeNodeId: node.id,
          type: node.command,
          stepNumber: stepCounter,
          energyCost: 1,
        };
      } else if (node.type === 'REPEAT') {
        const loopCount = Math.min(Math.max(1, node.count), 20); // Batas aman loop
        for (let i = 0; i < loopCount; i++) {
          yield* executeList(node.body);
        }
      }
    }
  }

  yield* executeList(program.nodes);
}
```

*Keunggulan Generator*:
* Memberikan kontrol penuh untuk jeda (*Pause*), langkah satu per satu (*Step Next*), dan perubahan kecepatan animasi (*1x/2x/4x*).
* Memiliki proteksi *Infinite Loop* terpasang (`maxExecutionSteps`) sehingga browser anak tidak akan pernah mengalami freeze atau crash.

### 4.3 State Machine Grid Deterministik
Setiap yield dari VM diterima oleh fungsi murni `applyStep(currentState, step): NextState`:

```typescript
export type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';

export interface GridPosition {
  x: number;
  y: number;
}

export interface PlayerState {
  position: GridPosition;
  direction: Direction;
  manaUsed: number;
  collectedShards: string[]; // ID shard yang berhasil diambil
  litTorches: string[];      // ID lentera yang berhasil dinyalakan
}

export interface LevelGridState {
  width: number;
  height: number;
  obstacles: GridPosition[]; // Posisi batu, pohon, jurang
  shards: { id: string; x: number; y: number }[];
  torches: { id: string; x: number; y: number }[];
  portal: GridPosition;
  player: PlayerState;
  status: 'IDLE' | 'RUNNING' | 'FAILED' | 'VICTORY';
  failureReason?: string;
}
```

Aturan Transisi Murni:
* `STEP_FORWARD`: Menghitung koordinat sasaran berdasarkan arah hadap saat ini. Jika sasaran keluar dari batas grid atau menabrak rintangan, status berubah menjadi `FAILED` dengan pesan ramah anak (*"Terhalang rintangan"*).
* `TURN_LEFT` & `TURN_RIGHT`: Mengubah arah hadap 90 derajat searah/berlawanan jarum jam.
* `COLLECT_SHARD`: Memeriksa apakah koordinat penyihir bertumpuk dengan kristal energi yang belum diambil.

---

## 5. Batas Keamanan Client dan Server (Security Boundaries)

Salah satu prinsip penting dalam game edukasi adalah menjaga integritas data tanpa mengorbankan keramahan pengguna:

```
+------------------------------------+          +------------------------------------+
|            CLIENT SIDE             |          |            SERVER SIDE             |
|                                    |          |                                    |
| 1. Memproses antarmuka & animasi   |          | 1. Memvalidasi payload AST solusi  |
| 2. Memberikan estimasi kemenangan  | -------> | 2. Menjalankan headless VM engine  |
|    langsung ke pengguna            |          | 3. Mengkalkulasi perolehan bintang |
| 3. Mengirimkan susunan kode AST    |          |    dan XP secara independen        |
|    (Bukan angka bintang/XP hasil!) |          | 4. Menuliskan riwayat ke database  |
|                                    |          |    dengan otorisasi RLS Postgres   |
+------------------------------------+          +------------------------------------+
```

### 5.1 Larangan Client Menentukan Skor
* **Aturan Keras**: Klien **tidak boleh** mengirim `{ levelId: '1-1', stars: 3, xpEarned: 150 }` ke server.
* **Protokol Benar**: Klien hanya mengirim `{ levelId: '1-1', solutionPayload: AstProgram }`. Server menjalankan *re-execution engine* yang sama secara headless. Jika simulasi server mencapai kondisi kemenangan, server menghitung jumlah langkah, menentukan bintang (1-3) berdasarkan standar par-steps level, dan menuliskan XP ke akun pemain.
* **Manfaat**: Mencegah manipulasi angka skor melalui inspect element atau tool modifikasi memori browser.

### 5.2 Manajemen Kunci API dan Rahasia (Secret Keys)
* `NEXT_PUBLIC_SUPABASE_URL`: Publik, aman disematkan pada bundle browser.
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Publik, hanya memiliki akses yang dibatasi secara ketat oleh Row Level Security (RLS).
* `SUPABASE_SERVICE_ROLE_KEY`: **Hanya tersimpan di environment server** (Next.js server-side / Edge Functions). Tidak pernah diekspos ke klien.

---

## 6. Manajemen Risiko Teknis dan Mitigasi

### 6.1 Risiko Perangkat Sekolah Low-End (Hardware Constraints)
* **Risiko**: Komputer laboratorium sekolah dasar sering kali memiliki spesifikasi rendah atau browser versi lama tanpa GPU akselerasi bertenaga.
* **Mitigasi**:
  * Menggunakan render grid berbasis SVG / CSS Grid ringan alih-alih engine 3D berat (seperti Three.js).
  * Menjaga ukuran total bundle JavaScript awal di bawah 150 KB gzipped.
  * Membatasi frame rate animasi partikel secara adaptif.

### 6.2 Risiko Aksesibilitas Anak Usia 7-12 Tahun
* **Risiko**: Teks terlalu kecil, instruksi terlalu panjang, atau kontrol sulit dioperasikan oleh anak dengan motorik halus yang masih berkembang.
* **Mitigasi**:
  * Tap target minimum 48px x 48px untuk semua tombol kontrol.
  * Penataan blok dengan opsi satu-klik (*click-to-slot*) sebagai alternatif drag-and-drop jika anak menggunakan mouse/trackpad laptop yang kaku.
  * Navigasi keyboard penuh (`Tab`, `Space`, `Enter`, `Escape`).

### 6.3 Risiko Scope Creep (Pelebaran Ruang Lingkup)
* **Risiko**: Terlalu berambisi membangun visual scripting raksasa seperti Scratch (dengan puluhan blok) di tahap awal, yang berpotensi menunda penyelesaian game inti.
* **Mitigasi**:
  * Membatasi set rune di MVP hanya pada 5 aksi dasar + 1 blok loop terhitung.
  * Menyajikan 15 level terkurasi dengan progres kurva kesulitan yang matang sebelum menambah fitur tingkat lanjut.

---

## 7. Daftar Asumsi Terlabel (Labeled Assumptions)

Berikut adalah asumsi-asumsi perancangan sistem yang belum dapat dipastikan di lapangan dan memerlukan validasi saat implementasi / testing:

1. **[ASSUMPTION-01: Orientasi & Rasio Layar]**:
   * *Asumsi*: Sebagian besar perangkat anak (laptop Chromebook atau tablet) memiliki tinggi layar efektif minimal 600px dalam orientasi lanskap.
   * *Rencana Uji*: Jika tinggi layar di bawah 600px atau orientasi potret, layout akan beralih dari tampilan berdampingan (*split-view*) menjadi mode tab beralih (*Arena Tab* vs *Spell Deck Tab*).
2. **[ASSUMPTION-02: Kebijakan Autoplay Web Audio API]**:
   * *Asumsi*: Browser modern akan menangguhkan (*suspend*) audio context sebelum ada interaksi pengguna (*user gesture*).
   * *Rencana Uji*: Engine audio akan menginisialisasi context saat pengguna pertama kali mengklik tombol "Mulai Petualangan" di landing page atau tombol "Play" di level.
3. **[ASSUMPTION-03: Ketersediaan Layanan Cloud Supabase]**:
   * *Asumsi*: Koneksi internet atau kredensial Supabase mungkin tidak selalu tersedia di lab komputer sekolah saat demonstrasi.
   * *Rencana Uji*: Arsitektur mengadopsi *Offline-First Adapter*. Jika `NEXT_PUBLIC_SUPABASE_URL` belum dikonfigurasi, sistem 100% menggunakan `guestStorage` tanpa memunculkan error unhandled.
4. **[ASSUMPTION-04: Pola Interaksi Sentuh vs Mouse]**:
   * *Asumsi*: Anak usia 7-9 tahun terkadang kesulitan melakukan drag-and-drop presisi di trackpad laptop.
   * *Rencana Uji*: Seluruh blok dapat disusun menggunakan satu klik (*click-to-slot*) selain fungsi drag-and-drop.
5. **[ASSUMPTION-05: Efisiensi Bundle & Zero Third-Party Asset CDN]**:
   * *Asumsi*: Jaringan sekolah lambat saat mengunduh asset eksternal berat.
   * *Rencana Uji*: Semua efek suara disintesis secara procedural via Web Audio API, dan ikon menggunakan SVG inline lokal (Lucide) tanpa CDN pihak ketiga.
