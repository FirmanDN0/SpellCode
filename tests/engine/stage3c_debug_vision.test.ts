import { describe, it, expect } from "vitest";
import { runSpellProgram } from "@/lib/engine/runner";
import { createExecutionController } from "@/lib/engine/controller";
import { createInitialGridState } from "@/lib/engine/grid";
import {
  createActionNode,
  createIfNode,
  createRepeatNode,
} from "@/lib/engine/ast";
import { validateProgram } from "@/lib/engine/validator";
import { SpellProgram } from "@/lib/engine/types";

describe("Tahap 3C: Loops, Conditionals, and Debug Vision Trace", () => {
  const baseArena = {
    width: 6,
    height: 4,
    playerStart: { x: 0, y: 1, direction: "RIGHT" as const },
    obstacles: [{ x: 2, y: 1 }],
    shards: [{ id: "shard-1", x: 1, y: 1 }],
    torches: [{ id: "torch-1", x: 3, y: 1 }],
    portal: { x: 4, y: 1 },
  };

  describe("1. Bounded Loops (Repeat) and Limits", () => {
    it("executes valid bounded loop with precise iteration tracking", () => {
      // Loop 3 kali: maju (melewati 0,1 -> 1,1)
      const repeatNode = createRepeatNode(
        2,
        [createActionNode("STEP_FORWARD", "step-in-loop")],
        "repeat-node-1"
      );
      const program: SpellProgram = {
        version: 1,
        nodes: [repeatNode],
      };

      const state = createInitialGridState({
        ...baseArena,
        obstacles: [],
      });

      const result = runSpellProgram(program, state, 2);
      expect(result.status).toBe("FAILED"); // Belum tiba di portal, tapi eksekusi valid
      expect(result.totalSteps).toBe(2);
      expect(result.finalState.player.position).toEqual({ x: 2, y: 1 });

      // Verifikasi event trace mencatat LOOP_ITERATION
      const loopEvents = result.events.filter((e) => e.type === "LOOP_ITERATION");
      expect(loopEvents.length).toBe(2);
      expect(loopEvents[0].iteration).toBe(1);
      expect(loopEvents[0].totalIterations).toBe(2);
      expect(loopEvents[1].iteration).toBe(2);
    });

    it("rejects loop iteration count exceeding validated bounds (1..20)", () => {
      const invalidProgramHigh: SpellProgram = {
        version: 1,
        nodes: [createRepeatNode(25, [createActionNode("STEP_FORWARD")])],
      };
      const validationHigh = validateProgram(invalidProgramHigh);
      expect(validationHigh.isValid).toBe(false);
      expect(validationHigh.errors[0]).toContain("antara 1 sampai 20");

      const invalidProgramZero: SpellProgram = {
        version: 1,
        nodes: [createRepeatNode(0, [createActionNode("STEP_FORWARD")])],
      };
      const validationZero = validateProgram(invalidProgramZero);
      expect(validationZero.isValid).toBe(false);
    });

    it("halts with MANA_OVERFLOW when cumulative step execution limit is reached", () => {
      // 10 iterasi * 2 putaran = 20 langkah, melebihi maxSteps = 5
      const program: SpellProgram = {
        version: 1,
        nodes: [
          createRepeatNode(10, [
            createActionNode("TURN_LEFT"),
            createActionNode("TURN_RIGHT"),
          ]),
        ],
      };

      const state = createInitialGridState(baseArena);
      const result = runSpellProgram(program, state, 4, { maxSteps: 5 });

      expect(result.status).toBe("FAILED");
      expect(result.errorDetails?.code).toBe("MANA_OVERFLOW");
      expect(result.totalSteps).toBe(5);
    });
  });

  describe("2. Conditionals (IF / ELSE) and Branch Tracing", () => {
    it("traces CONDITION_EVALUATED and executes THEN branch when true", () => {
      // Player di (1, 1) menghadap RIGHT, di (2, 1) terdapat rintangan batu -> IS_OBSTACLE_AHEAD = true
      const program: SpellProgram = {
        version: 1,
        nodes: [
          createActionNode("STEP_FORWARD", "init-step"), // ke (1, 1)
          createIfNode(
            "IS_OBSTACLE_AHEAD",
            [createActionNode("TURN_LEFT", "then-action")],
            [createActionNode("TURN_RIGHT", "else-action")],
            "if-node-test"
          ),
        ],
      };

      const state = createInitialGridState(baseArena);
      const result = runSpellProgram(program, state, 2);

      expect(result.finalState.player.direction).toBe("UP");

      const condEvents = result.events.filter((e) => e.type === "CONDITION_EVALUATED");
      expect(condEvents.length).toBe(1);
      expect(condEvents[0].condition).toBe("IS_OBSTACLE_AHEAD");
      expect(condEvents[0].conditionResult).toBe(true);
      expect(condEvents[0].branchChosen).toBe("THEN");
    });

    it("traces CONDITION_EVALUATED and executes ELSE branch when false", () => {
      // Player di (0, 1) menghadap RIGHT, di (1, 1) adalah kristal (bukan rintangan) -> IS_OBSTACLE_AHEAD = false
      const program: SpellProgram = {
        version: 1,
        nodes: [
          createIfNode(
            "IS_OBSTACLE_AHEAD",
            [createActionNode("TURN_LEFT", "then-action")],
            [createActionNode("TURN_RIGHT", "else-action")],
            "if-node-false"
          ),
        ],
      };

      const state = createInitialGridState(baseArena);
      const result = runSpellProgram(program, state, 1);

      expect(result.finalState.player.direction).toBe("DOWN");

      const condEvents = result.events.filter((e) => e.type === "CONDITION_EVALUATED");
      expect(condEvents.length).toBe(1);
      expect(condEvents[0].conditionResult).toBe(false);
      expect(condEvents[0].branchChosen).toBe("ELSE");
    });
  });

  describe("3. Nested Blocks and Depth Limit", () => {
    it("allows nested blocks within maximum depth (depth <= 4)", () => {
      // Depth 3: REPEAT -> IF -> ACTION
      const program: SpellProgram = {
        version: 1,
        nodes: [
          createRepeatNode(
            2,
            [
              createIfNode("IS_CLEAR_AHEAD", [
                createActionNode("STEP_FORWARD"),
              ]),
            ],
            "nested-depth-3"
          ),
        ],
      };

      const validation = validateProgram(program);
      expect(validation.isValid).toBe(true);
    });

    it("rejects programs exceeding maximum nesting depth (> 4 levels)", () => {
      // Level 1: Repeat
      // Level 2: Repeat
      // Level 3: Repeat
      // Level 4: Repeat
      // Level 5: Repeat -> melebihi batas 4
      const level5 = createRepeatNode(2, [createActionNode("STEP_FORWARD")]);
      const level4 = createRepeatNode(2, [level5]);
      const level3 = createRepeatNode(2, [level4]);
      const level2 = createRepeatNode(2, [level3]);
      const level1 = createRepeatNode(2, [level2]);

      const deepProgram: SpellProgram = {
        version: 1,
        nodes: [level1],
      };

      const validation = validateProgram(deepProgram);
      expect(validation.isValid).toBe(false);
      expect(validation.errors[0]).toContain("melebihi batas maksimal (4)");
    });
  });

  describe("4. Debug Vision: Step Tracking, Misfire Identification & Objective Feedback", () => {
    it("identifies misfiring instruction and records exact failed step and node ID", () => {
      // Program menabrak rintangan di (2, 1) pada langkah ke-2
      const step1 = createActionNode("STEP_FORWARD", "safe-step-1"); // ke (1, 1)
      const step2 = createActionNode("STEP_FORWARD", "crash-step-2"); // ke (2, 1) yang ada rintangan!
      const program: SpellProgram = {
        version: 1,
        nodes: [step1, step2],
      };

      const state = createInitialGridState(baseArena);
      const result = runSpellProgram(program, state, 2);

      expect(result.status).toBe("FAILED");
      expect(result.errorDetails?.nodeId).toBe("crash-step-2");
      expect(result.errorDetails?.code).toBe("OBSTACLE_HIT");
      expect(result.errorDetails?.stepNumber).toBe(2);
      expect(result.errorDetails?.kidExplanation).toContain("batu besar");
    });

    it("provides honest objective evaluation feedback when program completes without victory", () => {
      // Program berhenti di (1, 1) tanpa mengambil kristal dan belum mencapai portal
      const program: SpellProgram = {
        version: 1,
        nodes: [createActionNode("STEP_FORWARD", "step-1")],
      };

      const state = createInitialGridState(baseArena);
      const result = runSpellProgram(program, state, 4);

      expect(result.status).toBe("FAILED");
      expect(result.evaluation.isVictory).toBe(false);
      expect(result.evaluation.atPortal).toBe(false);
      expect(result.evaluation.allShardsCollected).toBe(false);
      expect(result.evaluation.message).toContain("belum tiba di portal");

      // Verifikasi tujuan yang belum terpenuhi diidentifikasi secara eksplisit
      const uncompleted = result.evaluation.objectives.filter((o) => !o.isCompleted);
      expect(uncompleted.length).toBeGreaterThan(0);
      expect(uncompleted.some((o) => o.type === "REACH_PORTAL")).toBe(true);
    });

    it("ExecutionController correctly emits trace events and step snapshots for UI Debug Vision", () => {
      const stepNode = createActionNode("STEP_FORWARD", "node-ctrl-step");
      const program: SpellProgram = {
        version: 1,
        nodes: [stepNode],
      };

      const state = createInitialGridState(baseArena);
      const controller = createExecutionController(
        {
          initialWorldState: state,
          parSteps: 2,
        },
        program
      );

      // Jalankan langkah ke-1 melalui controller Step
      const executed = controller.step();
      expect(executed).toBe(true);

      const snap = controller.getSnapshot();
      expect(snap.stepsTaken).toBe(1);
      expect(snap.activeNodeId).toBe("node-ctrl-step");
      expect(snap.events.length).toBeGreaterThan(0);
      expect(snap.events[0].nodeId).toBe("node-ctrl-step");

      // Langkah ke-2: instruksi program sudah habis, step() mengembalikan false
      const hasMore = controller.step();
      expect(hasMore).toBe(false);
      expect(controller.getSnapshot().status).toBe("FAILED");
      expect(controller.getSnapshot().evaluation?.isVictory).toBe(false);

      // Reset membersihkan status eksekusi dengan aman
      controller.reset();
      const resetSnap = controller.getSnapshot();
      expect(resetSnap.stepsTaken).toBe(0);
      expect(resetSnap.activeNodeId).toBeUndefined();
      expect(resetSnap.status).toBe("IDLE");
    });
  });
});
