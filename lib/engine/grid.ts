import { createEngineError } from "./errors";
import {
  CharacterState,
  CommandType,
  Direction,
  ExecutionStep,
  GridPosition,
  InstructionValidationResult,
  LevelGridState,
  Position,
  ShardEntity,
  Tile,
  TileType,
  TorchEntity,
  WorldState,
} from "./types";

export interface InitialGridConfig {
  width: number;
  height: number;
  obstacles: GridPosition[];
  shards: ShardEntity[];
  torches: TorchEntity[];
  portal: GridPosition;
  playerStart: {
    x: number;
    y: number;
    direction: Direction;
  };
}

/**
 * Menghasilkan matriks 2D Tile untuk pemetaan visual arena.
 */
export function generateTilesMatrix(
  width: number,
  height: number,
  obstacles: Position[],
  shards: ShardEntity[],
  torches: TorchEntity[],
  portal: Position
): Tile[][] {
  const tiles: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Tile[] = [];
    for (let x = 0; x < width; x++) {
      const hasObstacle = obstacles.some((o) => o.x === x && o.y === y);
      const hasShard = shards.some((s) => s.x === x && s.y === y);
      const hasTorch = torches.some((t) => t.x === x && t.y === y);
      const isPortal = portal.x === x && portal.y === y;

      let type: TileType = "EMPTY";
      if (hasObstacle) type = "OBSTACLE";
      else if (isPortal) type = "PORTAL";
      else if (hasTorch) type = "TORCH";
      else if (hasShard) type = "SHARD";

      row.push({
        x,
        y,
        type,
        hasObstacle,
        hasShard,
        hasTorch,
        isPortal,
      });
    }
    tiles.push(row);
  }
  return tiles;
}

/**
 * Membuat state grid dan dunia awal yang murni dan bersih dari konfigurasi level.
 */
export function createInitialGridState(config: InitialGridConfig): WorldState {
  const character: CharacterState = {
    position: { x: config.playerStart.x, y: config.playerStart.y },
    direction: config.playerStart.direction,
    manaUsed: 0,
    collectedShards: [],
    litTorches: [],
    isAlive: true,
  };

  const obstacles = config.obstacles.map((o) => ({ ...o }));
  const shards = config.shards.map((s) => ({ ...s }));
  const torches = config.torches.map((t) => ({ ...t }));
  const portal = { ...config.portal };

  const tiles = generateTilesMatrix(
    config.width,
    config.height,
    obstacles,
    shards,
    torches,
    portal
  );

  return {
    width: config.width,
    height: config.height,
    obstacles,
    shards,
    torches,
    portal,
    tiles,
    character,
    player: character,
    status: "IDLE",
  };
}

export function getNextDirection(current: Direction, turn: "LEFT" | "RIGHT"): Direction {
  const directions: Direction[] = ["UP", "RIGHT", "DOWN", "LEFT"];
  const currentIndex = directions.indexOf(current);

  if (turn === "RIGHT") {
    return directions[(currentIndex + 1) % 4];
  } else {
    return directions[(currentIndex + 3) % 4];
  }
}

export function getForwardPosition(pos: GridPosition, dir: Direction): GridPosition {
  switch (dir) {
    case "UP":
      return { x: pos.x, y: pos.y - 1 };
    case "RIGHT":
      return { x: pos.x + 1, y: pos.y };
    case "DOWN":
      return { x: pos.x, y: pos.y + 1 };
    case "LEFT":
      return { x: pos.x - 1, y: pos.y };
  }
}

export function isOutOfBounds(pos: GridPosition, width: number, height: number): boolean {
  return pos.x < 0 || pos.x >= width || pos.y < 0 || pos.y >= height;
}

export function isObstacle(pos: GridPosition, obstacles: GridPosition[]): boolean {
  return obstacles.some((obs) => obs.x === pos.x && obs.y === pos.y);
}

/**
 * Memvalidasi apakah instruksi dapat dieksekusi secara valid pada state saat ini.
 */
