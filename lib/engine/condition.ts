import { ConditionType, LevelGridState } from "./types";
import { getForwardPosition, isObstacle, isOutOfBounds } from "./grid";

/**
 * Mengevaluasi kondisi logis secara murni (pure function) berdasarkan game state terkini.
 */
export function evaluateCondition(condition: ConditionType, state: LevelGridState): boolean {
  const { player, width, height, obstacles, shards, torches, portal } = state;
  const currentPos = player.position;

  switch (condition) {
    case "IS_OBSTACLE_AHEAD": {
      const nextPos = getForwardPosition(currentPos, player.direction);
      return isOutOfBounds(nextPos, width, height) || isObstacle(nextPos, obstacles);
    }

    case "IS_CLEAR_AHEAD": {
      const nextPos = getForwardPosition(currentPos, player.direction);
      return !isOutOfBounds(nextPos, width, height) && !isObstacle(nextPos, obstacles);
    }

    case "IS_SHARD_PRESENT": {
      const shard = shards.find((s) => s.x === currentPos.x && s.y === currentPos.y);
      return Boolean(shard && !player.collectedShards.includes(shard.id));
    }

    case "IS_TORCH_PRESENT": {
      const torch = torches.find((t) => t.x === currentPos.x && t.y === currentPos.y);
      return Boolean(torch && !player.litTorches.includes(torch.id));
    }

    case "IS_PORTAL_PRESENT": {
      return currentPos.x === portal.x && currentPos.y === portal.y;
    }

    default:
      return false;
  }
}
