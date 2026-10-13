import { AstNode, ExecutionStep, SpellProgram } from "./types";

export function* createSpellVM(
  program: SpellProgram,
  maxSteps: number = 100
): Generator<ExecutionStep, void, unknown> {
  let stepCounter = 0;

  function* executeNodes(nodes: AstNode[]): Generator<ExecutionStep, void, unknown> {
    for (const node of nodes) {
      if (stepCounter >= maxSteps) {
        throw new Error("MANA_OVERFLOW: Terlalu banyak langkah! Periksa jumlah perulanganmu.");
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
          yield* executeNodes(node.body);
        }
      }
    }
  }

  yield* executeNodes(program.nodes);
}
