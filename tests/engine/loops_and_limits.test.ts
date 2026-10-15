import { describe, it, expect } from "vitest";
import { runSpellProgram } from "@/lib/engine/runner";
import { createInitialGridState } from "@/lib/engine/grid";
import { createActionNode, createRepeatNode } from "@/lib/engine/ast";
import { SpellProgram } from "@/lib/engine/types";
import { validateProgram } from "@/lib/engine/validator";

describe("Engine: Loops (Repeat) and Safe Execution Limits", () => {
  const arenaConfig = {
    width: 10,
    height: 10,
    obstacles: [],
    shards: [],
    torches: [],
    portal: { x: 5, y: 0 },
    playerStart: { x: 0, y: 0, direction: "RIGHT" as const },
  };

  it("executes single REPEAT node correctly for specified count", () => {
    // Ulangi 5 kali: STEP_FORWARD -> bergerak dari (0, 0) ke (5, 0)
    const program: SpellProgram = {
      version: 1,
      nodes: [
        createRepeatNode(5, [createActionNode("STEP_FORWARD", "step-sub-1")], "repeat-1"),
      ],
    };

    const initialState = createInitialGridState(arenaConfig);
    const result = runSpellProgram(program, initialState, 5);

    expect(result.status).toBe("VICTORY");
    expect(result.totalSteps).toBe(5);
    expect(result.finalState.player.position).toEqual({ x: 5, y: 0 });
  });

  it("executes nested REPEAT loops within allowed depth", () => {
    // Nested loop: 2 kali [ 2 kali [ STEP_FORWARD ] ] = 4 langkah
    const innerRepeat = createRepeatNode(
      2,
      [createActionNode("STEP_FORWARD", "inner-step")],
      "inner-repeat"
    );
    const outerRepeat = createRepeatNode(2, [innerRepeat], "outer-repeat");

    const program: SpellProgram = {
      version: 1,
      nodes: [outerRepeat],
    };

    const initialState = createInitialGridState(arenaConfig);
    const result = runSpellProgram(program, initialState, 4);

    expect(result.totalSteps).toBe(4);
    expect(result.finalState.player.position).toEqual({ x: 4, y: 0 });
  });

  it("prevents infinite execution by enforcing maxSteps with MANA_OVERFLOW error", () => {
    // Program berulang-ulang berputar tanpa henti: 20 kali berputar di tempat
    const turnLeftNode = createActionNode("TURN_LEFT", "turn-in-place");
    const repeatNode = createRepeatNode(20, [turnLeftNode], "repeat-turns");

    const program: SpellProgram = {
      version: 1,
      nodes: [repeatNode],
    };

    const initialState = createInitialGridState(arenaConfig);
    // Jalankan dengan batas maxSteps = 10
    const result = runSpellProgram(program, initialState, 5, { maxSteps: 10 });

    expect(result.status).toBe("FAILED");
    expect(result.totalSteps).toBe(10);
    expect(result.errorDetails?.code).toBe("MANA_OVERFLOW");
    expect(result.errorDetails?.kidExplanation).toContain("Energi manamu meluap");
  });

  it("validates loop counts within 1..20 bounds", () => {
    // Loop count = 0
    const invalidLowProgram: SpellProgram = {
      version: 1,
      nodes: [
        createRepeatNode(0, [createActionNode("STEP_FORWARD")], "rep-low"),
      ],
    };
    const lowValidation = validateProgram(invalidLowProgram);
    expect(lowValidation.isValid).toBe(false);
    expect(lowValidation.errors[0]).toContain("antara 1 sampai 20");

    // Loop count = 25
    const invalidHighProgram: SpellProgram = {
      version: 1,
      nodes: [
        createRepeatNode(25, [createActionNode("STEP_FORWARD")], "rep-high"),
      ],
    };
    const highValidation = validateProgram(invalidHighProgram);
    expect(highValidation.isValid).toBe(false);
    expect(highValidation.errors[0]).toContain("antara 1 sampai 20");
  });

  it("emits warning when repeat body is empty", () => {
    const emptyRepeatProgram: SpellProgram = {
      version: 1,
      nodes: [createRepeatNode(3, [], "empty-repeat")],
    };

    const validation = validateProgram(emptyRepeatProgram);
    expect(validation.warnings.length).toBeGreaterThan(0);
    expect(validation.warnings[0]).toContain("tidak memiliki instruksi di dalamnya");
  });

  it("executes conditional IF nested inside REPEAT body correctly", () => {
    // Arena dengan rintangan di petak (1, 0)
    const obstacleArena = {
      width: 5,
      height: 5,
      obstacles: [{ x: 1, y: 0 }],
      shards: [],
      torches: [],
      portal: { x: 0, y: 1 },
      playerStart: { x: 0, y: 0, direction: "RIGHT" as const },
    };

    // Ulangi 2 kali: JIKA rintangan di depan -> belok kanan, lalu maju
    const program: SpellProgram = {
      version: 1,
      nodes: [
        createRepeatNode(
          1,
          [
            {
              id: "nested-if",
              type: "IF",
              condition: "IS_OBSTACLE_AHEAD",
              thenBody: [createActionNode("TURN_RIGHT", "turn-right-action")],
            },
            createActionNode("STEP_FORWARD", "step-forward-action"),
          ],
          "loop-with-if"
        ),
      ],
    };

    const state = createInitialGridState(obstacleArena);
    const result = runSpellProgram(program, state, 2);

    expect(result.status).toBe("VICTORY");
    expect(result.finalState.player.direction).toBe("DOWN");
    expect(result.finalState.player.position).toEqual({ x: 0, y: 1 });
  });
});
