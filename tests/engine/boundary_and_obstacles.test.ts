import { describe, it, expect } from "vitest";
import {
  createInitialGridState,
  isOutOfBounds,
  isObstacle,
  applyStep,
} from "@/lib/engine/grid";
import { ExecutionStep } from "@/lib/engine/types";

describe("Engine: Boundaries and Obstacle Safety", () => {
  it("detects out of bounds coordinates properly", () => {
    const width = 4;
    const height = 4;

    expect(isOutOfBounds({ x: 0, y: 0 }, width, height)).toBe(false);
    expect(isOutOfBounds({ x: 3, y: 3 }, width, height)).toBe(false);
    expect(isOutOfBounds({ x: -1, y: 0 }, width, height)).toBe(true);
    expect(isOutOfBounds({ x: 0, y: -1 }, width, height)).toBe(true);
    expect(isOutOfBounds({ x: 4, y: 0 }, width, height)).toBe(true);
    expect(isOutOfBounds({ x: 0, y: 4 }, width, height)).toBe(true);
  });

  it("detects obstacle coordinates accurately", () => {
    const obstacles = [
      { x: 1, y: 2 },
      { x: 3, y: 0 },
    ];

    expect(isObstacle({ x: 1, y: 2 }, obstacles)).toBe(true);
    expect(isObstacle({ x: 3, y: 0 }, obstacles)).toBe(true);
    expect(isObstacle({ x: 0, y: 0 }, obstacles)).toBe(false);
    expect(isObstacle({ x: 2, y: 1 }, obstacles)).toBe(false);
  });

  it("fails safely with WALL_COLLISION when stepping off north edge", () => {
    const state = createInitialGridState({
      width: 4,
      height: 4,
      obstacles: [],
      shards: [],
      torches: [],
      portal: { x: 3, y: 3 },
      playerStart: { x: 1, y: 0, direction: "UP" },
    });

    const step: ExecutionStep = {
      activeNodeId: "fail-step-1",
      command: "STEP_FORWARD",
      stepNumber: 1,
    };

    const resultState = applyStep(state, step);

    expect(resultState.status).toBe("FAILED");
    expect(resultState.misfireNodeId).toBe("fail-step-1");
    expect(resultState.errorDetails?.code).toBe("WALL_COLLISION");
    expect(resultState.failureReason).toContain("Hampir jatuh");
    // Posisi pemain tidak melompat ke luar arena
    expect(resultState.player.position).toEqual({ x: 1, y: 0 });
  });

  it("fails safely with WALL_COLLISION when stepping off west edge", () => {
    const state = createInitialGridState({
      width: 4,
      height: 4,
      obstacles: [],
      shards: [],
      torches: [],
      portal: { x: 3, y: 3 },
      playerStart: { x: 0, y: 2, direction: "LEFT" },
    });

    const step: ExecutionStep = {
      activeNodeId: "fail-step-2",
      command: "STEP_FORWARD",
      stepNumber: 1,
    };

    const resultState = applyStep(state, step);

    expect(resultState.status).toBe("FAILED");
    expect(resultState.errorDetails?.code).toBe("WALL_COLLISION");
    expect(resultState.player.position).toEqual({ x: 0, y: 2 });
  });

  it("fails safely with OBSTACLE_HIT when stepping into a boulder/shrub", () => {
    const state = createInitialGridState({
      width: 4,
      height: 4,
      obstacles: [{ x: 1, y: 1 }],
      shards: [],
      torches: [],
      portal: { x: 3, y: 3 },
      playerStart: { x: 1, y: 2, direction: "UP" }, // Posisi di bawah rintangan
    });

    const step: ExecutionStep = {
      activeNodeId: "hit-obs-1",
      command: "STEP_FORWARD",
      stepNumber: 1,
    };

    const resultState = applyStep(state, step);

    expect(resultState.status).toBe("FAILED");
    expect(resultState.misfireNodeId).toBe("hit-obs-1");
    expect(resultState.errorDetails?.code).toBe("OBSTACLE_HIT");
    expect(resultState.failureReason).toContain("terhalang");
    // Pemain berhenti di depan rintangan
    expect(resultState.player.position).toEqual({ x: 1, y: 2 });
  });

  it("ignores further steps once status is FAILED", () => {
    const state = createInitialGridState({
      width: 4,
      height: 4,
      obstacles: [{ x: 1, y: 1 }],
      shards: [],
      torches: [],
      portal: { x: 3, y: 3 },
      playerStart: { x: 1, y: 2, direction: "UP" },
    });

    const failStep: ExecutionStep = {
      activeNodeId: "hit-obs-1",
      command: "STEP_FORWARD",
      stepNumber: 1,
    };
    const failedState = applyStep(state, failStep);

    // Coba jalankan langkah berikutnya
    const subsequentStep: ExecutionStep = {
      activeNodeId: "after-fail",
      command: "TURN_RIGHT",
      stepNumber: 2,
    };
    const finalState = applyStep(failedState, subsequentStep);

    expect(finalState).toEqual(failedState);
    expect(finalState.status).toBe("FAILED");
  });
});
