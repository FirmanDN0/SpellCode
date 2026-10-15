# DOKUMENTASI ARSITEKTUR SPELL ENGINE & CORE GAMEPLAY

Dokumen ini mendokumentasikan implementasi SpellCode Execution Engine: mesin eksekusi logika permainan berbasis AST (Abstract Syntax Tree) terstruktur, deterministik, aman tanpa `eval()`, terisolasi dari antarmuka UI, dan teruji penuh melalui Vitest.

---

## 1. Prinsip Utama & Keamanan

1. **Aman (No Eval / Dynamic Execution)**
   Engine tidak pernah menggunakan `eval()`, `new Function()`, atau mengeksekusi string JavaScript arbitrer. Semua instruksi pemain direpresentasikan sebagai AST node bertipe murni (`ActionNode`, `RepeatNode`, `IfNode`).

2. **Deterministik & Replayable**
   Fungsi eksekusi bersifat murni (pure function) terhadap state. Dengan konfigurasi level dan program yang sama, urutan langkah (`ExecutionStep`) dan rekaman jejak peristiwa (`ExecutionEvent[]`) dijamin 100% identik pada setiap eksekusi.

3. **Pemisahan Logika & UI (Decoupled)**
   State arena (`LevelGridState`) dan mesin eksekusi (`createSpellVM`, `runSpellProgram`) berada sepenuhnya di folder `lib/engine/`. Komponen React hanya berperan sebagai consumer yang menampilkan animasi sesuai event trace yang dihasilkan engine.

4. **Batas Keamanan & Pencegahan Infinite Loop**
   * Batas kedalaman bersarang (max depth) maksimal 4 tingkat.
   * Batas total balok program maksimal 60 balok.
   * Batas langkah eksekusi VM (max steps) default 150 langkah sebelum memicu proteksi `MANA_OVERFLOW`.
   * Perulangan (`REPEAT`) dibatasi dalam rentang aman 1 sampai 20 iterasi.

5. **Pesan Kesalahan Ramah Anak (Kid-Friendly Scaffolding)**
   Setiap kegagalan (menabrak rintangan, jurang, kehabisan energi, sasaran belum selesai) dipetakan ke kode error terstruktur dan narasi pendamping (Pyx the Familiar) yang memotivasi dan membimbing anak memperbaiki mantranya.

---

## 2. Struktur Modul Engine

```
lib/engine/
├── index.ts        # Entry point re-export seluruh interface & utilitas engine
├── types.ts        # Definisi tipe TypeScript: AST, State, Event, Evaluasi, Error
├── ast.ts          # Utilitas pembuatan & inspeksi node AST (createNode, depth, count)
├── validator.ts    # Validasi program sebelum eksekusi (rune yang diizinkan, batas, struktur)
├── grid.ts         # Pure functions mutasi state arena (applyStep, orientasi, batas, tabrakan)
├── condition.ts    # Evaluator kondisi percabangan logika (pure function)
├── vm.ts           # Generator VM (createSpellVM) untuk eksekusi langkah per langkah (Step/Run)
├── runner.ts       # Runner deterministik lengkap (runSpellProgram) dengan trace event
├── evaluator.ts    # Evaluator keberhasilan objektif level & sistem bintang (Par Steps)
└── errors.ts       # Kamus pesan error dan penjelas edukatif ramah anak
```

---

## 3. Definisi Tipe dan Kontrak Antarmuka

### 3.1 AST & Program
```typescript
export type CommandType =
  | "STEP_FORWARD"
  | "TURN_LEFT"
  | "TURN_RIGHT"
  | "LIGHT_TORCH"
  | "COLLECT_SHARD"
  | "CAST_SPELL";

export type ConditionType =
  | "IS_OBSTACLE_AHEAD"
  | "IS_CLEAR_AHEAD"
  | "IS_SHARD_PRESENT"
  | "IS_TORCH_PRESENT"
  | "IS_PORTAL_PRESENT";

export interface ActionNode {
  id: string;
  type: "ACTION";
  command: CommandType;
}

export interface RepeatNode {
  id: string;
  type: "REPEAT";
  count: number;
  body: AstNode[];
}

export interface IfNode {
  id: string;
  type: "IF";
  condition: ConditionType;
  thenBody: AstNode[];
  elseBody?: AstNode[];
}

export type AstNode = ActionNode | RepeatNode | IfNode;

export interface SpellProgram {
  version: 1;
  nodes: AstNode[];
}
```

