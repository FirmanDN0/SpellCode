import { LevelDefinition } from "./types";
import { world1Levels } from "./world1";
import { world2Levels } from "./world2";

export * from "./types";
export { world1Levels } from "./world1";
export { world2Levels } from "./world2";

export const allLevels: LevelDefinition[] = [...world1Levels, ...world2Levels];

export function getLevelById(id: string): LevelDefinition | undefined {
  return allLevels.find((level) => level.id === id);
}

export function getNextLevel(currentId: string): LevelDefinition | undefined {
  const currentIndex = allLevels.findIndex((l) => l.id === currentId);
  if (currentIndex >= 0 && currentIndex < allLevels.length - 1) {
    return allLevels[currentIndex + 1];
  }
  return undefined;
}

export function getWorldLevels(worldNumber: 1 | 2): LevelDefinition[] {
  return allLevels.filter((l) => l.worldNumber === worldNumber);
}
