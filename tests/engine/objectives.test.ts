import { describe, it, expect } from "vitest";
import { evaluateLevelState } from "@/lib/engine/evaluator";
import { createInitialGridState } from "@/lib/engine/grid";
import { LevelGridState } from "@/lib/engine/types";

describe("Engine: Level Objectives and Par Steps Evaluation", () => {
  const baseConfig = {
    width: 5,
    height: 5,
    obstacles: [],
    shards: [{ id: "shard-1", x: 1, y: 1 }],
    torches: [{ id: "torch-1", x: 2, y: 2 }],
    portal: { x: 4, y: 4 },
    playerStart: { x: 0, y: 0, direction: "RIGHT" as const },
  };

  it("evaluates to VICTORY with 3 stars when all objectives met within par steps", () => {
    const victoryState: LevelGridState = {
      ...createInitialGridState(baseConfig),
      player: {
        position: { x: 4, y: 4 }, // At portal
        direction: "RIGHT",
        manaUsed: 8,
        collectedShards: ["shard-1"], // All shards collected
        litTorches: ["torch-1"], // All torches lit
      },
    };

    const evaluation = evaluateLevelState(victoryState, 8, 8); // par 8, steps 8

    expect(evaluation.isVictory).toBe(true);
    expect(evaluation.stars).toBe(3);
    expect(evaluation.xpEarned).toBe(100);
    expect(evaluation.message).toContain("sempurna");
  });

  it("evaluates to VICTORY with 2 stars when steps exceed par by up to 2", () => {
    const victoryState: LevelGridState = {
      ...createInitialGridState(baseConfig),
      player: {
        position: { x: 4, y: 4 },
        direction: "RIGHT",
        manaUsed: 10,
        collectedShards: ["shard-1"],
        litTorches: ["torch-1"],
      },
    };

    const evaluation = evaluateLevelState(victoryState, 8, 10); // par 8, steps 10 (par + 2)

    expect(evaluation.isVictory).toBe(true);
    expect(evaluation.stars).toBe(2);
    expect(evaluation.xpEarned).toBe(75);
    expect(evaluation.message).toContain("Sedikit lagi menuju mantra paling ringkas");
  });

  it("evaluates to VICTORY with 1 star when steps exceed par by more than 2", () => {
    const victoryState: LevelGridState = {
      ...createInitialGridState(baseConfig),
      player: {
        position: { x: 4, y: 4 },
        direction: "RIGHT",
        manaUsed: 13,
        collectedShards: ["shard-1"],
        litTorches: ["torch-1"],
      },
    };

    const evaluation = evaluateLevelState(victoryState, 8, 13); // par 8, steps 13

    expect(evaluation.isVictory).toBe(true);
    expect(evaluation.stars).toBe(1);
    expect(evaluation.xpEarned).toBe(60);
    expect(evaluation.message).toContain("Coba cari jalan lebih cepat untuk 3 bintang");
  });

  it("fails objective when player reaches portal without collecting all shards", () => {
    const stateMissingShard: LevelGridState = {
      ...createInitialGridState(baseConfig),
      player: {
        position: { x: 4, y: 4 },
        direction: "RIGHT",
        manaUsed: 6,
        collectedShards: [], // Shard belum diambil
        litTorches: ["torch-1"],
      },
    };

    const evaluation = evaluateLevelState(stateMissingShard, 8, 6);

    expect(evaluation.isVictory).toBe(false);
    expect(evaluation.allShardsCollected).toBe(false);
    expect(evaluation.message).toContain("kristal mana yang tertinggal");
  });

  it("fails objective when player reaches portal without lighting all torches", () => {
    const stateMissingTorch: LevelGridState = {
      ...createInitialGridState(baseConfig),
      player: {
        position: { x: 4, y: 4 },
        direction: "RIGHT",
        manaUsed: 6,
        collectedShards: ["shard-1"],
        litTorches: [], // Torch belum dinyalakan
      },
    };

    const evaluation = evaluateLevelState(stateMissingTorch, 8, 6);

    expect(evaluation.isVictory).toBe(false);
    expect(evaluation.allTorchesLit).toBe(false);
    expect(evaluation.message).toContain("lentera yang belum dinyalakan");
  });

  it("fails objective when player completes program without arriving at portal", () => {
    const stateAwayFromPortal: LevelGridState = {
      ...createInitialGridState(baseConfig),
      player: {
        position: { x: 2, y: 2 }, // Bukan di (4, 4)
        direction: "RIGHT",
        manaUsed: 4,
        collectedShards: ["shard-1"],
        litTorches: ["torch-1"],
      },
    };

    const evaluation = evaluateLevelState(stateAwayFromPortal, 8, 4);

    expect(evaluation.isVictory).toBe(false);
    expect(evaluation.atPortal).toBe(false);
    expect(evaluation.message).toContain("belum tiba di portal tujuan");
  });
});
