import { describe, it, expect } from "vitest";
import { runSpellProgram } from "@/lib/engine/runner";
import { createInitialGridState } from "@/lib/engine/grid";
import { createActionNode } from "@/lib/engine/ast";
import { SpellProgram } from "@/lib/engine/types";

describe("Engine: Execution Order and Trace Generation", () => {
  const baseConfig = {
    width: 5,
    height: 5,
    obstacles: [],
    shards: [{ id: "shard-1", x: 2, y: 0 }],
    torches: [],
    portal: { x: 2, y: 0 },
    playerStart: { x: 0, y: 2, direction: "UP" as const },
  };

  it("executes instructions in strict sequential order and generates matching trace", () => {
    // Jalur:
    // Mulai di (0, 2) menghadap UP
    // 1. TURN_RIGHT -> menghadap RIGHT
    // 2. STEP_FORWARD -> ke (1, 2)
    // 3. STEP_FORWARD -> ke (2, 2)
    // 4. TURN_LEFT -> menghadap UP
    // 5. STEP_FORWARD -> ke (2, 1)
    // 6. STEP_FORWARD -> ke (2, 0)
    // 7. COLLECT_SHARD -> ambil shard-1
    const nodes = [
      createActionNode("TURN_RIGHT", "node-1"),
      createActionNode("STEP_FORWARD", "node-2"),
      createActionNode("STEP_FORWARD", "node-3"),
      createActionNode("TURN_LEFT", "node-4"),
      createActionNode("STEP_FORWARD", "node-5"),
      createActionNode("STEP_FORWARD", "node-6"),
      createActionNode("COLLECT_SHARD", "node-7"),
    ];

    const program: SpellProgram = {
      version: 1,
      nodes,
    };

    const initialState = createInitialGridState(baseConfig);
    const result = runSpellProgram(program, initialState, 7);

    expect(result.status).toBe("VICTORY");
    expect(result.totalSteps).toBe(7);
    expect(result.finalState.player.position).toEqual({ x: 2, y: 0 });
    expect(result.finalState.player.direction).toBe("UP");
    expect(result.finalState.player.collectedShards).toContain("shard-1");

    // Validasi Event Trace
    // Harus ada 7 pasang STEP_START dan STEP_COMPLETE + 1 VICTORY event
    const startEvents = result.events.filter((e) => e.type === "STEP_START");
    const completeEvents = result.events.filter((e) => e.type === "STEP_COMPLETE");
    const victoryEvents = result.events.filter((e) => e.type === "VICTORY");

    expect(startEvents).toHaveLength(7);
    expect(completeEvents).toHaveLength(7);
    expect(victoryEvents).toHaveLength(1);

    // Periksa bahwa nodeId dan stepNumber cocok berurutan
    for (let i = 0; i < 7; i++) {
      expect(startEvents[i].stepNumber).toBe(i + 1);
      expect(startEvents[i].nodeId).toBe(`node-${i + 1}`);
      expect(completeEvents[i].stepNumber).toBe(i + 1);
      expect(completeEvents[i].nodeId).toBe(`node-${i + 1}`);
    }
  });

  it("stops execution immediately upon encountering an error without running subsequent steps", () => {
    // Mulai di (0, 0) menghadap UP -> STEP_FORWARD langsung menabrak dinding utara
    const nodes = [
      createActionNode("STEP_FORWARD", "node-err"),
      createActionNode("TURN_RIGHT", "node-should-not-run"),
      createActionNode("STEP_FORWARD", "node-also-skipped"),
    ];

    const program: SpellProgram = {
      version: 1,
      nodes,
    };

    const initialState = createInitialGridState({
      ...baseConfig,
      playerStart: { x: 0, y: 0, direction: "UP" },
    });

    const result = runSpellProgram(program, initialState, 3);

    expect(result.status).toBe("FAILED");
    expect(result.totalSteps).toBe(1);
    expect(result.errorDetails?.nodeId).toBe("node-err");

    // Periksa event ERROR dipancarkan
    const errorEvent = result.events.find((e) => e.type === "ERROR");
    expect(errorEvent).toBeDefined();
    expect(errorEvent?.nodeId).toBe("node-err");
  });
});
