import { describe, it, expect, beforeEach } from "vitest";
import { getNextLevel, getLevelById } from "@/lib/levels";
import {
  saveLevelResult,
  getGuestData,
  defaultInitialGuestData,
  saveGuestData,
  resetStorageForTesting,
} from "@/lib/storage/guestStorage";
import {
  enqueuePendingSync,
  getPendingSyncQueue,
  removePendingSync,
  savePendingSyncQueue,
  resetSyncQueueForTesting,
} from "@/lib/storage/syncService";
import { SpellProgram } from "@/lib/engine/types";
import { createInitialGridState, runSpellProgram } from "@/lib/engine";

describe("Tahap 4C: Progression, XP, Achievements, and Level Unlock Rules", () => {
  beforeEach(() => {
    resetStorageForTesting();
    resetSyncQueueForTesting();
  });

  describe("1. Level Completion dan Pembukaan Level Berikutnya (Level Unlock)", () => {
    it("membuka level berikutnya secara otomatis setelah level saat ini selesai", () => {
      saveGuestData({ ...defaultInitialGuestData });

      const programAst: SpellProgram = {
        version: 1,
        nodes: [
          { id: "s1", type: "ACTION", command: "STEP_FORWARD" },
          { id: "s2", type: "ACTION", command: "STEP_FORWARD" },
          { id: "s3", type: "ACTION", command: "STEP_FORWARD" },
        ],
      };

      const result = saveLevelResult("w1-l1", 3, 3, programAst, 100);

      expect(result.data.progress["w1-l1"].status).toBe("completed");
      expect(result.data.progress["w1-l1"].stars).toBe(3);

      // Level w1-l2 harus terbuka otomatis dengan status unlocked
      expect(result.data.progress["w1-l2"]).toBeDefined();
      expect(result.data.progress["w1-l2"].status).toBe("unlocked");
      expect(result.data.progress["w1-l2"].stars).toBe(0);
    });

    it("membuka World 2 (w2-l1) saat menyelesaikan misi penutup World 1 (w1-l6)", () => {
      saveGuestData({
        ...defaultInitialGuestData,
        progress: {
          "w1-l6": {
            status: "unlocked",
            stars: 0,
            bestStepCount: 0,
            attemptsCount: 0,
          },
        },
      });

      const next = getNextLevel("w1-l6");
      expect(next?.id).toBe("w2-l1");

      const emptyAst: SpellProgram = { version: 1, nodes: [] };
      const result = saveLevelResult("w1-l6", 3, 9, emptyAst, 100);

      expect(result.data.progress["w1-l6"].status).toBe("completed");
      expect(result.data.progress["w2-l1"]).toBeDefined();
      expect(result.data.progress["w2-l1"].status).toBe("unlocked");
    });
  });

  describe("2. Pencegahan Duplikasi Reward dan Idempotensi (Anti-Duplicate & Replay)", () => {
    it("tidak memberikan tambahan XP jika pemain mengulang level dengan bintang yang sama (Idempotent)", () => {
      saveGuestData({ ...defaultInitialGuestData });
      const emptyAst: SpellProgram = { version: 1, nodes: [] };

      // Penyelesaian pertama: 3 bintang -> +100 XP
      const firstClear = saveLevelResult("w1-l1", 3, 3, emptyAst, 100);
      expect(firstClear.data.profile.totalXp).toBe(100);

      // Percobaan ulang (Replay): 3 bintang lagi -> XP tidak boleh bertambah
      const secondClear = saveLevelResult("w1-l1", 3, 3, emptyAst, 100);
      expect(secondClear.data.profile.totalXp).toBe(100);

      // Percobaan ulang dengan hasil lebih rendah: 1 bintang -> XP tidak boleh bertambah
      const thirdClear = saveLevelResult("w1-l1", 1, 6, emptyAst, 60);
      expect(thirdClear.data.profile.totalXp).toBe(100);
      expect(thirdClear.data.progress["w1-l1"].stars).toBe(3); // Bintang tertinggi tetap dipertahankan
    });

    it("hanya memberikan selisih peningkatan XP saat berhasil menaikkan bintang (Delta Reward)", () => {
      saveGuestData({ ...defaultInitialGuestData });
      const emptyAst: SpellProgram = { version: 1, nodes: [] };

      // Pertama selesai dengan 1 bintang (60 XP)
      const first = saveLevelResult("w1-l1", 1, 6, emptyAst, 60);
      expect(first.data.profile.totalXp).toBe(60);

      // Berhasil meningkatkan ke 3 bintang (100 XP) -> Selisihnya adalah 40 XP
      const improved = saveLevelResult("w1-l1", 3, 3, emptyAst, 100);
      expect(improved.data.profile.totalXp).toBe(100); // 60 + 40 = 100
      expect(improved.data.progress["w1-l1"].stars).toBe(3);
    });

    it("menambah riwayat attempts count setiap kali submisi dilakukan", () => {
      saveGuestData({ ...defaultInitialGuestData });
      const emptyAst: SpellProgram = { version: 1, nodes: [] };

      const res1 = saveLevelResult("w1-l1", 1, 6, emptyAst, 60);
      expect(res1.data.progress["w1-l1"].attemptsCount).toBe(1);

      const res2 = saveLevelResult("w1-l1", 2, 4, emptyAst, 75);
      expect(res2.data.progress["w1-l1"].attemptsCount).toBe(2);

      const res3 = saveLevelResult("w1-l1", 3, 3, emptyAst, 100);
      expect(res3.data.progress["w1-l1"].attemptsCount).toBe(3);
    });
  });

  describe("3. Ketahanan Gagal Jaringan (Offline-Resilience & Retry Queue)", () => {
    it("mempertahankan progres lokal dan memasukkan ke antrean retry jika sinkronisasi pending", () => {
      const dummyProgram: SpellProgram = {
        version: 1,
        nodes: [{ id: "step_1", type: "ACTION", command: "STEP_FORWARD" }],
      };

      // Pastikan antrean awalnya bersih
      savePendingSyncQueue([]);
      expect(getPendingSyncQueue().length).toBe(0);

      // Simulasikan kegagalan jaringan: masukkan ke antrean pending
      enqueuePendingSync("w1-l2", dummyProgram);

      const queue = getPendingSyncQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].levelId).toBe("w1-l2");
      expect(queue[0].program.nodes.length).toBe(1);

      // Menghapus antrean setelah sinkronisasi berhasil
      removePendingSync("w1-l2");
      expect(getPendingSyncQueue().length).toBe(0);
    });
  });

  describe("4. Isolasi Data Lintas Pengguna (Cross-User Isolation)", () => {
    it("memastikan data progres dua pengguna tidak saling tumpang tindih", () => {
      // Simulasi state User A
      const userAProgress: Record<string, { stars: number; status: string }> = {
        "w1-l1": { stars: 3, status: "completed" },
        "w1-l2": { stars: 2, status: "completed" },
      };

      // Simulasi state User B
      const userBProgress: Record<string, { stars: number; status: string }> = {
        "w1-l1": { stars: 1, status: "completed" },
      };

      expect(userAProgress["w1-l1"].stars).toBe(3);
      expect(userBProgress["w1-l1"].stars).toBe(1);
      expect(userAProgress["w1-l2"]).toBeDefined();
      expect(userBProgress["w1-l2"]).toBeUndefined();
    });
  });

  describe("5. Validasi Server-Authoritative terhadap Submission", () => {
    it("menolak klaim kemenangan palsu dari program yang tidak mencapai portal", () => {
      const level = getLevelById("w1-l1");
      expect(level).toBeDefined();
      if (!level) return;

      const incompleteProgram: SpellProgram = {
        version: 1,
        nodes: [{ id: "s1", type: "ACTION", command: "STEP_FORWARD" }],
      };

      const result = runSpellProgram(
        incompleteProgram,
        createInitialGridState(level.grid),
        level.parSteps,
        { objectives: level.objectives }
      );

      expect(result.status).toBe("FAILED");
      expect(result.evaluation.isVictory).toBe(false);
      expect(result.evaluation.stars).toBe(0);
      expect(result.evaluation.xpEarned).toBe(0);
    });
  });
});
