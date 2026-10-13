export type CommandType =
  | "STEP_FORWARD"
  | "TURN_LEFT"
  | "TURN_RIGHT"
  | "COLLECT_SHARD"
  | "LIGHT_TORCH"
  | "CAST_SPELL"
  | "ACTIVATE";

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

// Model Spasial & Entitas Karakter
export type Direction = "UP" | "RIGHT" | "DOWN" | "LEFT";

export interface GridPosition {
  x: number;
  y: number;
}

export type Position = GridPosition;

export type TileType = "EMPTY" | "WALL" | "OBSTACLE" | "PORTAL" | "TORCH" | "SHARD";

export interface Tile {
  x: number;
  y: number;
  type: TileType;
  hasObstacle: boolean;
  hasShard: boolean;
  hasTorch: boolean;
  isPortal: boolean;
}

export interface CharacterState {
  position: Position;
  direction: Direction;
  manaUsed: number;
  collectedShards: string[];
  litTorches: string[];
  isAlive?: boolean;
}

export type PlayerState = CharacterState;

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

export type ExecutionError = EngineErrorDetails;

// Model Dunia Arena (WorldState & LevelGridState)
export interface WorldState {
  width: number;
  height: number;
  obstacles: Position[];
  shards: ShardEntity[];
  torches: TorchEntity[];
  portal: Position;
  character?: CharacterState;
  player: CharacterState;
  tiles?: Tile[][];
  status: SimulationStatus;
  failureReason?: string;
  misfireNodeId?: string;
  errorDetails?: EngineErrorDetails;
}

export type LevelGridState = WorldState;

// Definisi Instruksi & Program
export interface ProgramInstruction {
  id: string;
  command: CommandType;
}

export interface ProgramDefinition {
  id?: string;
  version: 1;
  instructions: ProgramInstruction[];
  maxInstructions?: number;
  allowedRunes?: CommandType[];
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

// Event Trace untuk Animasi UI dan Debugging
export type ExecutionEventType =
  | "STEP_START"
  | "STEP_COMPLETE"
  | "PLAYER_MOVE"
  | "PLAYER_TURN"
  | "SHARD_COLLECTED"
  | "TORCH_LIT"
  | "OBJECT_ACTIVATED"
  | "SPELL_CAST"
  | "CONDITION_EVALUATED"
  | "LOOP_ITERATION"
  | "ERROR"
  | "VICTORY";

export interface ExecutionEventMetadata {
  fromPosition?: Position;
  toPosition?: Position;
  fromDirection?: Direction;
  toDirection?: Direction;
  targetId?: string;
  actionSuccess?: boolean;
}

export interface ExecutionEvent {
  type: ExecutionEventType;
  stepNumber: number;
  nodeId: string;
  command?: CommandType;
  condition?: ConditionType;
  conditionResult?: boolean;
  message?: string;
  playerState: PlayerState;
  metadata?: ExecutionEventMetadata;
}

export interface ProgramValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalNodes: number;
  maxDepth: number;
}

// Objective Level
export type ObjectiveType =
  | "REACH_PORTAL"
  | "COLLECT_ALL_SHARDS"
  | "LIGHT_ALL_TORCHES";

export interface Objective {
  id: string;
  type: ObjectiveType;
  description: string;
  isCompleted: boolean;
  requiredCount?: number;
  currentCount?: number;
}

export interface EvaluationResult {
  isVictory: boolean;
  allShardsCollected: boolean;
  allTorchesLit: boolean;
  atPortal: boolean;
  objectives?: Objective[];
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

export interface ExecutionState {
  status: SimulationStatus;
  currentStepIndex: number;
  stepsTaken: number;
  characterState: CharacterState;
  worldState: WorldState;
}

export interface ExecutionLimits {
  maxSteps: number;
  maxInstructions: number;
  maxDepth: number;
  allowedRunes?: CommandType[];
}

export interface InstructionValidationResult {
  canExecute: boolean;
  errorCode?: EngineErrorCode;
  reason?: string;
  kidExplanation?: string;
}
