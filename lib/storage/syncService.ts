import { SpellProgram } from "../engine/types";
import { saveLevelResult, GuestData } from "./guestStorage";

export interface SyncProgressResult {
  success: boolean;
  verified: boolean;
  isGuest: boolean;
  stars: number;
  stepsTaken: number;
  xpEarned: number;
  totalXp?: number;
  wizardRank?: string;
  isNewRank?: boolean;
  unlockedLevelId?: string | null;
  achievementsUnlocked?: string[];
  error?: string;
}

const PENDING_SYNC_KEY = "spellcode_pending_sync_v1";

export interface PendingSyncItem {
  id: string;
  levelId: string;
  program: SpellProgram;
  timestamp: number;
}

let memorySyncQueue: Record<string, string> = {};

export function resetSyncQueueForTesting(): void {
  memorySyncQueue = {};
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(PENDING_SYNC_KEY);
    } catch {}
  }
}

function getSyncItem(key: string): string | null {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(key);
    } catch {
      return memorySyncQueue[key] || null;
    }
  }
  return memorySyncQueue[key] || null;
}

function setSyncItem(key: string, value: string): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, value);
      return;
    } catch {}
  }
  memorySyncQueue[key] = value;
}

export function getPendingSyncQueue(): PendingSyncItem[] {
  try {
    const raw = getSyncItem(PENDING_SYNC_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePendingSyncQueue(queue: PendingSyncItem[]): void {
  try {
    setSyncItem(PENDING_SYNC_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error("Gagal menyimpan antrean pending sync:", e);
  }
}

export function enqueuePendingSync(levelId: string, program: SpellProgram): void {
  const queue = getPendingSyncQueue();
  // Hindari duplikasi levelId dalam antrean
  const filtered = queue.filter((item) => item.levelId !== levelId);
  filtered.push({
    id: `${levelId}_${Date.now()}`,
    levelId,
    program,
    timestamp: Date.now(),
  });
  savePendingSyncQueue(filtered);
}

export function removePendingSync(levelId: string): void {
  const queue = getPendingSyncQueue();
  const updated = queue.filter((item) => item.levelId !== levelId);
  savePendingSyncQueue(updated);
}

/**
 * Menyimpan progres level secara tangguh:
 * 1. Simpan langsung ke LocalStorage (Optimistic dan Offline Safe).
 * 2. Kirim validasi server-authoritative ke Supabase API.
 * 3. Jika gagal jaringan, masukkan ke antrean pending sync tanpa menghapus data lokal.
 */
export async function submitProgressWithRetry(
  levelId: string,
  program: SpellProgram,
  evaluation: { stars: number; xpEarned: number },
  stepsTaken: number,
  idempotencyKey?: string
): Promise<{
  saveRes: { data: GuestData; isNewRank: boolean; newRank: string };
  serverResult: SyncProgressResult | null;
  serverError: string | null;
}> {
  // 1. Simpan ke local storage terlebih dahulu (Pemain tidak pernah kehilangan progres jika offline)
  const saveRes = saveLevelResult(
    levelId,
    evaluation.stars,
    stepsTaken,
    program,
    evaluation.xpEarned
  );

  const key = idempotencyKey || `${levelId}_${stepsTaken}_${Date.now()}`;

  // 2. Kirim ke endpoint server
  try {
    const res = await fetch("/api/progress/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        levelId,
        program,
        idempotencyKey: key,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const errorMsg = errJson.error || `Server HTTP Error: ${res.status}`;
      enqueuePendingSync(levelId, program);
      return { saveRes, serverResult: null, serverError: errorMsg };
    }

    const data: SyncProgressResult = await res.json();
    removePendingSync(levelId);
    return { saveRes, serverResult: data, serverError: null };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Koneksi jaringan terputus.";
    enqueuePendingSync(levelId, program);
    return { saveRes, serverResult: null, serverError: errorMsg };
  }
}

/**
 * Mencoba mengirim kembali seluruh antrean sinkronisasi yang tertunda (misal saat internet kembali online).
 */
export async function flushPendingSyncQueue(): Promise<{
  syncedCount: number;
  failedCount: number;
}> {
  const queue = getPendingSyncQueue();
  if (queue.length === 0) return { syncedCount: 0, failedCount: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: PendingSyncItem[] = [];

  for (const item of queue) {
    try {
      const res = await fetch("/api/progress/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelId: item.levelId,
          program: item.program,
          idempotencyKey: item.id,
        }),
      });
      if (res.ok) {
        synced++;
      } else {
        failed++;
        remaining.push(item);
      }
    } catch {
      failed++;
      remaining.push(item);
    }
  }

  savePendingSyncQueue(remaining);
  return { syncedCount: synced, failedCount: failed };
}
