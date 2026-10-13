import { describe, it, expect } from "vitest";
import { evaluateCondition } from "@/lib/engine/condition";
import { createInitialGridState } from "@/lib/engine/grid";
import { runSpellProgram } from "@/lib/engine/runner";
import {
  createActionNode,
  createIfNode,
  createRepeatNode,
} from "@/lib/engine/ast";
import { SpellProgram } from "@/lib/engine/types";

describe("Engine: Conditions & Branching (IF/ELSE)", () => {
  const baseConfig = {
    width: 5,
    height: 5,
    obstacles: [{ x: 2, y: 1 }],
    shards: [{ id: "shard-1", x: 2, y: 2 }],
    torches: [{ id: "torch-1", x: 2, y: 2 }],
    portal: { x: 4, y: 4 },
    playerStart: { x: 2, y: 2, direction: "UP" as const },
  };

  it("evaluates IS_OBSTACLE_AHEAD accurately for obstacles and boundaries", () => {
    // Di (2, 2) menghadap UP, petak di depannya adalah (2, 1) yang ada rintangan
    const state = createInitialGridState(baseConfig);
    expect(evaluateCondition("IS_OBSTACLE_AHEAD", state)).toBe(true);

    // Menghadap RIGHT, petak di depannya adalah (3, 2) yang kosong
    const rightState = {
      ...state,
      player: { ...state.player, direction: "RIGHT" as const },
    };
    expect(evaluateCondition("IS_OBSTACLE_AHEAD", rightState)).toBe(false);

    // Di tepi atas (2, 0) menghadap UP, depan adalah jurang (out of bounds)
    const boundaryState = {
      ...state,
      player: { ...state.player, position: { x: 2, y: 0 }, direction: "UP" as const },
    };
    expect(evaluateCondition("IS_OBSTACLE_AHEAD", boundaryState)).toBe(true);
  });

  it("evaluates IS_CLEAR_AHEAD accurately as inverse of obstacle ahead", () => {
    const state = createInitialGridState(baseConfig);
    expect(evaluateCondition("IS_CLEAR_AHEAD", state)).toBe(false);

    const clearState = {
      ...state,
      player: { ...state.player, direction: "DOWN" as const },
    };
    expect(evaluateCondition("IS_CLEAR_AHEAD", clearState)).toBe(true);
  });

  it("evaluates IS_SHARD_PRESENT and IS_TORCH_PRESENT based on current tile", () => {
    const state = createInitialGridState(baseConfig); // Player di (2, 2) ada shard dan torch
    expect(evaluateCondition("IS_SHARD_PRESENT", state)).toBe(true);
    expect(evaluateCondition("IS_TORCH_PRESENT", state)).toBe(true);

    // Setelah shard dikoleksi, evaluasi harus bernilai false
    const collectedState = {
      ...state,
      player: { ...state.player, collectedShards: ["shard-1"] },
    };
    expect(evaluateCondition("IS_SHARD_PRESENT", collectedState)).toBe(false);

    // Setelah torch dinyalakan, evaluasi harus bernilai false
    const litState = {
      ...state,
      player: { ...state.player, litTorches: ["torch-1"] },
    };
    expect(evaluateCondition("IS_TORCH_PRESENT", litState)).toBe(false);
  });

  it("evaluates IS_PORTAL_PRESENT correctly", () => {
    const state = createInitialGridState(baseConfig);
    expect(evaluateCondition("IS_PORTAL_PRESENT", state)).toBe(false);

    const atPortalState = {
      ...state,
      player: { ...state.player, position: { x: 4, y: 4 } },
    };
    expect(evaluateCondition("IS_PORTAL_PRESENT", atPortalState)).toBe(true);
  });

  it("executes THEN branch when condition is TRUE and skips when FALSE", () => {
    // Player di (2, 2) menghadap UP (ada obstacle di depan)
    // JIKA ada obstacle di depan -> TURN_RIGHT
    const program: SpellProgram = {
      version: 1,
      nodes: [
        createIfNode(
          "IS_OBSTACLE_AHEAD",
          [createActionNode("TURN_RIGHT", "turn-if-true")],
          undefined,
          "if-node-1"
        ),
      ],
    };

    const state = createInitialGridState(baseConfig);
    const result = runSpellProgram(program, state, 1);

    expect(result.totalSteps).toBe(1);
    expect(result.finalState.player.direction).toBe("RIGHT");
  });

  it("executes ELSE branch when condition is FALSE", () => {
    // Player di (2, 2) menghadap DOWN (jalan di depan kosong)
    // JIKA ada obstacle di depan -> TURN_LEFT, LAINNYA -> STEP_FORWARD
    const program: SpellProgram = {
      version: 1,
      nodes: [
        createIfNode(
          "IS_OBSTACLE_AHEAD",
          [createActionNode("TURN_LEFT", "then-branch")],
          [createActionNode("STEP_FORWARD", "else-branch")],
          "if-else-node"
        ),
      ],
    };

    const state = createInitialGridState({
      ...baseConfig,
      playerStart: { x: 2, y: 2, direction: "DOWN" },
    });

    const result = runSpellProgram(program, state, 1);

    expect(result.totalSteps).toBe(1);
    expect(result.finalState.player.position).toEqual({ x: 2, y: 3 });
    expect(result.finalState.player.direction).toBe("DOWN");
  });

  it("evaluates dynamically in a loop to navigate around obstacles", () => {
    // Pola loop cerdas:
    // Ulangi 2 kali:
    //   JIKA IS_OBSTACLE_AHEAD: TURN_RIGHT
    //   STEP_FORWARD
    const loopNode = createRepeatNode(
      2,
      [
        createIfNode("IS_OBSTACLE_AHEAD", [createActionNode("TURN_RIGHT")]),
        createActionNode("STEP_FORWARD"),
      ],
      "smart-loop"
    );

    const program: SpellProgram = {
      version: 1,
      nodes: [loopNode],
    };

    // Mulai di (2, 2) menghadap UP (depan (2, 1) ada rintangan):
    // Iterasi 1: Obstacle ahead = true -> TURN_RIGHT (menghadap RIGHT), lalu STEP_FORWARD ke (3, 2).
    // Iterasi 2: Di (3, 2) menghadap RIGHT, depan (4, 2) kosong -> Obstacle ahead = false, lalu STEP_FORWARD ke (4, 2).
    const state = createInitialGridState({
      ...baseConfig,
      portal: { x: 4, y: 2 },
      shards: [],
      torches: [],
    });
    const result = runSpellProgram(program, state, 3);

    expect(result.status).toBe("VICTORY");
    expect(result.finalState.player.position).toEqual({ x: 4, y: 2 });
    expect(result.finalState.player.direction).toBe("RIGHT");
  });
});
