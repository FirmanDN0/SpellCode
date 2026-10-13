import { describe, it, expect } from "vitest";
import { createSpellVM } from "@/lib/engine/vm";
import { runSpellProgram } from "@/lib/engine/runner";
import { applyStep, createInitialGridState } from "@/lib/engine/grid";
import { createActionNode } from "@/lib/engine/ast";
import { SpellProgram } from "@/lib/engine/types";
import { validateProgram } from "@/lib/engine/validator";

describe("Engine: Step, Run, Reset, and Clear Mechanics", () => {
  const levelConfig = {
    width: 4,
    height: 4,
    obstacles: [],
    shards: [{ id: "shard-1", x: 1, y: 0 }],
    torches: [{ id: "torch-1", x: 2, y: 0 }],
    portal: { x: 3, y: 0 },
    playerStart: { x: 0, y: 0, direction: "RIGHT" as const },
  };

  const program: SpellProgram = {
    version: 1,
    nodes: [
      createActionNode("STEP_FORWARD", "step-1"),
      createActionNode("COLLECT_SHARD", "step-2"),
      createActionNode("STEP_FORWARD", "step-3"),
      createActionNode("LIGHT_TORCH", "step-4"),
      createActionNode("STEP_FORWARD", "step-5"),
    ],
  };

  it("supports granular Step-by-Step execution via createSpellVM", () => {
    let currentState = createInitialGridState(levelConfig);
    const vm = createSpellVM(program, {
      getState: () => currentState,
    });

    // Step 1: STEP_FORWARD -> ke (1, 0)
    const step1 = vm.next();
    expect(step1.done).toBe(false);
    expect(step1.value?.activeNodeId).toBe("step-1");
    currentState = applyStep(currentState, step1.value!);
    expect(currentState.player.position).toEqual({ x: 1, y: 0 });
    expect(currentState.player.collectedShards).toHaveLength(0);

    // Step 2: COLLECT_SHARD -> ambil shard-1
    const step2 = vm.next();
    expect(step2.done).toBe(false);
    expect(step2.value?.activeNodeId).toBe("step-2");
    currentState = applyStep(currentState, step2.value!);
    expect(currentState.player.collectedShards).toContain("shard-1");

    // Step 3: STEP_FORWARD -> ke (2, 0)
    const step3 = vm.next();
    currentState = applyStep(currentState, step3.value!);
    expect(currentState.player.position).toEqual({ x: 2, y: 0 });

    // Step 4: LIGHT_TORCH -> nyalakan torch-1
    const step4 = vm.next();
    currentState = applyStep(currentState, step4.value!);
    expect(currentState.player.litTorches).toContain("torch-1");

    // Step 5: STEP_FORWARD -> ke (3, 0) portal
    const step5 = vm.next();
    currentState = applyStep(currentState, step5.value!);
    expect(currentState.player.position).toEqual({ x: 3, y: 0 });

    // Step 6: Selesai
    const step6 = vm.next();
    expect(step6.done).toBe(true);
  });

  it("produces identical final state between Step and Run execution", () => {
    const initialState = createInitialGridState(levelConfig);

    // 1. Jalankan via Step manual
    let stepState = { ...initialState };
    const vm = createSpellVM(program, { getState: () => stepState });
    for (const step of vm) {
      stepState = applyStep(stepState, step);
    }

    // 2. Jalankan via runSpellProgram
    const runResult = runSpellProgram(program, initialState, 5);

    expect(runResult.finalState.player.position).toEqual(stepState.player.position);
    expect(runResult.finalState.player.collectedShards).toEqual(stepState.player.collectedShards);
    expect(runResult.finalState.player.litTorches).toEqual(stepState.player.litTorches);
    expect(runResult.finalState.player.manaUsed).toEqual(stepState.player.manaUsed);
  });

  it("resets state completely to initial baseline without residual side effects", () => {
    const initialState = createInitialGridState(levelConfig);

    // Jalankan program sehingga state berubah drastis
    const runResult = runSpellProgram(program, initialState, 5);
    expect(runResult.finalState.player.position).toEqual({ x: 3, y: 0 });
    expect(runResult.finalState.player.manaUsed).toBe(5);

    // Reset: buat ulang initial state dari konfigurasi
    const resetState = createInitialGridState(levelConfig);

    expect(resetState.player.position).toEqual({ x: 0, y: 0 });
    expect(resetState.player.direction).toBe("RIGHT");
    expect(resetState.player.manaUsed).toBe(0);
    expect(resetState.player.collectedShards).toHaveLength(0);
    expect(resetState.player.litTorches).toHaveLength(0);
    expect(resetState.status).toBe("IDLE");
  });

  it("validates empty program when cleared", () => {
    const emptyProgram: SpellProgram = {
      version: 1,
      nodes: [],
    };

    const validation = validateProgram(emptyProgram);
    expect(validation.isValid).toBe(false);
    expect(validation.errors[0]).toContain("Meja mantra masih kosong");
  });
});
