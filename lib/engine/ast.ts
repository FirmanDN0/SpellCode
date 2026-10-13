import { ActionNode, AstNode, CommandType, RepeatNode, SpellProgram } from "./types";

export function generateNodeId(): string {
  return "node_" + Math.random().toString(36).substring(2, 9);
}

export function createActionNode(command: CommandType, id?: string): ActionNode {
  return {
    id: id || generateNodeId(),
    type: "ACTION",
    command,
  };
}

export function createRepeatNode(count: number = 2, body: AstNode[] = [], id?: string): RepeatNode {
  return {
    id: id || generateNodeId(),
    type: "REPEAT",
    count: Math.max(1, Math.min(count, 10)),
    body,
  };
}

export function countTotalNodes(nodes: AstNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count++;
    if (node.type === "REPEAT") {
      count += countTotalNodes(node.body);
    }
  }
  return count;
}

export function createEmptyProgram(): SpellProgram {
  return {
    version: 1,
    nodes: [],
  };
}