### 3.2 State Arena & Pemain
```typescript
export interface LevelGridState {
  width: number;
  height: number;
  obstacles: GridPosition[];
  shards: ShardEntity[];
  torches: TorchEntity[];
  portal: GridPosition;
  player: PlayerState;
  status: "IDLE" | "RUNNING" | "VICTORY" | "FAILED";
  failureReason?: string;
  misfireNodeId?: string;
  errorDetails?: EngineErrorDetails;
}
```

### 3.3 Event Trace & Hasil Eksekusi
```typescript
export interface ExecutionEvent {
  type: "STEP_START" | "STEP_COMPLETE" | "VICTORY" | "ERROR";
  stepNumber: number;
  nodeId?: string;
  command?: CommandType;
  playerState?: PlayerState;
  message?: string;
}

export interface ExecutionResult {
  status: "VICTORY" | "FAILED";
  totalSteps: number;
  events: ExecutionEvent[];
  finalState: LevelGridState;
  evaluation: EvaluationResult;
  errorDetails?: EngineErrorDetails;
}
```

---

## 4. Alur Kerja Eksekusi (Lifecycle)

1. **Penyusunan (Compose)**: Pemain merangkai balok rune pada Meja Mantra (`SpellDeck`).
2. **Validasi (Validate)**: `validateProgram()` memverifikasi kapasitas, kedalaman, dan rune yang diizinkan sebelum mantra dirapalkan.
3. **Eksekusi Generator (Step / Run)**:
   * **Tombol Step**: Memanggil `vm.next()` untuk menjalankan satu mikro-langkah dan menyorot node yang aktif.
   * **Tombol Run**: Menjalankan `runSpellProgram()` menghasilkan `ExecutionResult` dengan riwayat trace event lengkap.
4. **Mutasi State Murni**: Setiap langkah diproses oleh `applyStep(currentState, step)` yang mengembalikan objek state baru secara immutable.
5. **Evaluasi Objektif**: `evaluateLevelState()` mengevaluasi apakah seluruh lentera menyala, kristal terkumpul, dan penyihir tiba di gerbang portal, lalu menghitung bintang (1, 2, atau 3) berdasarkan Par Steps level.
6. **Reset / Clear**: Mengembalikan arena ke konfigurasi awal (`createInitialGridState`) tanpa efek samping atau memory leak.

---

## 5. Laporan Pengujian Otomatis (Vitest)

Pengujian unit diimplementasikan menggunakan Vitest dengan konfigurasi native ESM di `vitest.config.mjs`.

### Hasil Eksekusi Aktual

```
 RUN  v5.0.4 C:/XII SIJA 2/lomab-vibecoding

 ✓ tests/engine/boundary_and_obstacles.test.ts (6 tests)
 ✓ tests/engine/objectives.test.ts (6 tests)
 ✓ tests/engine/instructions.test.ts (10 tests)
 ✓ tests/engine/loops_and_limits.test.ts (5 tests)
 ✓ tests/engine/conditions.test.ts (7 tests)
 ✓ tests/engine/execution_order.test.ts (2 tests)
 ✓ tests/engine/step_run_reset.test.ts (4 tests)
 ✓ tests/engine/validation_and_replay.test.ts (6 tests)
 ✓ tests/engine/stage3a_data_model.test.ts (19 tests)
 ✓ tests/engine/controller.test.ts (11 tests)
 ✓ tests/engine/stage3c_debug_vision.test.ts (10 tests)
 ✓ tests/engine/stage3d_campaign_levels.test.ts (25 tests)

 Test Files  12 passed (12)
      Tests  111 passed (111)
   Duration  2.03s
```

### Rincian Cakupan Unit Test

1. **`instructions.test.ts` (10 tests)**:
   * Perhitungan posisi maju 4 arah mata angin (UP, RIGHT, DOWN, LEFT).
   * Rotasi arah hadap 90 derajat kiri (counter-clockwise) dan kanan (clockwise).
   * Imutabilitas state saat `applyStep`.
   * Interaksi ambil kristal (`COLLECT_SHARD`) di petak target.
   * Interaksi nyalakan lentera (`LIGHT_TORCH`) di petak target.
   * Proteksi tidak menggandakan kristal/lentera yang sudah aktif.
   * Eksekusi mantra umum (`CAST_SPELL`) dengan pemakaian mana.

2. **`boundary_and_obstacles.test.ts` (6 tests)**:
   * Deteksi batas koordinat arena secara akurat.
   * Deteksi koordinat rintangan batuan/semak.
   * Penanganan benturan tepi batas pulau dengan kode `WALL_COLLISION` dan posisi aman.
   * Penanganan benturan rintangan dengan kode `OBSTACLE_HIT`.
   * Penghentian langkah lanjutan saat status telah `FAILED`.

