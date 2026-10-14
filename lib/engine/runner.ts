import { applyStep } from "./grid";
import { evaluateLevelState } from "./evaluator";
import { createSpellVM } from "./vm";
import { createEngineError } from "./errors";
import {
  ExecutionEvent,
  ExecutionResult,
  LevelGridState,
  SpellProgram,
} from "./types";

export interface RunOptions {
  maxSteps?: number;
}

/**
 * Menjalankan program mantra secara deterministik dari awal hingga akhir.
 * Menghasilkan event trace lengkap yang dapat direproduksi 100% pada input yang sama.
 */
export function runSpellProgram(
  program: SpellProgram,
  initialState: LevelGridState,
  parSteps: number,
  options: RunOptions = {}
): ExecutionResult {
  const maxSteps = options.maxSteps ?? 150;
  const events: ExecutionEvent[] = [];

  let currentState: LevelGridState = {
    ...initialState,
    player: {
      ...initialState.player,
      collectedShards: [...initialState.player.collectedShards],
      litTorches: [...initialState.player.litTorches],
    },
    status: "RUNNING",
  };

  let stepsTaken = 0;

  try {
    const vm = createSpellVM(program, {
      maxSteps,
      getState: () => currentState,
      onConditionEvaluated: (node, result) => {
        events.push({
          type: "CONDITION_EVALUATED",
          stepNumber: stepsTaken,
          nodeId: node.id,
          condition: node.condition,
          conditionResult: result,
          branchChosen: result ? "THEN" : (node.elseBody && node.elseBody.length > 0 ? "ELSE" : "SKIP"),
          message: result
            ? `Kondisi '${node.condition}' terpenuhi: menjalankan cabang aksi.`
            : `Kondisi '${node.condition}' tidak terpenuhi: ${node.elseBody?.length ? "menjalankan cabang lainnya." : "melewati blok."}`,
          playerState: { ...currentState.player },
          metadata: {
            actionSuccess: result,
          },
        });
      },
      onLoopIteration: (node, iteration, total) => {
        events.push({
          type: "LOOP_ITERATION",
          stepNumber: stepsTaken,
          nodeId: node.id,
          iteration,
          totalIterations: total,
          message: `Putaran loop ke-${iteration} dari ${total}`,
          playerState: { ...currentState.player },
        });
      },
    });

    for (const step of vm) {
      stepsTaken++;

      // Event STEP_START
      events.push({
        type: "STEP_START",
        stepNumber: stepsTaken,
        nodeId: step.activeNodeId,
        command: step.command,
        playerState: { ...currentState.player },
      });

      currentState = applyStep(currentState, step);

      // Event STEP_COMPLETE
      events.push({
        type: "STEP_COMPLETE",
        stepNumber: stepsTaken,
        nodeId: step.activeNodeId,
        command: step.command,
        playerState: { ...currentState.player },
      });

      if (currentState.status === "FAILED") {
        events.push({
          type: "ERROR",
          stepNumber: stepsTaken,
          nodeId: step.activeNodeId,
          message: currentState.failureReason,
          playerState: { ...currentState.player },
        });
        break;
      }
    }
  } catch (err: unknown) {
    const errorDetails = createEngineError(
      "MANA_OVERFLOW",
      undefined,
      stepsTaken
    );
    currentState = {
      ...currentState,
      status: "FAILED",
      failureReason: errorDetails.kidExplanation,
      errorDetails,
    };
    events.push({
      type: "ERROR",
      stepNumber: stepsTaken,
      nodeId: "mana_overflow",
      message: errorDetails.message,
      playerState: { ...currentState.player },
    });
  }

  // Evaluasi Objective Level
  const evaluation = evaluateLevelState(currentState, parSteps, stepsTaken);

  if (currentState.status === "FAILED") {
    return {
      status: "FAILED",
      totalSteps: stepsTaken,
      events,
      finalState: currentState,
      evaluation,
      errorDetails: currentState.errorDetails,
    };
  }

  if (evaluation.isVictory) {
    currentState.status = "VICTORY";
    events.push({
      type: "VICTORY",
      stepNumber: stepsTaken,
      nodeId: "portal",
      message: evaluation.message,
      playerState: { ...currentState.player },
    });
    return {
      status: "VICTORY",
      totalSteps: stepsTaken,
      events,
      finalState: currentState,
      evaluation,
    };
  } else {
    const errorCode = !evaluation.atPortal
      ? "UNREACHED_PORTAL"
      : "INCOMPLETE_OBJECTIVE";
    const errorDetails = createEngineError(errorCode, undefined, stepsTaken);
    currentState.status = "FAILED";
    currentState.failureReason = evaluation.message;
    currentState.errorDetails = errorDetails;

    events.push({
      type: "ERROR",
      stepNumber: stepsTaken,
      nodeId: "objective_incomplete",
      message: evaluation.message,
      playerState: { ...currentState.player },
    });

    return {
      status: "FAILED",
      totalSteps: stepsTaken,
      events,
      finalState: currentState,
      evaluation,
      errorDetails,
    };
  }
}
