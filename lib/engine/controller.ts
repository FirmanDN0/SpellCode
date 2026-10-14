import { applyStep, createInitialGridState } from "./grid";
import { evaluateLevelState } from "./evaluator";
import { createSpellVM } from "./vm";
import { createEngineError } from "./errors";
import {
  EngineErrorDetails,
  EvaluationResult,
  ExecutionEvent,
  ExecutionResult,
  ExecutionStep,
  LevelGridState,
  Objective,
  SpellProgram,
  WorldState,
} from "./types";

export type ControllerStatus = "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED" | "FAILED";

export interface ControllerConfig {
  initialWorldState: WorldState;
  parSteps: number;
  maxSteps?: number;
  objectives?: Objective[];
}

export interface ControllerSnapshot {
  status: ControllerStatus;
  worldState: WorldState;
  program: SpellProgram;
  activeNodeId?: string;
  misfireNodeId?: string;
  stepsTaken: number;
  events: ExecutionEvent[];
  errorDetails?: EngineErrorDetails;
  evaluation?: EvaluationResult;
  isRunning: boolean;
  canStep: boolean;
  canRun: boolean;
  canReset: boolean;
}

export type ControllerListener = (snapshot: ControllerSnapshot) => void;

/**
 * Controller eksekusi program SpellCode yang terisolasi sepenuhnya dari React.
 * Mengatur siklus eksekusi Run, Step mikro, Pause, Reset, dan Clear secara deterministik dan aman.
 */
export class ExecutionController {
  private initialWorldState: WorldState;
  private currentWorldState: WorldState;
  private currentProgram: SpellProgram;
  private parSteps: number;
  private maxSteps: number;
  private objectives?: Objective[];

  private status: ControllerStatus = "IDLE";
  private activeNodeId?: string;
  private misfireNodeId?: string;
  private stepsTaken: number = 0;
  private events: ExecutionEvent[] = [];
  private errorDetails?: EngineErrorDetails;
  private evaluation?: EvaluationResult;

  private vm: Generator<ExecutionStep, void, unknown> | null = null;
  private listeners: Set<ControllerListener> = new Set();
  private timerId: NodeJS.Timeout | null = null;

  constructor(config: ControllerConfig, initialProgram?: SpellProgram) {
    this.initialWorldState = this.cloneWorldState(config.initialWorldState);
    this.currentWorldState = this.cloneWorldState(config.initialWorldState);
    this.parSteps = config.parSteps;
    this.maxSteps = config.maxSteps ?? 150;
    this.objectives = config.objectives;

    this.currentProgram = initialProgram
      ? this.cloneProgram(initialProgram)
      : { version: 1, nodes: [] };
  }

  private cloneWorldState(state: WorldState): WorldState {
    const character = {
      ...state.player,
      position: { ...state.player.position },
      collectedShards: [...state.player.collectedShards],
      litTorches: [...state.player.litTorches],
    };

    return {
      ...state,
      obstacles: state.obstacles.map((o) => ({ ...o })),
      shards: state.shards.map((s) => ({ ...s })),
      torches: state.torches.map((t) => ({ ...t })),
      portal: { ...state.portal },
      character,
      player: character,
      status: state.status,
    };
  }

  private cloneProgram(program: SpellProgram): SpellProgram {
    return {
      version: program.version,
      nodes: JSON.parse(JSON.stringify(program.nodes)),
    };
  }

