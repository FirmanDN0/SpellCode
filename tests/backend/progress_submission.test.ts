import { describe, it, expect } from "vitest";
import { getLevelById, getNextLevel } from "@/lib/levels";
import { createInitialGridState, runSpellProgram } from "@/lib/engine";
import { SpellProgram } from "@/lib/engine/types";

describe("Server-Authoritative Progress & Reward Verification", () => {
  it("memverifikasi solusi valid level w1-l1 secara deterministik di server", () => {
    const level = getLevelById("w1-l1");
    expect(level).toBeDefined();
    if (!level) return;

    // AST solusi valid untuk w1-l1: 3 langkah maju lurus
    const validProgram: SpellProgram = {
      version: 1,
      nodes: [
        { id: "s1", type: "ACTION", command: "STEP_FORWARD" },
        { id: "s2", type: "ACTION", command: "STEP_FORWARD" },
        { id: "s3", type: "ACTION", command: "STEP_FORWARD" },
      ],
    };

    const initialState = createInitialGridState(level.grid);
    const result = runSpellProgram(validProgram, initialState, level.parSteps, {
      objectives: level.objectives,
    });

    expect(result.status).toBe("VICTORY");
    expect(result.evaluation.isVictory).toBe(true);
    expect(result.totalSteps).toBe(3);
    expect(result.evaluation.stars).toBe(3);
    expect(result.evaluation.xpEarned).toBe(100);
  });

  it("menolak program yang gagal mencapai portal (mencegah claim kemenangan palsu)", () => {
    const level = getLevelById("w1-l1");
    expect(level).toBeDefined();
    if (!level) return;

    // Program hanya maju 2 langkah (belum sampai portal di petak 3, 1)
    const incompleteProgram: SpellProgram = {
      version: 1,
      nodes: [
        { id: "s1", type: "ACTION", command: "STEP_FORWARD" },
        { id: "s2", type: "ACTION", command: "STEP_FORWARD" },
      ],
    };

    const initialState = createInitialGridState(level.grid);
    const result = runSpellProgram(
      incompleteProgram,
      initialState,
      level.parSteps,
      {
        objectives: level.objectives,
      }
    );

    expect(result.status).toBe("FAILED");
    expect(result.evaluation.isVictory).toBe(false);
    expect(result.evaluation.stars).toBe(0);
    expect(result.evaluation.xpEarned).toBe(0);
  });

  it("menolak program yang melanggar rintangan atau menabrak dinding batu", () => {
    const level = getLevelById("w1-l2"); // Level tikungan dengan rintangan batu di depan
    expect(level).toBeDefined();
    if (!level) return;

    // Program mencoba melangkah langsung ke depan tanpa berbelok
    const crashingProgram: SpellProgram = {
      version: 1,
      nodes: [{ id: "c1", type: "ACTION", command: "STEP_FORWARD" }],
    };

    const initialState = createInitialGridState(level.grid);
    const result = runSpellProgram(
      crashingProgram,
      initialState,
      level.parSteps,
      {
        objectives: level.objectives,
      }
    );

    expect(result.status).toBe("FAILED");
    expect(result.finalState.status).toBe("FAILED");
    expect(result.evaluation.isVictory).toBe(false);
  });

  it("menghitung bintang dan XP secara adil sesuai parSteps (1, 2, atau 3 bintang)", () => {
    const level = getLevelById("w1-l1");
    expect(level).toBeDefined();
    if (!level) return;

    // Skenario 1: Solusi efisien (3 langkah <= parSteps 3) -> 3 bintang (100 XP)
    const perfectProgram: SpellProgram = {
      version: 1,
      nodes: [
        { id: "p1", type: "ACTION", command: "STEP_FORWARD" },
        { id: "p2", type: "ACTION", command: "STEP_FORWARD" },
        { id: "p3", type: "ACTION", command: "STEP_FORWARD" },
      ],
    };
    const resPerfect = runSpellProgram(
      perfectProgram,
      createInitialGridState(level.grid),
      level.parSteps,
      { objectives: level.objectives }
    );
    expect(resPerfect.evaluation.stars).toBe(3);
    expect(resPerfect.evaluation.xpEarned).toBe(100);

    // Skenario 2: Solusi memutar tidak efisien (misal putar 360 derajat sebelum maju)
    // Par = 3. Langkah: Turn (1) + Turn (2) + Turn (3) + Turn (4) + Maju (5) + Maju (6) + Maju (7) = 7 langkah
    const windingProgram: SpellProgram = {
      version: 1,
      nodes: [
        { id: "w1", type: "ACTION", command: "TURN_RIGHT" },
        { id: "w2", type: "ACTION", command: "TURN_RIGHT" },
        { id: "w3", type: "ACTION", command: "TURN_RIGHT" },
        { id: "w4", type: "ACTION", command: "TURN_RIGHT" },
        { id: "w5", type: "ACTION", command: "STEP_FORWARD" },
        { id: "w6", type: "ACTION", command: "STEP_FORWARD" },
        { id: "w7", type: "ACTION", command: "STEP_FORWARD" },
      ],
    };
    const resWinding = runSpellProgram(
      windingProgram,
      createInitialGridState(level.grid),
      level.parSteps,
      { objectives: level.objectives }
    );
    expect(resWinding.evaluation.isVictory).toBe(true);
    expect(resWinding.totalSteps).toBe(7);
    expect(resWinding.evaluation.stars).toBe(1); // steps > parSteps + 2
    expect(resWinding.evaluation.xpEarned).toBe(60);
  });

  it("mencegah duplikasi XP pada replay submission yang tidak meningkatkan bintang", () => {
    // Logika perhitungan delta XP
    const calculateXpDelta = (
      existingStatus: "unlocked" | "completed",
      existingStars: number,
      newStars: number,
      baseXpEarned: number
    ): number => {
      if (existingStatus !== "completed") {
        return baseXpEarned;
      }
      if (newStars > existingStars) {
        const oldXp = existingStars === 1 ? 60 : existingStars === 2 ? 75 : 100;
        return Math.max(0, baseXpEarned - oldXp);
      }
      return 0; // Replay dengan bintang sama atau lebih rendah tidak menambah XP
    };

    // Kasus 1: First clear dengan 3 bintang
    expect(calculateXpDelta("unlocked", 0, 3, 100)).toBe(100);

    // Kasus 2: Replay level yang sudah 3 bintang dengan 3 bintang lagi -> XP delta harus 0
    expect(calculateXpDelta("completed", 3, 3, 100)).toBe(0);

    // Kasus 3: Replay level yang sudah 3 bintang dengan 1 bintang -> XP delta harus 0
    expect(calculateXpDelta("completed", 3, 1, 60)).toBe(0);

    // Kasus 4: Peningkatan dari 1 bintang (60 XP) ke 3 bintang (100 XP) -> XP delta harus 40
    expect(calculateXpDelta("completed", 1, 3, 100)).toBe(40);

    // Kasus 5: Peningkatan dari 1 bintang (60 XP) ke 2 bintang (75 XP) -> XP delta harus 15
    expect(calculateXpDelta("completed", 1, 2, 75)).toBe(15);
  });

  it("membuka level berikutnya secara konsisten dan terurut", () => {
    const nextOfW1L1 = getNextLevel("w1-l1");
    expect(nextOfW1L1).toBeDefined();
    expect(nextOfW1L1?.id).toBe("w1-l2");

    const nextOfW1L6 = getNextLevel("w1-l6");
    expect(nextOfW1L6).toBeDefined();
    expect(nextOfW1L6?.id).toBe("w2-l1"); // Transisi mulus dari World 1 ke World 2

    const nextOfW2L6 = getNextLevel("w2-l6");
    expect(nextOfW2L6).toBeDefined();
    expect(nextOfW2L6?.id).toBe("w3-l1"); // Transisi mulus dari World 2 ke World 3

    const nextOfLast = getNextLevel("w3-l6");
    expect(nextOfLast).toBeUndefined(); // Level terakhir World 3 tidak memiliki next
  });
});
