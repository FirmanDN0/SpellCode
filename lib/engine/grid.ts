import { createEngineError } from "./errors";
import {
  Direction,
  ExecutionStep,
  GridPosition,
  LevelGridState,
  PlayerState,
  ShardEntity,
  TorchEntity,
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
 * Membuat state grid awal yang murni dan bersih dari konfigurasi level.
 */
export function createInitialGridState(config: InitialGridConfig): LevelGridState {
  return {
    width: config.width,
    height: config.height,
    obstacles: config.obstacles.map((o) => ({ ...o })),
    shards: config.shards.map((s) => ({ ...s })),
    torches: config.torches.map((t) => ({ ...t })),
    portal: { ...config.portal },
    player: {
      position: { x: config.playerStart.x, y: config.playerStart.y },
      direction: config.playerStart.direction,
      manaUsed: 0,
      collectedShards: [],
      litTorches: [],
    },
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
 * Menerapkan satu langkah instruksi ke state arena secara deterministik dan murni (immutable).
 */
export function applyStep(state: LevelGridState, step: ExecutionStep): LevelGridState {
  if (state.status === "FAILED" || state.status === "VICTORY") {
    return state;
  }

  const player: PlayerState = {
    ...state.player,
    manaUsed: state.player.manaUsed + 1,
    collectedShards: [...state.player.collectedShards],
    litTorches: [...state.player.litTorches],
  };

  switch (step.command) {
    case "TURN_LEFT": {
      player.direction = getNextDirection(player.direction, "LEFT");
      return { ...state, player, status: "RUNNING" };
    }

    case "TURN_RIGHT": {
      player.direction = getNextDirection(player.direction, "RIGHT");
      return { ...state, player, status: "RUNNING" };
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
          status: "FAILED",
          failureReason: errorDetails.kidExplanation,
          misfireNodeId: step.activeNodeId,
          errorDetails,
        };
      }

      player.position = nextPos;
      return { ...state, player, status: "RUNNING" };
    }

    case "COLLECT_SHARD": {
      const shardAtPos = state.shards.find(
        (s) => s.x === player.position.x && s.y === player.position.y
      );

      if (shardAtPos && !player.collectedShards.includes(shardAtPos.id)) {
        player.collectedShards.push(shardAtPos.id);
      }
      return { ...state, player, status: "RUNNING" };
    }

    case "LIGHT_TORCH": {
      const torchAtPos = state.torches.find(
        (t) => t.x === player.position.x && t.y === player.position.y
      );

      if (torchAtPos && !player.litTorches.includes(torchAtPos.id)) {
        player.litTorches.push(torchAtPos.id);
      }
      return { ...state, player, status: "RUNNING" };
    }

    case "CAST_SPELL": {
      // Perilaku aktivasi mantra umum
      return { ...state, player, status: "RUNNING" };
    }

    default:
      return state;
  }
}