3. **`execution_order.test.ts` (2 tests)**:
   * Eksekusi urutan sekuensial instruksi majemuk.
   * Verifikasi kesesuaian pasangan trace event `STEP_START` dan `STEP_COMPLETE`.
   * Penghentian seketika tanpa mengeksekusi instruksi berikutnya saat terjadi kegagalan.

4. **`step_run_reset.test.ts` (4 tests)**:
   * Eksekusi modular langkah demi langkah melalui generator `createSpellVM`.
   * Ekuivalensi hasil akhir antara mode Step dan Run.
   * Perilaku Reset yang mengembalikan arena ke kondisi bersih 100%.
   * Deteksi dan penolakan meja mantra kosong saat dibersihkan (`Clear`).

5. **`loops_and_limits.test.ts` (5 tests)**:
   * Eksekusi perulangan tunggal (`REPEAT`) sejumlah count yang ditentukan.
   * Eksekusi perulangan bersarang (`nested REPEAT`) dalam batas kedalaman aman.
   * Proteksi infinite loop via `maxSteps` memicu error edukatif `MANA_OVERFLOW`.
   * Validasi batas count perulangan 1 sampai 20.
   * Peringatan edukatif bila blok repeat kosong.

6. **`conditions.test.ts` (7 tests)**:
   * Evaluasi predikat `IS_OBSTACLE_AHEAD` pada rintangan dan tepi arena.
   * Evaluasi predikat `IS_CLEAR_AHEAD` sebagai invers rintangan.
   * Evaluasi predikat `IS_SHARD_PRESENT` dan `IS_TORCH_PRESENT` pada petak pemain.
   * Evaluasi predikat `IS_PORTAL_PRESENT`.
   * Eksekusi cabang THEN saat kondisi bernilai benar.
   * Eksekusi cabang ELSE saat kondisi bernilai salah.
   * Navigasi dinamis loop bersyarat mengitari rintangan.

7. **`objectives.test.ts` (6 tests)**:
   * Evaluasi kemenangan 3 bintang saat selesai dalam batas par steps.
   * Evaluasi kemenangan 2 bintang saat melebihi par hingga 2 langkah.
   * Evaluasi kemenangan 1 bintang saat melebihi par lebih dari 2 langkah.
   * Kegagalan objektif bila tiba di portal tanpa kristal lengkap.
   * Kegagalan objektif bila tiba di portal tanpa lentera menyala.
   * Kegagalan objektif bila program selesai sebelum tiba di portal.

8. **`validation_and_replay.test.ts` (6 tests)**:
   * Perhitungan jumlah total node dan tingkat kedalaman AST.
   * Penolakan rune yang dilarang pada konfigurasi level tertentu.
   * Penolakan fitur REPEAT / IF bila level belum mengizinkannya.
   * Penolakan program yang melebihi batas maksimal balok mantra.
   * Penolakan struktur bersarang yang melebihi batas maksimal nesting depth.
   * Jaminan deterministic replay: 5 kali eksekusi menghasilkan event trace dan state yang 100% identik.

9. **`stage3a_data_model.test.ts` (19 tests)**:
   * Pengujian komprehensif data model arena, karakter, portal, shard, torch, dan objek aksi.
   * Pemodelan error terstruktur, batas pergerakan, dan konsistensi status.

10. **`controller.test.ts` (11 tests)**:
    * Lifecycle controller: IDLE, RUNNING, COMPLETED, FAILED.
    * Mode Step deterministik dengan pembaruan snapshot real-time.
    * Eksekusi asinkronus Run dengan timer delay bertahap.
    * Pencegahan eksekusi ganda paralel (`DOUBLE_RUN_PREVENTED`).
    * Penanganan mutasi program di tengah jalan (safe abort & auto-reset).
    * Mekanisme langganan observer (subscribe / notify) untuk decoupling React.

11. **`stage3c_debug_vision.test.ts` (10 tests)**:
    * Pelacakan perulangan terbatas (Bounded Loops) dan emisi event `LOOP_ITERATION` (`iteration`, `totalIterations`).
    * Evaluasi percabangan kondisional (IF/ELSE) dan emisi event `CONDITION_EVALUATED` (`condition`, `conditionResult`, `branchChosen`).
    * Penegakan batas kedalaman blok bersarang (maksimal 4 tingkat).
    * Debug Vision: penandaan instruksi penyebab kegagalan (`OBSTACLE_HIT`, `nodeId`, `stepNumber`).
    * Evaluasi objektif yang jujur ketika program selesai tanpa mencapai kemenangan (`isVictory: false`, rincian objektif belum terpenuhi).
    * Trace snapshot pada `ExecutionController` untuk kebutuhan debugging visual UI.

