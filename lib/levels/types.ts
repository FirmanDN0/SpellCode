import { CommandType, Direction, GridPosition, Objective, ShardEntity, TorchEntity } from "../engine/types";

export interface LevelGridConfig {
  width: number;
  height: number;
  playerStart: {
    x: number;
    y: number;
    direction: Direction;
  };
  obstacles: GridPosition[];
  shards: ShardEntity[];
  torches: TorchEntity[];
  portal: GridPosition;
}

export interface LevelDefinition {
  id: string;
  worldNumber: 1 | 2;
  levelNumber: number;
  worldTitle: string;
  title: string;
  description: string;
  conceptTag: "Sequencing" | "Loops" | "Pattern Recognition" | "Conditionals";
  grid: LevelGridConfig;
  objectives?: Objective[];
  allowedRunes: CommandType[];
  allowRepeatRune?: boolean;
  allowConditionRune?: boolean;
  parSteps: number;
  baseXp: number;
  hint: string;
}
