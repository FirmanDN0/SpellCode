import {
  ActionNode,
  AstNode,
  CommandType,
  ConditionType,
  IfNode,
  RepeatNode,
  SpellProgram,
} from "./types";

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

export function createRepeatNode(
  count: number = 2,
  body: AstNode[] = [],
  id?: string
): RepeatNode {
  return {
    id: id || generateNodeId(),
    type: "REPEAT",
    count,
    body,
  };
}

export function createIfNode(
  condition: ConditionType,
  thenBody: AstNode[] = [],
  elseBody?: AstNode[],
  id?: string
): IfNode {
  return {
    id: id || generateNodeId(),
    type: "IF",
    condition,
    thenBody,
    elseBody,
  };
}

export function countTotalNodes(nodes: AstNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count++;
    if (node.type === "REPEAT") {
      count += countTotalNodes(node.body);
    } else if (node.type === "IF") {
      count += countTotalNodes(node.thenBody);
      if (node.elseBody) {
        count += countTotalNodes(node.elseBody);
      }
    }
  }
  return count;
}

export function calculateMaxDepth(nodes: AstNode[], currentDepth: number = 1): number {
  let maxD = currentDepth;
  for (const node of nodes) {
    if (node.type === "REPEAT") {
      const childD = calculateMaxDepth(node.body, currentDepth + 1);
      if (childD > maxD) maxD = childD;
    } else if (node.type === "IF") {
      const thenD = calculateMaxDepth(node.thenBody, currentDepth + 1);
      if (thenD > maxD) maxD = thenD;
      if (node.elseBody) {
        const elseD = calculateMaxDepth(node.elseBody, currentDepth + 1);
        if (elseD > maxD) maxD = elseD;
      }
    }
  }
  return maxD;
}

export function createEmptyProgram(): SpellProgram {
  return {
    version: 1,
    nodes: [],
  };
}