12. **`stage3d_campaign_levels.test.ts` (25 tests)**:
    * Verifikasi keberadaan dan integritas seluruh 12 level MVP.
    * Bukti solusi valid untuk masing-masing 12 level yang menghasilkan status `VICTORY`.
    * Bukti kegagalan untuk program salah, incomplete objectives, tabrakan rintangan, dan salah parameter.
    * Pembuktian fitur debugging dengan perbaikan initial buggy program.

---

## 6. Fitur Debug Vision & Panduan Pemain

Debug Vision dirancang khusus agar anak-anak memahami penyebab kesalahan program mereka tanpa merasa frustrasi:

1. **Sorot Blok Eksekusi Aktif**:
   Balok instruksi yang sedang dijalankan pada Meja Mantra disorot secara dinamis dengan ring emas atau cyan terang, baik balok tingkat atas maupun sub-aksi di dalam `REPEAT` atau `IF`.
2. **Penandaan Misfire Presisi**:
   Jika terjadi tabrakan atau kesalahan eksekusi, balok penyebab kesalahan (`misfireNodeId`) berkedip merah terang dan nomor langkah (`stepNumber`) dicatat.
3. **Penjelasan Kesalahan Sederhana (Pyx Companion)**:
   Kesalahan dijelaskan dengan analogi fantasi ramah anak (contoh: "Terhalang semak berduri atau batu besar!") bukan pesan error teknis JavaScript mentah.
4. **Hint Bertahap (Progressive Hint Disclosure)**:
   Tombol "Butuh Petunjuk?" memungkinkan anak membuka petunjuk bertahap dari Pyx si Kucing Api tanpa secara otomatis merusak tantangan eksplorasi.
5. **Aksi Cepat Pengulangan & Penelusuran**:
   Saat program gagal, tombol "Ulangi Misi (Reset)" dan "Telusuri Langkah (Step)" langsung tersedia di panel panduan Pyx agar anak dapat segera menganalisis mantranya langkah demi langkah.

---

## 7. Desain Kampanye Pedagogis MVP (Tahap 3D)

Kumpulan 12 level MVP dirancang dengan progresi belajar bertingkat tanpa duplikasi mekanik:

| ID | Realm / World | Judul Level | Konsep Pedagogis | Par Steps | Rune Tersedia | Objektif Utama |
|---|---|---|---|---|---|---|
| `w1-l1` | Whispering Woods | Langkah Pertama Magang | Sequencing | 3 | Maju | Portal |
| `w1-l2` | Whispering Woods | Belokan di Tikungan Peri | Movement & Direction | 3 | Maju, Putar Kanan | Portal |
| `w1-l3` | Whispering Woods | Cahaya Lentera & Kristal Mana | Object Activation | 6 | Maju, Lentera, Kristal | Lentera, Kristal, Portal |
| `w1-l4` | Whispering Woods | Menembus Semak Berduri | Movement & Direction | 7 | Maju, Putar Kiri, Putar Kanan | Rute Memutar, Portal |
| `w1-l5` | Whispering Woods | Mantra Magang yang Tersesat | Debugging | 4 | Maju, Putar Kiri, Putar Kanan | Diagnosis & Perbaikan Tabrakan |
| `w1-l6` | Whispering Woods | Ujian Harmoni Dua Lentera | Sequencing Milestone | 9 | Maju, Putar, Lentera | 2 Lentera, Portal |
| `w2-l1` | Crystal Caverns | Lorong Kristal Berulang | Loops | 1 | Maju, Ulangi | Perulangan 5 Langkah |
| `w2-l2` | Crystal Caverns | Tangga Kristal Berundak | Loops | 1 | Maju, Putar, Ulangi | Perulangan Pola Undakan 3x |
| `w2-l3` | Crystal Caverns | Sensor Kabut Kristal | Conditionals | 2 | Maju, Putar, Jika | Evaluasi Predikat Rintangan |
| `w2-l4` | Crystal Caverns | Penjelajah Labirin Otomatis | Conditionals & Loops | 1 | Maju, Putar, Ulangi, Jika | Loop Bersyarat Dinamis |
| `w2-l5` | Crystal Caverns | Misfire di Jurang Kristal | Debugging | 1 | Maju, Ulangi | Perbaikan Parameter Off-by-one |
| `w2-l6` | Crystal Caverns | Mahkota Kristal Agung | Master Integration | 8 | Semua Rune + Loop + Jika | Altar Ageng: 2 Lentera, Kristal |


