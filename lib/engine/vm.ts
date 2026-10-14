import { evaluateCondition } from "./condition";
import {
  AstNode,
  ExecutionStep,
  IfNode,
  LevelGridState,
  RepeatNode,
  SpellProgram,
} from "./types";

export interface VmOptions {
  maxSteps?: number;
  getState?: () => LevelGridState;
  onConditionEvaluated?: (
    node: IfNode,
    result: boolean,
    branchTaken: "THEN" | "ELSE"
  ) => void;
  onLoopIteration?: (
    node: RepeatNode,
    iteration: number,
    total: number
  ) => void;
}

export function* createSpellVM(
  program: SpellProgram,
  options: number | VmOptions = {}
): Generator<ExecutionStep, void, unknown> {
  const resolvedOptions: VmOptions =
    typeof options === "number" ? { maxSteps: options } : options;

  const maxSteps = resolvedOptions.maxSteps ?? 150;
  const getState = resolvedOptions.getState;
  const onConditionEvaluated = resolvedOptions.onConditionEvaluated;
  const onLoopIteration = resolvedOptions.onLoopIteration;

  let stepCounter = 0;

  function* executeNodes(nodes: AstNode[]): Generator<ExecutionStep, void, unknown> {
    for (const node of nodes) {
      if (stepCounter >= maxSteps) {
        throw new Error(
          "MANA_OVERFLOW: Energi mantra meluap karena melebihi batas langkah maksimal!"
        );
      }

      if (node.type === "ACTION") {
        stepCounter++;
        yield {
          activeNodeId: node.id,
          command: node.command,
          stepNumber: stepCounter,
        };
      } else if (node.type === "REPEAT") {
        const loopCount = Math.min(Math.max(1, node.count), 20);
        for (let i = 0; i < loopCount; i++) {
          if (onLoopIteration) {
            onLoopIteration(node, i + 1, loopCount);
          }
          yield* executeNodes(node.body);
        }
      } else if (node.type === "IF") {
        const currentState = getState ? getState() : undefined;
        const conditionMet = currentState
          ? evaluateCondition(node.condition, currentState)
          : false;

        if (onConditionEvaluated) {
          onConditionEvaluated(
            node,
            conditionMet,
            conditionMet ? "THEN" : "ELSE"
          );
        }

        if (conditionMet) {
          yield* executeNodes(node.thenBody);
        } else if (node.elseBody && node.elseBody.length > 0) {
          yield* executeNodes(node.elseBody);
        }
      }
    }
  }

  yield* executeNodes(program.nodes);
}