  private notify() {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  public subscribe(listener: ControllerListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSnapshot(): ControllerSnapshot {
    const isRunning = this.status === "RUNNING";
    const isCompleted = this.status === "COMPLETED";
    const isFailed = this.status === "FAILED";

    const canStep = !isRunning && !isCompleted && !isFailed && this.currentProgram.nodes.length > 0;
    const canRun = !isRunning && !isCompleted && !isFailed && this.currentProgram.nodes.length > 0;
    const canReset = this.status !== "IDLE" || this.stepsTaken > 0 || this.currentWorldState.player.manaUsed > 0;

    return {
      status: this.status,
      worldState: this.currentWorldState,
      program: this.currentProgram,
      activeNodeId: this.activeNodeId,
      misfireNodeId: this.misfireNodeId,
      stepsTaken: this.stepsTaken,
      events: [...this.events],
      errorDetails: this.errorDetails,
      evaluation: this.evaluation,
      isRunning,
      canStep,
      canRun,
      canReset,
    };
  }

  /**
   * Menetapkan program baru. Jika controller sedang berjalan,
   * eksekusi saat ini dihentikan dan di-reset secara eksplisit untuk mencegah race condition.
   */
  public setProgram(program: SpellProgram): void {
    if (this.status === "RUNNING") {
      this.stopTimer();
      this.reset();
    }
    this.currentProgram = this.cloneProgram(program);
    this.notify();
  }

  /**
   * Mengosongkan program mantra.
   */
  public clearProgram(): void {
    if (this.status === "RUNNING") {
      this.stopTimer();
      this.reset();
    }
    this.currentProgram = { version: 1, nodes: [] };
    this.notify();
  }

  /**
   * Menjalankan satu langkah mikro berikutnya.
   * Mengembalikan true jika langkah berhasil dieksekusi, false jika program selesai atau gagal.
   */
  public step(): boolean {
    if (this.status === "COMPLETED" || this.status === "FAILED") {
      return false;
    }

    if (this.currentProgram.nodes.length === 0) {
      return false;
    }

    // Inisialisasi generator VM jika belum aktif
    if (!this.vm) {
      this.vm = createSpellVM(this.currentProgram, {
        maxSteps: this.maxSteps,
        getState: () => this.currentWorldState,
      });
      this.status = "RUNNING";
    }

    try {
      const nextYield = this.vm.next();

      if (!nextYield.done) {
        const step = nextYield.value;
        this.stepsTaken++;
        this.activeNodeId = step.activeNodeId;

        // Event STEP_START
        const startEvent: ExecutionEvent = {
          type: "STEP_START",
          stepNumber: this.stepsTaken,
          nodeId: step.activeNodeId,
          command: step.command,
          playerState: { ...this.currentWorldState.player },
        };
        this.events.push(startEvent);

        const prevPos = { ...this.currentWorldState.player.position };
        const prevDir = this.currentWorldState.player.direction;

        // Mutasi state murni
        this.currentWorldState = applyStep(this.currentWorldState, step);

        // Event STEP_COMPLETE
        const completeEvent: ExecutionEvent = {
          type: "STEP_COMPLETE",
          stepNumber: this.stepsTaken,
          nodeId: step.activeNodeId,
          command: step.command,
          playerState: { ...this.currentWorldState.player },
          metadata: {
            fromPosition: prevPos,
            toPosition: { ...this.currentWorldState.player.position },
            fromDirection: prevDir,
            toDirection: this.currentWorldState.player.direction,
            actionSuccess: this.currentWorldState.status !== "FAILED",
          },
        };
        this.events.push(completeEvent);

        if (this.currentWorldState.status === "FAILED") {
          this.status = "FAILED";
          this.misfireNodeId = step.activeNodeId;
          this.errorDetails = this.currentWorldState.errorDetails;

          this.events.push({
            type: "ERROR",
            stepNumber: this.stepsTaken,
            nodeId: step.activeNodeId,
            message: this.currentWorldState.failureReason,
            playerState: { ...this.currentWorldState.player },
          });

          this.vm = null;
          this.stopTimer();
          this.notify();
          return false;
        }

        this.notify();
        return true;
      } else {
        // VM telah menyelesaikan semua instruksi
        this.finalizeExecution();
        this.notify();
        return false;
      }
    } catch (err: unknown) {
      this.status = "FAILED";
      const errorDetails = createEngineError(
        "MANA_OVERFLOW",
        this.activeNodeId,
        this.stepsTaken
      );
      this.errorDetails = errorDetails;
      this.currentWorldState = {
        ...this.currentWorldState,
        status: "FAILED",
        failureReason: errorDetails.kidExplanation,
        errorDetails,
      };

      this.events.push({
        type: "ERROR",
        stepNumber: this.stepsTaken,
        nodeId: this.activeNodeId || "mana_overflow",
        message: errorDetails.message,
        playerState: { ...this.currentWorldState.player },
      });

      this.vm = null;
      this.stopTimer();
      this.notify();
      return false;
    }
  }

  private finalizeExecution() {
    this.evaluation = evaluateLevelState(
      this.currentWorldState,
      this.parSteps,
      this.stepsTaken,
      this.objectives
    );

    if (this.evaluation.isVictory) {
      this.status = "COMPLETED";
      this.currentWorldState = {
        ...this.currentWorldState,
        status: "VICTORY",
      };
      this.events.push({
        type: "VICTORY",
        stepNumber: this.stepsTaken,
        nodeId: "portal",
        message: this.evaluation.message,
        playerState: { ...this.currentWorldState.player },
      });
    } else {
      this.status = "FAILED";
      const errorCode = !this.evaluation.atPortal
        ? "UNREACHED_PORTAL"
        : "INCOMPLETE_OBJECTIVE";
      const errorDetails = createEngineError(errorCode, undefined, this.stepsTaken);
      this.errorDetails = errorDetails;
      this.currentWorldState = {
        ...this.currentWorldState,
        status: "FAILED",
        failureReason: this.evaluation.message,
        errorDetails,
      };
      this.events.push({
        type: "ERROR",
        stepNumber: this.stepsTaken,
        nodeId: "objective_incomplete",
        message: this.evaluation.message,
        playerState: { ...this.currentWorldState.player },
      });
    }

    this.vm = null;
    this.stopTimer();
  }

  /**
   * Menjalankan program dari kondisi saat ini sampai selesai.
   * Mencegah pemanggilan paralel jika sedang berjalan (Double Run Guard).
   */
  public run(options: {
    speedMs?: number;
    onStep?: (event: ExecutionEvent) => void;
  } = {}): Promise<ExecutionResult> {
    // Double Run Guard
    if (this.status === "RUNNING" && this.timerId !== null) {
      return Promise.reject(
        new Error("DOUBLE_RUN_PREVENTED: Program sedang berjalan, tidak boleh memulai eksekusi ganda.")
      );
    }

    if (this.currentProgram.nodes.length === 0) {
      const errorDetails = createEngineError("EMPTY_ACTION", undefined, 0, "Meja mantra masih kosong.");
      return Promise.resolve({
        status: "FAILED",
        totalSteps: 0,
        events: [],
        finalState: this.currentWorldState,
        evaluation: {
          isVictory: false,
          allShardsCollected: false,
          allTorchesLit: false,
          atPortal: false,
          stars: 0,
          xpEarned: 0,
          message: "Meja mantra masih kosong.",
        },
        errorDetails,
      });
    }

    const { speedMs = 0, onStep } = options;

    // Mode Instan (Sinkronus)
    if (speedMs <= 0) {
      this.status = "RUNNING";
      while (this.step()) {
        if (onStep && this.events.length > 0) {
          onStep(this.events[this.events.length - 1]);
        }
      }
      return Promise.resolve(this.toExecutionResult());
    }

    // Mode Animasi Bertahap (Asinkronus)
    this.status = "RUNNING";
    this.notify();

    return new Promise((resolve) => {
      const executeNext = () => {
        const hasNext = this.step();
        if (onStep && this.events.length > 0) {
          onStep(this.events[this.events.length - 1]);
        }

        if (hasNext && this.status === "RUNNING") {
          this.timerId = setTimeout(executeNext, speedMs);
        } else {
          this.stopTimer();
          resolve(this.toExecutionResult());
        }
      };

      this.timerId = setTimeout(executeNext, speedMs);
    });
  }

  public pause(): void {
    if (this.status === "RUNNING") {
      this.stopTimer();
      this.status = "PAUSED";
      this.notify();
    }
  }

  public reset(): void {
    this.stopTimer();
    this.vm = null;
    this.status = "IDLE";
    this.activeNodeId = undefined;
    this.misfireNodeId = undefined;
    this.stepsTaken = 0;
    this.events = [];
    this.errorDetails = undefined;
    this.evaluation = undefined;
    this.currentWorldState = this.cloneWorldState(this.initialWorldState);
    this.notify();
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public destroy(): void {
    this.stopTimer();
    this.listeners.clear();
    this.vm = null;
  }

  private toExecutionResult(): ExecutionResult {
    return {
      status: this.status === "COMPLETED" ? "VICTORY" : "FAILED",
      totalSteps: this.stepsTaken,
      events: [...this.events],
      finalState: this.currentWorldState,
      evaluation: this.evaluation || {
        isVictory: false,
        allShardsCollected: false,
        allTorchesLit: false,
        atPortal: false,
        stars: 0,
        xpEarned: 0,
        message: this.currentWorldState.failureReason || "Eksekusi selesai",
      },
      errorDetails: this.errorDetails,
    };
  }
}
