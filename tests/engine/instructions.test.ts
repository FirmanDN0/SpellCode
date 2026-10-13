import { describe, it, expect } from "vitest";
import {
  createInitialGridState,
  getNextDirection,
  getForwardPosition,
  applyStep,
} from "@/lib/engine/grid";
import { Direction, ExecutionStep, LevelGridState } from "@/lib/engine/types";

describe("Engine: Basic Instructions & State Mutations", () => {
  const baseConfig = {
    width: 5,
    height: 5,
    obstacles: [],
    shards: [{ id: "shard-1", x: 2, y: 1 }],
    torches: [{ id: "torch-1", x: 1, y: 2 }],
    portal: { x: 4, y: 4 },
    playerStart: { x: 2, y: 2, direction: "UP" as Direction },
  };

  it("calculates forward position correctly for all 4 directions", () => {
    const center = { x: 2, y: 2 };
    expect(getForwardPosition(center, "UP")).toEqual({ x: 2, y: 1 });
    expect(getForwardPosition(center, "RIGHT")).toEqual({ x: 3, y: 2 });
    expect(getForwardPosition(center, "DOWN")).toEqual({ x: 2, y: 3 });
    expect(getForwardPosition(center, "LEFT")).toEqual({ x: 1, y: 2 });
  });

  it("rotates direction correctly with TURN_LEFT and TURN_RIGHT", () => {
    // TURN_LEFT: Counter-clockwise
    expect(getNextDirection("UP", "LEFT")).toBe("LEFT");
    expect(getNextDirection("LEFT", "LEFT")).toBe("DOWN");
    expect(getNextDirection("DOWN", "LEFT")).toBe("RIGHT");
    expect(getNextDirection("RIGHT", "LEFT")).toBe("UP");

    // TURN_RIGHT: Clockwise
    expect(getNextDirection("UP", "RIGHT")).toBe("RIGHT");
    expect(getNextDirection("RIGHT", "RIGHT")).toBe("DOWN");
    expect(getNextDirection("DOWN", "RIGHT")).toBe("LEFT");
    expect(getNextDirection("LEFT", "RIGHT")).toBe("UP");
  });

  it("executes STEP_FORWARD without mutating original state", () => {
    const state = createInitialGridState(baseConfig);
    const step: ExecutionStep = {
      activeNodeId: "act-1",
      command: "STEP_FORWARD",
      stepNumber: 1,
    };

    const nextState = applyStep(state, step);

    // Verifikasi imutabilitas
    expect(state.player.position).toEqual({ x: 2, y: 2 });
    expect(state.player.manaUsed).toBe(0);

    // Verifikasi state baru
    expect(nextState.player.position).toEqual({ x: 2, y: 1 });
    expect(nextState.player.manaUsed).toBe(1);
    expect(nextState.status).toBe("RUNNING");
  });

  it("executes TURN_LEFT and updates player direction", () => {
    const state = createInitialGridState(baseConfig);
    const step: ExecutionStep = {
      activeNodeId: "act-2",
      command: "TURN_LEFT",
      stepNumber: 1,
    };

    const nextState = applyStep(state, step);
    expect(nextState.player.direction).toBe("LEFT");
    expect(nextState.player.position).toEqual({ x: 2, y: 2 });
    expect(nextState.player.manaUsed).toBe(1);
  });

  it("executes TURN_RIGHT and updates player direction", () => {
    const state = createInitialGridState(baseConfig);
    const step: ExecutionStep = {
      activeNodeId: "act-3",
      command: "TURN_RIGHT",
      stepNumber: 1,
    };

    const nextState = applyStep(state, step);
    expect(nextState.player.direction).toBe("RIGHT");
    expect(nextState.player.position).toEqual({ x: 2, y: 2 });
    expect(nextState.player.manaUsed).toBe(1);
  });

  it("collects shard when player performs COLLECT_SHARD at shard tile", () => {
    // Tempatkan player di tile kristal (2, 1)
    const state = createInitialGridState({
      ...baseConfig,
      playerStart: { x: 2, y: 1, direction: "UP" },
    });

    const step: ExecutionStep = {
      activeNodeId: "act-4",
      command: "COLLECT_SHARD",
      stepNumber: 1,
    };

    const nextState = applyStep(state, step);
    expect(nextState.player.collectedShards).toContain("shard-1");
    expect(nextState.player.manaUsed).toBe(1);
  });

  it("does not collect shard if player performs COLLECT_SHARD at empty tile", () => {
    const state = createInitialGridState(baseConfig); // Player di (2, 2), shard di (2, 1)

    const step: ExecutionStep = {
      activeNodeId: "act-5",
      command: "COLLECT_SHARD",
      stepNumber: 1,
    };

    const nextState = applyStep(state, step);
    expect(nextState.player.collectedShards).toHaveLength(0);
    expect(nextState.player.manaUsed).toBe(1);
  });

  it("lights torch when player performs LIGHT_TORCH at torch tile", () => {
    // Tempatkan player di tile lentera (1, 2)
    const state = createInitialGridState({
      ...baseConfig,
      playerStart: { x: 1, y: 2, direction: "UP" },
    });

    const step: ExecutionStep = {
      activeNodeId: "act-6",
      command: "LIGHT_TORCH",
      stepNumber: 1,
    };

    const nextState = applyStep(state, step);
    expect(nextState.player.litTorches).toContain("torch-1");
    expect(nextState.player.manaUsed).toBe(1);
  });

  it("does not re-add already collected shard or lit torch", () => {
    const state: LevelGridState = {
      ...createInitialGridState(baseConfig),
      player: {
        position: { x: 2, y: 1 },
        direction: "UP",
        manaUsed: 1,
        collectedShards: ["shard-1"],
        litTorches: [],
      },
    };

    const step: ExecutionStep = {
      activeNodeId: "act-7",
      command: "COLLECT_SHARD",
      stepNumber: 2,
    };

    const nextState = applyStep(state, step);
    expect(nextState.player.collectedShards).toEqual(["shard-1"]);
  });

  it("executes CAST_SPELL and increments mana without breaking status", () => {
    const state = createInitialGridState(baseConfig);
    const step: ExecutionStep = {
      activeNodeId: "act-8",
      command: "CAST_SPELL",
      stepNumber: 1,
    };

    const nextState = applyStep(state, step);
    expect(nextState.player.manaUsed).toBe(1);
    expect(nextState.status).toBe("RUNNING");
  });
});
