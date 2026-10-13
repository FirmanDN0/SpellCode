import {
  Direction,
  ExecutionStep,
  GridPosition,
  LevelGridState,
  PlayerState,
} from "./types";

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

export function applyStep(state: LevelGridState, step: ExecutionStep): LevelGridState {
  if (state.status === "FAILED" || state.status === "VICTORY") {
    return state;
  }

  const player: PlayerState = { ...state.player, manaUsed: state.player.manaUsed + 1 };

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
        return {
          ...state,
          player,
          status: "FAILED",
          failureReason: "Hampir jatuh dari pulau sihir! Coba berbelok sebelum melangkah ke tepi.",
          misfireNodeId: step.activeNodeId,
        };
      }

      if (isObstacle(nextPos, state.obstacles)) {
        return {
          ...state,
          player,
          status: "FAILED",
          failureReason: "Ups, terhalang semak berduri atau batu! Cari jalan memutar.",
          misfireNodeId: step.activeNodeId,
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
        player.collectedShards = [...player.collectedShards, shardAtPos.id];
      }
      return { ...state, player, status: "RUNNING" };
    }

    case "LIGHT_TORCH": {
      const torchAtPos = state.torches.find(
        (t) => t.x === player.position.x && t.y === player.position.y
      );

      if (torchAtPos && !player.litTorches.includes(torchAtPos.id)) {
        player.litTorches = [...player.litTorches, torchAtPos.id];
      }
      return { ...state, player, status: "RUNNING" };
    }

    default:
      return state;
  }
}
