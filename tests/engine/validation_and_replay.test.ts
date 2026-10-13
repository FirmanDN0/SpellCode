import { describe, it, expect } from "vitest";
import { validateProgram } from "@/lib/engine/validator";
import {
  calculateMaxDepth,
  countTotalNodes,
  createActionNode,
  createIfNode,
  createRepeatNode,
} from "@/lib/engine/ast";
import { runSpellProgram } from "@/lib/engine/runner";
import { createInitialGridState } from "@/lib/engine/grid";
import { SpellProgram } from "@/lib/engine/types";

describe("Engine: Program Validation and Deterministic Replay", () => {
  const levelConfig = {
    width: 6,
    height: 6,
    obstacles: [{ x: 3, y: 1 }],
    shards: [{ id: "shard-1", x: 2, y: 0 }],
    torches: [{ id: "torch-1", x: 4, y: 2 }],
    portal: { x: 5, y: 5 },
    playerStart: { x: 0, y: 0, direction: "RIGHT" as const },
  };

  it("calculates node count and max nesting depth accurately", () => {
    // Structure:
    // Action (depth 1)
    // Repeat (depth 1) -> [ Action (depth 2), Repeat (depth 2) -> [ Action (depth 3) ] ]
    const program: SpellProgram = {
      version: 1,
      nodes: [
        createActionNode("STEP_FORWARD"),
        createRepeatNode(2, [
          createActionNode("TURN_RIGHT"),
          createRepeatNode(3, [createActionNode("STEP_FORWARD")]),
        ]),
      ],
    };

    expect(countTotalNodes(program.nodes)).toBe(5);
    expect(calculateMaxDepth(program.nodes)).toBe(3);
  });

  it("rejects programs containing runes not permitted by level configuration", () => {
    const program: SpellProgram = {
      version: 1,
      nodes: [
        createActionNode("STEP_FORWARD"),
        createActionNode("LIGHT_TORCH"), // Tidak diizinkan di level intro
      ],
    };

    const validation = validateProgram(program, {
      allowedRunes: ["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"],
    });

    expect(validation.isValid).toBe(false);
    expect(validation.errors[0]).toContain("Rune 'LIGHT_TORCH' tidak diizinkan");
  });

  it("rejects REPEAT or IF when disallowed for introductory levels", () => {
    const repeatProgram: SpellProgram = {
      version: 1,
      nodes: [createRepeatNode(2, [createActionNode("STEP_FORWARD")])],
    };

    const valRepeat = validateProgram(repeatProgram, { allowRepeat: false });
    expect(valRepeat.isValid).toBe(false);
    expect(valRepeat.errors[0]).toContain("REPEAT");

    const ifProgram: SpellProgram = {
      version: 1,
      nodes: [createIfNode("IS_CLEAR_AHEAD", [createActionNode("STEP_FORWARD")])],
    };

    const valIf = validateProgram(ifProgram, { allowCondition: false });
    expect(valIf.isValid).toBe(false);
    expect(valIf.errors[0]).toContain("IF");
  });

  it("rejects program exceeding maximum allowed nodes limit", () => {
    const manyNodes = Array.from({ length: 15 }, () =>
      createActionNode("STEP_FORWARD")
    );
    const program: SpellProgram = { version: 1, nodes: manyNodes };

    const validation = validateProgram(program, { maxNodes: 10 });
    expect(validation.isValid).toBe(false);
    expect(validation.errors[0]).toContain("melebihi batas maksimal");
  });

  it("rejects deeply nested recursion exceeding maximum allowed depth limit", () => {
    // 5 tingkat nesting
    const deepNode = createRepeatNode(2, [
      createRepeatNode(2, [
        createRepeatNode(2, [
          createRepeatNode(2, [
            createRepeatNode(2, [createActionNode("STEP_FORWARD")]),
          ]),
        ]),
      ]),
    ]);

    const program: SpellProgram = { version: 1, nodes: [deepNode] };
    const validation = validateProgram(program, { maxDepth: 3 });

    expect(validation.isValid).toBe(false);
    expect(validation.errors[0]).toContain("kedalaman blok bersarang");
  });

  it("guarantees 100% reproducible and deterministic replay across multiple runs", () => {
    const program: SpellProgram = {
      version: 1,
      nodes: [
        createActionNode("STEP_FORWARD", "a1"),
        createActionNode("STEP_FORWARD", "a2"),
        createActionNode("COLLECT_SHARD", "a3"),
        createActionNode("TURN_RIGHT", "a4"),
        createRepeatNode(
          2,
          [
            createActionNode("STEP_FORWARD", "sub-1"),
            createIfNode(
              "IS_TORCH_PRESENT",
              [createActionNode("LIGHT_TORCH", "sub-torch")],
              undefined,
              "sub-if"
            ),
          ],
          "rep-1"
        ),
      ],
    };

    const initialState = createInitialGridState(levelConfig);

    // Jalankan 5 kali secara independen
    const runs = Array.from({ length: 5 }, () =>
      runSpellProgram(program, initialState, 10)
    );

    const firstRun = runs[0];

    for (let i = 1; i < runs.length; i++) {
      const currentRun = runs[i];

      // Verifikasi status dan langkah
      expect(currentRun.status).toBe(firstRun.status);
      expect(currentRun.totalSteps).toBe(firstRun.totalSteps);

      // Verifikasi state akhir pemain
      expect(currentRun.finalState.player).toEqual(firstRun.finalState.player);

      // Verifikasi evaluasi objektif
      expect(currentRun.evaluation).toEqual(firstRun.evaluation);

      // Verifikasi event trace identik langkah demi langkah
      expect(currentRun.events).toHaveLength(firstRun.events.length);
      for (let e = 0; e < currentRun.events.length; e++) {
        expect(currentRun.events[e]).toEqual(firstRun.events[e]);
      }
    }
  });
});
