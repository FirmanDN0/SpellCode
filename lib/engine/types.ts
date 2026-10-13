export type CommandType =
  | "STEP_FORWARD"
  | "TURN_LEFT"
  | "TURN_RIGHT"
  | "COLLECT_SHARD"
  | "LIGHT_TORCH";

export interface BaseNode {
  id: string;
}

export interface ActionNode extends BaseNode {
  type: "ACTION";
  command: CommandType;
}

export interface RepeatNode extends BaseNode {
  type: "REPEAT";
  count: number;
  body: AstNode[];
}

export type AstNode = ActionNode | RepeatNode;

export interface SpellProgram {
  version: 1;
  nodes: AstNode[];
}

export type Direction = "UP" | "RIGHT" | "DOWN" | "LEFT";

export interface GridPosition {
  x: number;
  y: number;
}

export interface PlayerState {
  position: GridPosition;
  direction: Direction;
  manaUsed: number;
  collectedShards: string[];
  litTorches: string[];
}

export interface ShardEntity {
  id: string;
  x: number;
  y: number;
}

export interface TorchEntity {
  id: string;
  x: number;
  y: number;
  isLit?: boolean;
}

export type SimulationStatus = "IDLE" | "RUNNING" | "FAILED" | "VICTORY";

export interface LevelGridState {
  width: number;
  height: number;
  obstacles: GridPosition[];
  shards: ShardEntity[];
  torches: TorchEntity[];
  portal: GridPosition;
  player: PlayerState;
  status: SimulationStatus;
  failureReason?: string;
  misfireNodeId?: string;
}

export interface ExecutionStep {
  activeNodeId: string;
  command: CommandType;
  stepNumber: number;
}
