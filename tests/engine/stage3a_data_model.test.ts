import { describe, it, expect } from "vitest";
import {
  createInitialGridState,
  generateTilesMatrix,
  applyStep,
  canExecuteInstruction,
  getNextDirection,
  getForwardPosition,
} from "@/lib/engine/grid";
import { evaluateLevelState } from "@/lib/engine/evaluator";
import { runSpellProgram } from "@/lib/engine/runner";
import { createActionNode } from "@/lib/engine/ast";
import {
  CharacterState,
  CommandType,
  Direction,
  ExecutionStep,
  Position,
  SpellProgram,
  WorldState,
} from "@/lib/engine/types";
import {
  fixtureMoveStraight,
  fixtureTurnCorner,
  fixtureLightTorch,
  fixtureCollectShard,
  fixtureActivateAction,
  fixtureObstacleDetour,
} from "@/lib/levels/fixtures";

describe("Tahap 3A: Data Model and Basic Instructions", () => {
  describe("1. State Model and Tile Generation", () => {
    it("creates pristine WorldState with synchronized character and player references", () => {
      const state: WorldState = createInitialGridState(fixtureMoveStraight.grid);

      expect(state.width).toBe(3);
      expect(state.height).toBe(3);
      expect(state.status).toBe("IDLE");
      expect(state.player.position).toEqual({ x: 0, y: 1 });
      expect(state.player.direction).toBe("RIGHT");
      expect(state.player.manaUsed).toBe(0);
      expect(state.player.isAlive).toBe(true);

      // Karakter dan player merujuk ke data yang sinkron
      expect(state.character).toBe(state.player);
      expect(state.tiles).toBeDefined();
      expect(state.tiles?.length).toBe(3); // 3 baris
      expect(state.tiles?.[0].length).toBe(3); // 3 kolom
    });

    it("generates 2D tile matrix with accurate tile types and metadata", () => {
      const obstacles: Position[] = [{ x: 1, y: 1 }];
      const shards = [{ id: "s1", x: 2, y: 0 }];
      const torches = [{ id: "t1", x: 0, y: 2 }];
      const portal: Position = { x: 2, y: 2 };

      const tiles = generateTilesMatrix(3, 3, obstacles, shards, torches, portal);

      expect(tiles[1][1].type).toBe("OBSTACLE");
      expect(tiles[1][1].hasObstacle).toBe(true);

      expect(tiles[0][2].type).toBe("SHARD");
      expect(tiles[0][2].hasShard).toBe(true);

      expect(tiles[2][0].type).toBe("TORCH");
      expect(tiles[2][0].hasTorch).toBe(true);

      expect(tiles[2][2].type).toBe("PORTAL");
      expect(tiles[2][2].isPortal).toBe(true);

      expect(tiles[0][0].type).toBe("EMPTY");
      expect(tiles[0][0].hasObstacle).toBe(false);
    });
  });

  describe("2. Instruction Validation on Current State", () => {
    it("validates STEP_FORWARD against boundary walls", () => {
      // Posisi di tepi pulau (0, 0) menghadap ke UP (keluar arena)
      const state = createInitialGridState({
        width: 3,
        height: 3,
        obstacles: [],
        shards: [],
        torches: [],
        portal: { x: 2, y: 2 },
        playerStart: { x: 0, y: 0, direction: "UP" },
      });

      const validation = canExecuteInstruction("STEP_FORWARD", state);
      expect(validation.canExecute).toBe(false);
      expect(validation.errorCode).toBe("WALL_COLLISION");
      expect(validation.kidExplanation).toContain("Hampir jatuh");
    });

    it("validates STEP_FORWARD against obstacle boulders", () => {
      // Posisi di (1, 0) menghadap ke DOWN, rintangan di (1, 1)
      const state = createInitialGridState({
        width: 3,
        height: 3,
        obstacles: [{ x: 1, y: 1 }],
        shards: [],
        torches: [],
        portal: { x: 2, y: 2 },
        playerStart: { x: 1, y: 0, direction: "DOWN" },
      });

      const validation = canExecuteInstruction("STEP_FORWARD", state);
      expect(validation.canExecute).toBe(false);
      expect(validation.errorCode).toBe("OBSTACLE_HIT");
      expect(validation.kidExplanation).toContain("terhalang semak");
    });

    it("validates LIGHT_TORCH: requires standing on unlit torch", () => {
      const stateWithTorch = createInitialGridState({
        width: 3,
        height: 3,
        obstacles: [],
        shards: [],
        torches: [{ id: "t1", x: 1, y: 1 }],
        portal: { x: 2, y: 2 },
        playerStart: { x: 1, y: 1, direction: "RIGHT" },
      });

      // Valid saat berdiri di atas lentera belum menyala
      expect(canExecuteInstruction("LIGHT_TORCH", stateWithTorch).canExecute).toBe(true);

      // Tidak valid saat lentera sudah menyala
      const stateAlreadyLit = {
        ...stateWithTorch,
        player: { ...stateWithTorch.player, litTorches: ["t1"] },
      };
      const litValidation = canExecuteInstruction("LIGHT_TORCH", stateAlreadyLit);
      expect(litValidation.canExecute).toBe(false);
      expect(litValidation.errorCode).toBe("EMPTY_ACTION");

      // Tidak valid saat di petak kosong tanpa lentera
      const emptyTileState = {
        ...stateWithTorch,
        player: { ...stateWithTorch.player, position: { x: 0, y: 0 } },
      };
      const emptyValidation = canExecuteInstruction("LIGHT_TORCH", emptyTileState);
      expect(emptyValidation.canExecute).toBe(false);
      expect(emptyValidation.errorCode).toBe("EMPTY_ACTION");
    });

    it("validates COLLECT_SHARD: requires standing on uncollected shard", () => {
      const stateWithShard = createInitialGridState({
        width: 3,
        height: 3,
        obstacles: [],
        shards: [{ id: "s1", x: 1, y: 1 }],
        torches: [],
        portal: { x: 2, y: 2 },
        playerStart: { x: 1, y: 1, direction: "RIGHT" },
      });

      expect(canExecuteInstruction("COLLECT_SHARD", stateWithShard).canExecute).toBe(true);

      const stateAlreadyCollected = {
        ...stateWithShard,
        player: { ...stateWithShard.player, collectedShards: ["s1"] },
      };
      expect(canExecuteInstruction("COLLECT_SHARD", stateAlreadyCollected).canExecute).toBe(false);
    });

    it("validates ACTIVATE: checks for interactable object presence", () => {
      const state = createInitialGridState(fixtureActivateAction.grid);

      // Di (0, 1) petak kosong -> tidak ada yang diaktifkan
      expect(canExecuteInstruction("ACTIVATE", state).canExecute).toBe(false);

      // Pindahkan ke (1, 1) petak lentera -> valid
      const atTorchState = {
        ...state,
        player: { ...state.player, position: { x: 1, y: 1 } },
      };
      expect(canExecuteInstruction("ACTIVATE", atTorchState).canExecute).toBe(true);
    });

    it("validates TURN and CAST_SPELL as always executable", () => {
      const state = createInitialGridState(fixtureMoveStraight.grid);
      expect(canExecuteInstruction("TURN_LEFT", state).canExecute).toBe(true);
      expect(canExecuteInstruction("TURN_RIGHT", state).canExecute).toBe(true);
      expect(canExecuteInstruction("CAST_SPELL", state).canExecute).toBe(true);
    });
  });

  describe("3. Basic Instructions Execution (Move, Turn, Activate, Cast)", () => {
    it("executes Move (STEP_FORWARD) immutably updating position and mana", () => {
      const state = createInitialGridState(fixtureMoveStraight.grid);
      const step: ExecutionStep = { activeNodeId: "n1", command: "STEP_FORWARD", stepNumber: 1 };

      const next = applyStep(state, step);

      expect(state.player.position).toEqual({ x: 0, y: 1 }); // Immutabilitas
      expect(next.player.position).toEqual({ x: 1, y: 1 });
      expect(next.player.manaUsed).toBe(1);
      expect(next.character?.position).toEqual({ x: 1, y: 1 });
    });

    it("executes Turn (TURN_LEFT, TURN_RIGHT) rotating character direction", () => {
      let state = createInitialGridState(fixtureMoveStraight.grid); // Awal: RIGHT

      state = applyStep(state, { activeNodeId: "n1", command: "TURN_LEFT", stepNumber: 1 });
      expect(state.player.direction).toBe("UP");

      state = applyStep(state, { activeNodeId: "n2", command: "TURN_RIGHT", stepNumber: 2 });
      expect(state.player.direction).toBe("RIGHT");

      state = applyStep(state, { activeNodeId: "n3", command: "TURN_RIGHT", stepNumber: 3 });
      expect(state.player.direction).toBe("DOWN");
    });

    it("executes Activate on torch tile to light the torch", () => {
      const state = createInitialGridState(fixtureLightTorch.grid);
      // Pindahkan penyihir ke (1, 1) di atas lentera
      const atTorch = {
        ...state,
        player: { ...state.player, position: { x: 1, y: 1 } },
      };

      const result = applyStep(atTorch, {
        activeNodeId: "act-torch",
        command: "ACTIVATE",
        stepNumber: 1,
      });

      expect(result.player.litTorches).toContain("torch-1");
      expect(result.character?.litTorches).toContain("torch-1");
    });

    it("executes Activate on shard tile to collect the shard", () => {
      const state = createInitialGridState(fixtureCollectShard.grid);
      const atShard = {
        ...state,
        player: { ...state.player, position: { x: 1, y: 1 } },
      };

      const result = applyStep(atShard, {
        activeNodeId: "act-shard",
        command: "ACTIVATE",
        stepNumber: 1,
      });

      expect(result.player.collectedShards).toContain("shard-1");
    });

    it("executes CAST_SPELL consuming mana without altering position", () => {
      const state = createInitialGridState(fixtureMoveStraight.grid);
      const result = applyStep(state, {
        activeNodeId: "cast-1",
        command: "CAST_SPELL",
        stepNumber: 1,
      });

      expect(result.player.manaUsed).toBe(1);
      expect(result.player.position).toEqual(state.player.position);
      expect(result.status).toBe("RUNNING");
    });
  });

  describe("4. End-to-End Execution on Level Fixtures", () => {
    it("solves fixtureMoveStraight with optimal par steps (3 stars)", () => {
      const program: SpellProgram = {
        version: 1,
        nodes: [
          createActionNode("STEP_FORWARD", "m1"),
          createActionNode("STEP_FORWARD", "m2"),
        ],
      };

      const state = createInitialGridState(fixtureMoveStraight.grid);
      const result = runSpellProgram(program, state, fixtureMoveStraight.parSteps);

      expect(result.status).toBe("VICTORY");
      expect(result.totalSteps).toBe(2);
      expect(result.evaluation.stars).toBe(3);
      expect(result.evaluation.atPortal).toBe(true);
      expect(result.evaluation.objectives?.[0].isCompleted).toBe(true);
    });

    it("solves fixtureTurnCorner by turning right and moving to portal", () => {
      // Jalur: (0, 0) RIGHT -> Maju (1, 0) -> Belok Kanan (DOWN) -> Maju (1, 1) -> Maju (1, 2)
      const program: SpellProgram = {
        version: 1,
        nodes: [
          createActionNode("STEP_FORWARD", "m1"),
          createActionNode("TURN_RIGHT", "t1"),
          createActionNode("STEP_FORWARD", "m2"),
          createActionNode("STEP_FORWARD", "m3"),
        ],
      };

      const state = createInitialGridState(fixtureTurnCorner.grid);
      const result = runSpellProgram(program, state, fixtureTurnCorner.parSteps);

      expect(result.status).toBe("VICTORY");
      expect(result.totalSteps).toBe(4);
      expect(result.evaluation.stars).toBe(3);
    });

    it("solves fixtureLightTorch with sequential Move + Light + Move", () => {
      // Mulai di (0, 1) RIGHT -> Maju (1, 1) -> Nyalakan Lentera -> Maju (2, 1) -> Maju (3, 1)
      const program: SpellProgram = {
        version: 1,
        nodes: [
          createActionNode("STEP_FORWARD", "m1"),
          createActionNode("LIGHT_TORCH", "l1"),
          createActionNode("STEP_FORWARD", "m2"),
          createActionNode("STEP_FORWARD", "m3"),
        ],
      };

      const state = createInitialGridState(fixtureLightTorch.grid);
      const result = runSpellProgram(program, state, fixtureLightTorch.parSteps);

      expect(result.status).toBe("VICTORY");
      expect(result.evaluation.stars).toBe(3);
      expect(result.finalState.player.litTorches).toContain("torch-1");
    });

    it("solves fixtureCollectShard with sequential Move + Collect + Move", () => {
      const program: SpellProgram = {
        version: 1,
        nodes: [
          createActionNode("STEP_FORWARD", "m1"),
          createActionNode("COLLECT_SHARD", "c1"),
          createActionNode("STEP_FORWARD", "m2"),
          createActionNode("STEP_FORWARD", "m3"),
        ],
      };

      const state = createInitialGridState(fixtureCollectShard.grid);
      const result = runSpellProgram(program, state, fixtureCollectShard.parSteps);

      expect(result.status).toBe("VICTORY");
      expect(result.evaluation.stars).toBe(3);
      expect(result.finalState.player.collectedShards).toContain("shard-1");
    });

    it("navigates around obstacle in fixtureObstacleDetour", () => {
      // Dari (0, 1) RIGHT, rintangan ada di (1, 1) dan (2, 1), portal di (3, 1).
      // Rute memutar utara:
      // 1. Belok Kiri (UP)
      // 2. Maju ke (0, 0)
      // 3. Belok Kanan (RIGHT)
      // 4. Maju ke (1, 0)
      // 5. Maju ke (2, 0)
      // 6. Maju ke (3, 0)
      // 7. Belok Kanan (DOWN)
      // 8. Maju ke (3, 1) portal!
      const program: SpellProgram = {
        version: 1,
        nodes: [
          createActionNode("TURN_LEFT", "t1"),
          createActionNode("STEP_FORWARD", "m1"),
          createActionNode("TURN_RIGHT", "t2"),
          createActionNode("STEP_FORWARD", "m2"),
          createActionNode("STEP_FORWARD", "m3"),
          createActionNode("STEP_FORWARD", "m4"),
          createActionNode("TURN_RIGHT", "t3"),
          createActionNode("STEP_FORWARD", "m5"),
        ],
      };

      const state = createInitialGridState(fixtureObstacleDetour.grid);
      const result = runSpellProgram(program, state, 8);

      expect(result.status).toBe("VICTORY");
      expect(result.finalState.player.position).toEqual({ x: 3, y: 1 });
    });
  });

  describe("5. Structured Events for UI Animation & Debugging", () => {
    it("generates detailed event stream with start and complete pairs", () => {
      const program: SpellProgram = {
        version: 1,
        nodes: [
          createActionNode("STEP_FORWARD", "n1"),
          createActionNode("TURN_RIGHT", "n2"),
        ],
      };

      const state = createInitialGridState(fixtureMoveStraight.grid);
      const result = runSpellProgram(program, state, 2);

      const starts = result.events.filter((e) => e.type === "STEP_START");
      const completes = result.events.filter((e) => e.type === "STEP_COMPLETE");

      expect(starts).toHaveLength(2);
      expect(completes).toHaveLength(2);

      // Verifikasi payload metadata event
      expect(starts[0].nodeId).toBe("n1");
      expect(starts[0].command).toBe("STEP_FORWARD");
      expect(completes[0].nodeId).toBe("n1");
      expect(completes[0].playerState.position).toEqual({ x: 1, y: 1 });

      expect(starts[1].nodeId).toBe("n2");
      expect(starts[1].command).toBe("TURN_RIGHT");
      expect(completes[1].playerState.direction).toBe("DOWN");
    });
  });
});
