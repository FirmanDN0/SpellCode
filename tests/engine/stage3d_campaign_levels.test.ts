import { describe, it, expect } from "vitest";
import { allLevels, getLevelById } from "@/lib/levels";
import { runSpellProgram } from "@/lib/engine/runner";
import { createInitialGridState } from "@/lib/engine/grid";
import {
  createActionNode,
  createIfNode,
  createRepeatNode,
} from "@/lib/engine/ast";
import { SpellProgram } from "@/lib/engine/types";

describe("Tahap 3D: Level Campaign & Gameplay Integration", () => {
  it("verifies that all 18 campaign levels exist and have stable IDs, objectives, and rewards", () => {
    expect(allLevels.length).toBe(18);

    const expectedIds = [
      "w1-l1", "w1-l2", "w1-l3", "w1-l4", "w1-l5", "w1-l6",
      "w2-l1", "w2-l2", "w2-l3", "w2-l4", "w2-l5", "w2-l6",
      "w3-l1", "w3-l2", "w3-l3", "w3-l4", "w3-l5", "w3-l6",
    ];

    for (const id of expectedIds) {
      const lvl = getLevelById(id);
      expect(lvl, `Level ${id} must exist`).toBeDefined();
      expect(lvl!.id).toBe(id);
      expect(lvl!.title.length).toBeGreaterThan(0);
      expect(lvl!.description.length).toBeGreaterThan(0);
      expect(lvl!.objectives).toBeDefined();
      expect(lvl!.objectives!.length).toBeGreaterThan(0);
      expect(lvl!.baseXp).toBeGreaterThan(0);
      expect(lvl!.parSteps).toBeGreaterThan(0);
      expect(lvl!.hints).toBeDefined();
      expect(lvl!.hints!.length).toBeGreaterThanOrEqual(2);
    }
  });

  describe("World 1: Whispering Woods (Pedagogical Progression)", () => {
    // 1. Level 1 (Sequencing)
    describe("Level 1 (w1-l1): Sequencing - Langkah Pertama Magang", () => {
      const level = getLevelById("w1-l1")!;

      it("succeeds with valid 3-step sequence program", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.isVictory).toBe(true);
        expect(result.evaluation.atPortal).toBe(true);
        expect(result.evaluation.stars).toBe(3);
      });

      it("fails if program stops before reaching portal", () => {
        const incompleteProgram: SpellProgram = {
          version: 1,
          nodes: [createActionNode("STEP_FORWARD")],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(incompleteProgram, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("FAILED");
        expect(result.evaluation.isVictory).toBe(false);
      });
    });

    // 2. Level 2 (Movement & Direction)
    describe("Level 2 (w1-l2): Movement & Direction - Belokan di Tikungan Peri", () => {
      const level = getLevelById("w1-l2")!;

      it("succeeds with turn right and downward steps", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createActionNode("TURN_RIGHT"),
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.isVictory).toBe(true);
      });

      it("fails with OBSTACLE_HIT if moving forward without turning", () => {
        const wrongProgram: SpellProgram = {
          version: 1,
          nodes: [createActionNode("STEP_FORWARD")],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(wrongProgram, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("FAILED");
        expect(result.errorDetails?.code).toBe("OBSTACLE_HIT");
      });
    });

    // 3. Level 3 (Object Activation)
    describe("Level 3 (w1-l3): Object Activation - Cahaya Lentera & Kristal Mana", () => {
      const level = getLevelById("w1-l3")!;

      it("succeeds when lighting torch and collecting shard on target tiles", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createActionNode("STEP_FORWARD"), // to (1, 1) torch
            createActionNode("LIGHT_TORCH"),
            createActionNode("STEP_FORWARD"), // to (2, 1)
            createActionNode("STEP_FORWARD"), // to (3, 1) shard
            createActionNode("COLLECT_SHARD"),
            createActionNode("STEP_FORWARD"), // to (4, 1) portal
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.allTorchesLit).toBe(true);
        expect(result.evaluation.allShardsCollected).toBe(true);
        expect(result.evaluation.atPortal).toBe(true);
      });

      it("fails if player reaches portal without activating required objects", () => {
        const skipActivation: SpellProgram = {
          version: 1,
          nodes: [
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(skipActivation, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("FAILED");
        expect(result.evaluation.isVictory).toBe(false);
      });
    });

    // 4. Level 4 (Movement around obstacle)
    describe("Level 4 (w1-l4): Movement & Direction - Menembus Semak Berduri", () => {
      const level = getLevelById("w1-l4")!;

      it("succeeds when navigating detour around thorn bush", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createActionNode("TURN_LEFT"),   // facing UP
            createActionNode("STEP_FORWARD"), // to (0, 0)
            createActionNode("TURN_RIGHT"),  // facing RIGHT
            createActionNode("STEP_FORWARD"), // to (1, 0)
            createActionNode("STEP_FORWARD"), // to (2, 0)
            createActionNode("TURN_RIGHT"),  // facing DOWN
            createActionNode("STEP_FORWARD"), // to (2, 1) portal
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.isVictory).toBe(true);
      });

      it("fails with OBSTACLE_HIT when attempting straight line into thorns", () => {
        const straightCrash: SpellProgram = {
          version: 1,
          nodes: [createActionNode("STEP_FORWARD")],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(straightCrash, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("FAILED");
        expect(result.errorDetails?.code).toBe("OBSTACLE_HIT");
      });
    });

    // 5. Level 5 (Debugging)
    describe("Level 5 (w1-l5): Debugging - Mantra Magang yang Tersesat", () => {
      const level = getLevelById("w1-l5")!;

      it("proves that initial buggy program crashes into obstacle", () => {
        expect(level.initialProgram).toBeDefined();
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(level.initialProgram!, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("FAILED");
        expect(result.errorDetails?.code).toBe("OBSTACLE_HIT");
      });

      it("succeeds when user fixes bug by turning right before obstacle", () => {
        const fixedProgram: SpellProgram = {
          version: 1,
          nodes: [
            createActionNode("STEP_FORWARD"), // to (1, 1)
            createActionNode("TURN_RIGHT"),  // facing DOWN
            createActionNode("STEP_FORWARD"), // to (1, 2)
            createActionNode("STEP_FORWARD"), // to (1, 3) portal
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(fixedProgram, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.isVictory).toBe(true);
      });
    });

    // 6. Level 6 (Sequencing Milestone)
    describe("Level 6 (w1-l6): Sequencing Milestone - Ujian Harmoni Dua Lentera", () => {
      const level = getLevelById("w1-l6")!;

      it("succeeds with planned multi-torch route", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createActionNode("STEP_FORWARD"), // to (1, 1)
            createActionNode("LIGHT_TORCH"), // torch 1 lit
            createActionNode("TURN_RIGHT"),  // facing DOWN
            createActionNode("STEP_FORWARD"), // to (1, 2)
            createActionNode("TURN_LEFT"),   // facing RIGHT
            createActionNode("STEP_FORWARD"), // to (2, 2)
            createActionNode("STEP_FORWARD"), // to (3, 2)
            createActionNode("LIGHT_TORCH"), // torch 2 lit
            createActionNode("STEP_FORWARD"), // to (4, 2) portal
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.allTorchesLit).toBe(true);
      });

      it("fails if player forgets to light second torch", () => {
        const missingTorch: SpellProgram = {
          version: 1,
          nodes: [
            createActionNode("STEP_FORWARD"),
            createActionNode("LIGHT_TORCH"),
            createActionNode("TURN_RIGHT"),
            createActionNode("STEP_FORWARD"),
            createActionNode("TURN_LEFT"),
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"), // forgot LIGHT_TORCH
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(missingTorch, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("FAILED");
        expect(result.evaluation.isVictory).toBe(false);
      });
    });
  });

  describe("World 2: Crystal Caverns (Loops, Conditionals, and Debugging)", () => {
    // 7. Level 7 (w2-l1: Loops)
    describe("Level 7 (w2-l1): Loops - Lorong Kristal Berulang", () => {
      const level = getLevelById("w2-l1")!;

      it("succeeds with bounded REPEAT loop of 5 steps", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createRepeatNode(5, [createActionNode("STEP_FORWARD")]),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.isVictory).toBe(true);
        expect(result.evaluation.atPortal).toBe(true);
        expect(result.evaluation.stars).toBe(3);
        expect(result.evaluation.xpEarned).toBe(100);
      });

      it("fails if repeat count is insufficient", () => {
        const shortLoop: SpellProgram = {
          version: 1,
          nodes: [
            createRepeatNode(2, [createActionNode("STEP_FORWARD")]),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(shortLoop, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("FAILED");
        expect(result.evaluation.atPortal).toBe(false);
      });
    });

    // 8. Level 8 (w2-l2: Staircase Pattern Loops)
    describe("Level 8 (w2-l2): Loops - Tangga Kristal Berundak", () => {
      const level = getLevelById("w2-l2")!;

      it("succeeds with pattern repeat loop of 3 iterations", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createRepeatNode(3, [
              createActionNode("TURN_LEFT"),
              createActionNode("STEP_FORWARD"),
              createActionNode("TURN_RIGHT"),
              createActionNode("STEP_FORWARD"),
            ]),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.isVictory).toBe(true);
        expect(result.evaluation.stars).toBe(3);
      });

      it("fails if player stops halfway up staircase", () => {
        const halfLoop: SpellProgram = {
          version: 1,
          nodes: [
            createRepeatNode(1, [
              createActionNode("TURN_LEFT"),
              createActionNode("STEP_FORWARD"),
              createActionNode("TURN_RIGHT"),
              createActionNode("STEP_FORWARD"),
            ]),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(halfLoop, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("FAILED");
      });
    });

    // 9. Level 9 (w2-l3: Conditionals)
    describe("Level 9 (w2-l3): Conditionals - Sensor Kabut Kristal", () => {
      const level = getLevelById("w2-l3")!;

      it("succeeds by using IF condition to detect obstacle ahead and turn left", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createIfNode("IS_OBSTACLE_AHEAD", [createActionNode("TURN_LEFT")]),
            createActionNode("STEP_FORWARD"),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.isVictory).toBe(true);
      });

      it("fails with OBSTACLE_HIT when stepping forward into obstacle without condition", () => {
        const naiveStep: SpellProgram = {
          version: 1,
          nodes: [createActionNode("STEP_FORWARD")],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(naiveStep, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("FAILED");
        expect(result.errorDetails?.code).toBe("OBSTACLE_HIT");
      });
    });

    // 10. Level 10 (w2-l4: Conditionals + Loops)
    describe("Level 10 (w2-l4): Conditionals & Loops - Penjelajah Labirin Otomatis", () => {
      const level = getLevelById("w2-l4")!;

      it("succeeds with loop containing conditional turn", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createRepeatNode(2, [
              createIfNode("IS_OBSTACLE_AHEAD", [createActionNode("TURN_RIGHT")]),
              createActionNode("STEP_FORWARD"),
            ]),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.isVictory).toBe(true);
        expect(result.finalState.player.position).toEqual({ x: 3, y: 1 });
      });

      it("fails when looping straight without checking obstacle ahead", () => {
        const crashLoop: SpellProgram = {
          version: 1,
          nodes: [
            createRepeatNode(2, [createActionNode("STEP_FORWARD")]),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(crashLoop, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("FAILED");
        expect(result.errorDetails?.code).toBe("OBSTACLE_HIT");
      });
    });

    // 11. Level 11 (w2-l5: Loop Debugging)
    describe("Level 11 (w2-l5): Debugging - Misfire di Jurang Kristal", () => {
      const level = getLevelById("w2-l5")!;

      it("proves that initial program causes out-of-bounds wall collision misfire", () => {
        expect(level.initialProgram).toBeDefined();
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(level.initialProgram!, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("FAILED");
        expect(result.errorDetails?.code).toBe("WALL_COLLISION");
      });

      it("succeeds when user fixes repeat count from 6 to 3", () => {
        const fixedSolution: SpellProgram = {
          version: 1,
          nodes: [
            createRepeatNode(3, [createActionNode("STEP_FORWARD")]),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(fixedSolution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.isVictory).toBe(true);
      });
    });

    // 12. Level 12 (w2-l6: Master Milestone)
    describe("Level 12 (w2-l6): Master Milestone - Mahkota Kristal Agung", () => {
      const level = getLevelById("w2-l6")!;

      it("succeeds with complete multi-activation and navigation program", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createRepeatNode(2, [createActionNode("STEP_FORWARD")]), // to (2, 0)
            createActionNode("LIGHT_TORCH"), // torch 1 lit
            createActionNode("TURN_RIGHT"),  // facing DOWN
            createRepeatNode(2, [createActionNode("STEP_FORWARD")]), // to (2, 2)
            createActionNode("COLLECT_SHARD"), // shard 1 collected
            createActionNode("TURN_LEFT"),   // facing RIGHT
            createRepeatNode(2, [createActionNode("STEP_FORWARD")]), // to (4, 2)
            createActionNode("LIGHT_TORCH"), // torch 2 lit
            createActionNode("TURN_RIGHT"),  // facing DOWN
            createRepeatNode(2, [createActionNode("STEP_FORWARD")]), // to (4, 4) portal
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.allTorchesLit).toBe(true);
        expect(result.evaluation.allShardsCollected).toBe(true);
        expect(result.evaluation.atPortal).toBe(true);
      });

      it("fails if player reaches portal but leaves altar torches unlit", () => {
        const skipTorches: SpellProgram = {
          version: 1,
          nodes: [
            createActionNode("STEP_FORWARD"),
            createActionNode("TURN_RIGHT"),
            createRepeatNode(4, [createActionNode("STEP_FORWARD")]),
            createActionNode("TURN_LEFT"),
            createRepeatNode(3, [createActionNode("STEP_FORWARD")]),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(skipTorches, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("FAILED");
        expect(result.evaluation.isVictory).toBe(false);
      });
    });
  });

  describe("World 3: Cloud Citadel (Conditionals & Advanced Logic)", () => {
    // Level 1: w3-l1 (Sensor Jurang Awan)
    describe("Level 1 (w3-l1): Sensor Jurang Awan", () => {
      const level = getLevelById("w3-l1")!;

      it("succeeds with forward sequence to portal", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.atPortal).toBe(true);
      });
    });

    // Level 2: w3-l2 (Detektor Kristal Langit)
    describe("Level 2 (w3-l2): Detektor Kristal Langit", () => {
      const level = getLevelById("w3-l2")!;

      it("succeeds by collecting shard and reaching portal", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
            createIfNode("IS_SHARD_PRESENT", [createActionNode("COLLECT_SHARD")]),
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.allShardsCollected).toBe(true);
        expect(result.evaluation.atPortal).toBe(true);
      });
    });

    // Level 3: w3-l3 (Lentera Penjaga Awan)
    describe("Level 3 (w3-l3): Lentera Penjaga Awan", () => {
      const level = getLevelById("w3-l3")!;

      it("succeeds by lighting torch and reaching portal", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
            createIfNode("IS_TORCH_PRESENT", [createActionNode("LIGHT_TORCH")]),
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.allTorchesLit).toBe(true);
        expect(result.evaluation.atPortal).toBe(true);
      });
    });

    // Level 4: w3-l4 (Patroli Awan Otomatis)
    describe("Level 4 (w3-l4): Patroli Awan Otomatis", () => {
      const level = getLevelById("w3-l4")!;

      it("succeeds with loop containing conditional torch and shard collection", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createRepeatNode(5, [
              createActionNode("STEP_FORWARD"),
              createIfNode("IS_TORCH_PRESENT", [createActionNode("LIGHT_TORCH")]),
              createIfNode("IS_SHARD_PRESENT", [createActionNode("COLLECT_SHARD")]),
            ]),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.allTorchesLit).toBe(true);
        expect(result.evaluation.allShardsCollected).toBe(true);
        expect(result.evaluation.atPortal).toBe(true);
      });
    });

    // Level 5: w3-l5 (Simpang Labirin Langit)
    describe("Level 5 (w3-l5): Simpang Labirin Langit", () => {
      const level = getLevelById("w3-l5")!;

      it("succeeds by turning right at obstacle and navigating to portal", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createActionNode("STEP_FORWARD"),
            createIfNode("IS_OBSTACLE_AHEAD", [createActionNode("TURN_RIGHT")]),
            createActionNode("STEP_FORWARD"),
            createActionNode("STEP_FORWARD"),
            createActionNode("TURN_LEFT"),
            createActionNode("STEP_FORWARD"),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.atPortal).toBe(true);
      });
    });

    // Level 6: w3-l6 (Puncak Istana Awan Abadi)
    describe("Level 6 (w3-l6): Puncak Istana Awan Abadi", () => {
      const level = getLevelById("w3-l6")!;

      it("succeeds with loop and conditional actions collecting shards and torch", () => {
        const solution: SpellProgram = {
          version: 1,
          nodes: [
            createRepeatNode(5, [
              createActionNode("STEP_FORWARD"),
              createIfNode("IS_SHARD_PRESENT", [createActionNode("COLLECT_SHARD")]),
              createIfNode("IS_TORCH_PRESENT", [createActionNode("LIGHT_TORCH")]),
            ]),
          ],
        };
        const state = createInitialGridState(level.grid);
        const result = runSpellProgram(solution, state, level.parSteps, {
          objectives: level.objectives,
        });

        expect(result.status).toBe("VICTORY");
        expect(result.evaluation.allTorchesLit).toBe(true);
        expect(result.evaluation.allShardsCollected).toBe(true);
        expect(result.evaluation.atPortal).toBe(true);
      });
    });
  });
});
