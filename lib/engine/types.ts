export type CommandType =
  | "STEP_FORWARD"
  | "TURN_LEFT"
  | "TURN_RIGHT"
  | "COLLECT_SHARD"
  | "LIGHT_TORCH"
  | "CAST_SPELL";

export type ConditionType =
  | "IS_OBSTACLE_AHEAD"
  | "IS_CLEAR_AHEAD"
  | "IS_SHARD_PRESENT"
  | "IS_TORCH_PRESENT"
  | "IS_PORTAL_PRESENT";

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

export interface IfNode extends BaseNode {
  type: "IF";
  condition: ConditionType;
  thenBody: AstNode[];
  elseBody?: AstNode[];
}

export type AstNode = ActionNode | RepeatNode | IfNode;

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

export type EngineErrorCode =
  | "WALL_COLLISION"
  | "OBSTACLE_HIT"
  | "EMPTY_ACTION"
  | "MANA_OVERFLOW"
  | "MAX_DEPTH_EXCEEDED"
  | "DISALLOWED_INSTRUCTION"
  | "PROGRAM_TOO_LARGE"
  | "INCOMPLETE_OBJECTIVE"
  | "UNREACHED_PORTAL";

export interface EngineErrorDetails {
  code: EngineErrorCode;
  message: string;
  kidExplanation: string;
  nodeId?: string;
  stepNumber?: number;
}

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
  errorDetails?: EngineErrorDetails;
}

export interface ExecutionStep {
  activeNodeId: string;
  command: CommandType;
  stepNumber: number;
  conditionEvaluated?: {
    condition: ConditionType;
    result: boolean;
  };
}

export type ExecutionEventType =
  | "STEP_START"
  | "STEP_COMPLETE"
  | "PLAYER_MOVE"
  | "PLAYER_TURN"
  | "SHARD_COLLECTED"
  | "TORCH_LIT"
  | "CONDITION_EVALUATED"
  | "LOOP_ITERATION"
  | "ERROR"
  | "VICTORY";

export interface ExecutionEvent {
  type: ExecutionEventType;
  stepNumber: number;
  nodeId: string;
  command?: CommandType;
  condition?: ConditionType;
  conditionResult?: boolean;
  message?: string;
  playerState: PlayerState;
}

export interface ProgramValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalNodes: number;
  maxDepth: number;
}

export interface EvaluationResult {
  isVictory: boolean;
  allShardsCollected: boolean;
  allTorchesLit: boolean;
  atPortal: boolean;
  stars: number;
  xpEarned: number;
  message: string;
}

export interface ExecutionResult {
  status: "VICTORY" | "FAILED" | "ABORTED";
  totalSteps: number;
  events: ExecutionEvent[];
  finalState: LevelGridState;
  evaluation: EvaluationResult;
  errorDetails?: EngineErrorDetails;
}
