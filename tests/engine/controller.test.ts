import { describe, it, expect, vi } from "vitest";
import { ExecutionController } from "@/lib/engine/controller";
import { createInitialGridState } from "@/lib/engine/grid";
import { createActionNode, createRepeatNode } from "@/lib/engine/ast";
import { SpellProgram } from "@/lib/engine/types";
import {
  fixtureMoveStraight,
  fixtureTurnCorner,
  fixtureObstacleDetour,
} from "@/lib/levels/fixtures";

describe("Tahap 3B: Execution Controller, Step Mode, and Reset", () => {
  const initialWorld = createInitialGridState(fixtureMoveStraight.grid);

  const validProgram: SpellProgram = {
    version: 1,
    nodes: [
      createActionNode("STEP_FORWARD", "m1"),
      createActionNode("STEP_FORWARD", "m2"),
    ],
  };

  describe("1. Lifecycle & Status Transitions (IDLE, RUNNING, COMPLETED, FAILED)", () => {
    it("initializes in IDLE state with clean snapshots and canStep/canRun enabled", () => {
      const controller = new ExecutionController(
        { initialWorldState: initialWorld, parSteps: 2 },
        validProgram
      );

      const snapshot = controller.getSnapshot();
      expect(snapshot.status).toBe("IDLE");
      expect(snapshot.stepsTaken).toBe(0);
      expect(snapshot.activeNodeId).toBeUndefined();
      expect(snapshot.events).toHaveLength(0);
      expect(snapshot.canStep).toBe(true);
      expect(snapshot.canRun).toBe(true);
      expect(snapshot.canReset).toBe(false);
    });

    it("transitions from IDLE -> RUNNING -> COMPLETED on successful run", async () => {
      const controller = new ExecutionController(
        { initialWorldState: initialWorld, parSteps: 2 },
        validProgram
      );

      const statusLog: string[] = [];
      controller.subscribe((s) => statusLog.push(s.status));

      const result = await controller.run();

      expect(result.status).toBe("VICTORY");
      expect(controller.getSnapshot().status).toBe("COMPLETED");
      expect(controller.getSnapshot().worldState.player.position).toEqual({ x: 2, y: 1 });
      expect(controller.getSnapshot().evaluation?.isVictory).toBe(true);
      expect(statusLog).toContain("RUNNING");
      expect(statusLog[statusLog.length - 1]).toBe("COMPLETED");
    });

    it("transitions to FAILED when program does not meet level objective", async () => {
      // Program hanya 1 langkah (belum sampai ke portal)
      const incompleteProgram: SpellProgram = {
        version: 1,
        nodes: [createActionNode("STEP_FORWARD", "step-only-1")],
      };

      const controller = new ExecutionController(
        { initialWorldState: initialWorld, parSteps: 2 },
        incompleteProgram
      );

      const result = await controller.run();

      expect(result.status).toBe("FAILED");
      expect(controller.getSnapshot().status).toBe("FAILED");
      expect(controller.getSnapshot().errorDetails?.code).toBe("UNREACHED_PORTAL");
      expect(controller.getSnapshot().errorDetails?.kidExplanation).toBeDefined();
    });
  });

  describe("2. Step Mode granular execution", () => {
    it("executes exact next instruction one by one with state verification", () => {
      const controller = new ExecutionController(
        { initialWorldState: initialWorld, parSteps: 2 },
        validProgram
      );

      // Langkah 1: STEP_FORWARD -> ke (1, 1)
      const hasNext1 = controller.step();
      expect(hasNext1).toBe(true);
      let snapshot = controller.getSnapshot();
      expect(snapshot.status).toBe("RUNNING");
      expect(snapshot.stepsTaken).toBe(1);
      expect(snapshot.activeNodeId).toBe("m1");
      expect(snapshot.worldState.player.position).toEqual({ x: 1, y: 1 });

      // Langkah 2: STEP_FORWARD -> ke (2, 1) portal
      const hasNext2 = controller.step();
      expect(hasNext2).toBe(true);
      snapshot = controller.getSnapshot();
      expect(snapshot.stepsTaken).toBe(2);
      expect(snapshot.activeNodeId).toBe("m2");
      expect(snapshot.worldState.player.position).toEqual({ x: 2, y: 1 });

      // Langkah 3: Finalisasi selesai
      const hasNext3 = controller.step();
      expect(hasNext3).toBe(false);
      snapshot = controller.getSnapshot();
      expect(snapshot.status).toBe("COMPLETED");
      expect(snapshot.evaluation?.isVictory).toBe(true);
    });
  });

  describe("3. Reset and Clear Mechanics", () => {
    it("resets world state and controller back to pristine initial state", () => {
      const controller = new ExecutionController(
        { initialWorldState: initialWorld, parSteps: 2 },
        validProgram
      );

      // Jalankan 1 langkah
      controller.step();
      expect(controller.getSnapshot().stepsTaken).toBe(1);
      expect(controller.getSnapshot().canReset).toBe(true);

      // Reset
      controller.reset();
      const resetSnapshot = controller.getSnapshot();
      expect(resetSnapshot.status).toBe("IDLE");
      expect(resetSnapshot.stepsTaken).toBe(0);
      expect(resetSnapshot.activeNodeId).toBeUndefined();
      expect(resetSnapshot.worldState.player.position).toEqual({ x: 0, y: 1 });
      expect(resetSnapshot.worldState.player.manaUsed).toBe(0);
      expect(resetSnapshot.events).toHaveLength(0);
    });

    it("clears program nodes and updates snapshot safely", () => {
      const controller = new ExecutionController(
        { initialWorldState: initialWorld, parSteps: 2 },
        validProgram
      );

      controller.clearProgram();
      const snapshot = controller.getSnapshot();
      expect(snapshot.program.nodes).toHaveLength(0);
      expect(snapshot.canRun).toBe(false);
      expect(snapshot.canStep).toBe(false);
    });
  });

  describe("4. Double Run Protection & Execution Guard", () => {
    it("rejects parallel execution when Run is called while already running", async () => {
      const controller = new ExecutionController(
        { initialWorldState: initialWorld, parSteps: 2 },
        validProgram
      );

      // Jalankan dalam mode animasi bertahap (speedMs > 0)
      const firstRunPromise = controller.run({ speedMs: 50 });

      // Panggilan kedua saat program masih aktif berjalan
      await expect(controller.run({ speedMs: 50 })).rejects.toThrow(
        "DOUBLE_RUN_PREVENTED"
      );

      // Tunggu hingga eksekusi pertama selesai secara normal
      const firstResult = await firstRunPromise;
      expect(firstResult.status).toBe("VICTORY");
      expect(controller.getSnapshot().status).toBe("COMPLETED");
    });
  });

  describe("5. Program Changes While Running", () => {
    it("safely resets and applies new program when setProgram is called during active run", async () => {
      const controller = new ExecutionController(
        { initialWorldState: initialWorld, parSteps: 2 },
        validProgram
      );

      // Mulai run bertahap
      controller.run({ speedMs: 100 });
      expect(controller.getSnapshot().status).toBe("RUNNING");

      // Modifikasi program di tengah eksekusi
      const newProgram: SpellProgram = {
        version: 1,
        nodes: [createActionNode("TURN_RIGHT", "new-turn")],
      };
      controller.setProgram(newProgram);

      // Controller harus dihentikan dan di-reset dengan program baru
      const snapshot = controller.getSnapshot();
      expect(snapshot.status).toBe("IDLE");
      expect(snapshot.program.nodes[0].id).toBe("new-turn");
      expect(snapshot.stepsTaken).toBe(0);
    });
  });

  describe("6. Instruction Failures & Instruction Limits", () => {
    it("halts and captures child-friendly error when colliding with obstacle", async () => {
      // Pada fixtureTurnCorner, rintangan batu ada di (2, 0).
      // Mulai di (0, 0) menghadap RIGHT.
      // Jika melangkah 2 kali -> menabrak batu di (2, 0).
      const hitObstacleProgram: SpellProgram = {
        version: 1,
        nodes: [
          createActionNode("STEP_FORWARD", "step-1"),
          createActionNode("STEP_FORWARD", "step-crash"),
        ],
      };

      const cornerWorld = createInitialGridState(fixtureTurnCorner.grid);
      const controller = new ExecutionController(
        { initialWorldState: cornerWorld, parSteps: 4 },
        hitObstacleProgram
      );

      const result = await controller.run();

      expect(result.status).toBe("FAILED");
      expect(controller.getSnapshot().status).toBe("FAILED");
      expect(controller.getSnapshot().misfireNodeId).toBe("step-crash");
      expect(controller.getSnapshot().errorDetails?.code).toBe("OBSTACLE_HIT");
      expect(controller.getSnapshot().errorDetails?.kidExplanation).toContain("terhalang");
    });

    it("enforces maxSteps instruction limit with MANA_OVERFLOW error", async () => {
      // Loop berputar di tempat: maxSteps disetel ke 5
      const infiniteLoopProgram: SpellProgram = {
        version: 1,
        nodes: [
          createRepeatNode(20, [createActionNode("TURN_LEFT", "infinite-turn")]),
        ],
      };

      const controller = new ExecutionController(
        { initialWorldState: initialWorld, parSteps: 2, maxSteps: 5 },
        infiniteLoopProgram
      );

      const result = await controller.run();

      expect(result.status).toBe("FAILED");
      expect(controller.getSnapshot().status).toBe("FAILED");
      expect(controller.getSnapshot().errorDetails?.code).toBe("MANA_OVERFLOW");
      expect(controller.getSnapshot().stepsTaken).toBe(5);
    });
  });

  describe("7. Subscription & Listener Notifications", () => {
    it("notifies listeners on each step and state transition", () => {
      const controller = new ExecutionController(
        { initialWorldState: initialWorld, parSteps: 2 },
        validProgram
      );

      const listener = vi.fn();
      const unsubscribe = controller.subscribe(listener);

      // Dipanggil pertama kali saat subscribe
      expect(listener).toHaveBeenCalledTimes(1);

      controller.step();
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
      controller.step();
      expect(listener).toHaveBeenCalledTimes(2); // Tidak dipanggil lagi setelah unsubscribe
    });
  });
});