export function canExecuteInstruction(
  command: CommandType,
  state: LevelGridState
): InstructionValidationResult {
  const pos = state.player.position;

  switch (command) {
    case "STEP_FORWARD": {
      const nextPos = getForwardPosition(pos, state.player.direction);
      if (isOutOfBounds(nextPos, state.width, state.height)) {
        return {
          canExecute: false,
          errorCode: "WALL_COLLISION",
          reason: "Langkah ke depan akan keluar dari batas arena pulau sihir.",
          kidExplanation: "Hampir jatuh dari pulau sihir! Coba berbelok terlebih dahulu.",
        };
      }
      if (isObstacle(nextPos, state.obstacles)) {
        return {
          canExecute: false,
          errorCode: "OBSTACLE_HIT",
          reason: "Langkah ke depan terhalang rintangan batuan atau semak.",
          kidExplanation: "Ups, terhalang semak berduri atau batu besar! Gunakan rune belok.",
        };
      }
      return { canExecute: true };
    }

    case "TURN_LEFT":
    case "TURN_RIGHT":
      return { canExecute: true };

    case "LIGHT_TORCH": {
      const torch = state.torches.find((t) => t.x === pos.x && t.y === pos.y);
      if (!torch) {
        return {
          canExecute: false,
          errorCode: "EMPTY_ACTION",
          reason: "Tidak ada lentera di petak tempat penyihir berdiri saat ini.",
          kidExplanation: "Mantra tidak menemukan lentera di sini! Berdirilah di atas lentera terlebih dahulu.",
        };
      }
      if (state.player.litTorches.includes(torch.id)) {
        return {
          canExecute: false,
          errorCode: "EMPTY_ACTION",
          reason: "Lentera di petak ini sudah dinyalakan.",
          kidExplanation: "Lentera ini sudah berkobar terang! Lanjutkan petualanganmu.",
        };
      }
      return { canExecute: true };
    }

    case "COLLECT_SHARD": {
      const shard = state.shards.find((s) => s.x === pos.x && s.y === pos.y);
      if (!shard) {
        return {
          canExecute: false,
          errorCode: "EMPTY_ACTION",
          reason: "Tidak ada kristal mana di petak tempat penyihir berdiri saat ini.",
          kidExplanation: "Tidak ada kristal di sini! Petik kristal saat berada di atasnya.",
        };
      }
      if (state.player.collectedShards.includes(shard.id)) {
        return {
          canExecute: false,
          errorCode: "EMPTY_ACTION",
          reason: "Kristal mana di petak ini sudah pernah dikoleksi.",
          kidExplanation: "Kristal ini sudah masuk ke sakumu!",
        };
      }
      return { canExecute: true };
    }

    case "ACTIVATE": {
      const hasTorch = state.torches.some(
        (t) => t.x === pos.x && t.y === pos.y && !state.player.litTorches.includes(t.id)
      );
      const hasShard = state.shards.some(
        (s) => s.x === pos.x && s.y === pos.y && !state.player.collectedShards.includes(s.id)
      );
      const isPortal = state.portal.x === pos.x && state.portal.y === pos.y;

      if (!hasTorch && !hasShard && !isPortal) {
        return {
          canExecute: false,
          errorCode: "EMPTY_ACTION",
          reason: "Tidak ada objek yang dapat diaktivasi di petak saat ini.",
          kidExplanation: "Tidak ada apa-apa untuk diaktifkan di petak ini!",
        };
      }
      return { canExecute: true };
    }

    case "CAST_SPELL":
      return { canExecute: true };

    default:
      return { canExecute: true };
  }
}

/**
 * Menerapkan satu langkah instruksi ke state arena secara deterministik dan murni (immutable).
 */
export function applyStep(state: LevelGridState, step: ExecutionStep): LevelGridState {
  if (state.status === "FAILED" || state.status === "VICTORY") {
    return state;
  }

  const player: CharacterState = {
    ...state.player,
    manaUsed: state.player.manaUsed + 1,
    collectedShards: [...state.player.collectedShards],
    litTorches: [...state.player.litTorches],
    isAlive: true,
  };

  switch (step.command) {
    case "TURN_LEFT": {
      player.direction = getNextDirection(player.direction, "LEFT");
      return { ...state, player, character: player, status: "RUNNING" };
    }

    case "TURN_RIGHT": {
      player.direction = getNextDirection(player.direction, "RIGHT");
      return { ...state, player, character: player, status: "RUNNING" };
    }

    case "STEP_FORWARD": {
      const nextPos = getForwardPosition(player.position, player.direction);

      if (isOutOfBounds(nextPos, state.width, state.height)) {
        const errorDetails = createEngineError(
          "WALL_COLLISION",
          step.activeNodeId,
          step.stepNumber
        );
        return {
          ...state,
          player,
          character: player,
          status: "FAILED",
          failureReason: errorDetails.kidExplanation,
          misfireNodeId: step.activeNodeId,
          errorDetails,
        };
      }

      if (isObstacle(nextPos, state.obstacles)) {
        const errorDetails = createEngineError(
          "OBSTACLE_HIT",
          step.activeNodeId,
          step.stepNumber
        );
        return {
          ...state,
          player,
          character: player,
          status: "FAILED",
          failureReason: errorDetails.kidExplanation,
          misfireNodeId: step.activeNodeId,
          errorDetails,
        };
      }

      player.position = nextPos;
      return { ...state, player, character: player, status: "RUNNING" };
    }

    case "COLLECT_SHARD": {
      const shardAtPos = state.shards.find(
        (s) => s.x === player.position.x && s.y === player.position.y
      );

      if (shardAtPos && !player.collectedShards.includes(shardAtPos.id)) {
        player.collectedShards.push(shardAtPos.id);
      }
      return { ...state, player, character: player, status: "RUNNING" };
    }

    case "LIGHT_TORCH": {
      const torchAtPos = state.torches.find(
        (t) => t.x === player.position.x && t.y === player.position.y
      );

      if (torchAtPos && !player.litTorches.includes(torchAtPos.id)) {
        player.litTorches.push(torchAtPos.id);
      }
      return { ...state, player, character: player, status: "RUNNING" };
    }

    case "ACTIVATE": {
      // Prioritas aktivasi: lentera tak menyala -> kristal -> portal
      const torchAtPos = state.torches.find(
        (t) => t.x === player.position.x && t.y === player.position.y && !player.litTorches.includes(t.id)
      );
      if (torchAtPos) {
        player.litTorches.push(torchAtPos.id);
        return { ...state, player, character: player, status: "RUNNING" };
      }

      const shardAtPos = state.shards.find(
        (s) => s.x === player.position.x && s.y === player.position.y && !player.collectedShards.includes(s.id)
      );
      if (shardAtPos) {
        player.collectedShards.push(shardAtPos.id);
        return { ...state, player, character: player, status: "RUNNING" };
      }

      return { ...state, player, character: player, status: "RUNNING" };
    }

    case "CAST_SPELL": {
      return { ...state, player, character: player, status: "RUNNING" };
    }

    default:
      return state;
  }
}
