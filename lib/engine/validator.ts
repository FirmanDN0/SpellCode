import { calculateMaxDepth, countTotalNodes } from "./ast";
import { AstNode, CommandType, ProgramValidationResult, SpellProgram } from "./types";

export interface ValidationConfig {
  allowedRunes?: CommandType[];
  allowRepeat?: boolean;
  allowCondition?: boolean;
  maxNodes?: number;
  maxDepth?: number;
  maxLoopCount?: number;
}

export function validateProgram(
  program: SpellProgram,
  config: ValidationConfig = {}
): ProgramValidationResult {
  const {
    allowedRunes,
    allowRepeat = true,
    allowCondition = true,
    maxNodes = 60,
    maxDepth = 4,
    maxLoopCount = 20,
  } = config;

  const errors: string[] = [];
  const warnings: string[] = [];

  const totalNodes = countTotalNodes(program.nodes);
  const depth = calculateMaxDepth(program.nodes);

  if (totalNodes === 0) {
    errors.push("Meja mantra masih kosong. Masukkan minimal satu rune instruksi.");
  }

  if (totalNodes > maxNodes) {
    errors.push(
      `Jumlah blok mantra (${totalNodes}) melebihi batas maksimal yang diizinkan (${maxNodes}). Ringkas mantramu!`
    );
  }

  if (depth > maxDepth) {
    errors.push(
      `Tingkat kedalaman blok bersarang (${depth}) melebihi batas maksimal (${maxDepth}).`
    );
  }

  function validateNodes(nodes: AstNode[]) {
    for (const node of nodes) {
      if (node.type === "ACTION") {
        if (allowedRunes && !allowedRunes.includes(node.command)) {
          errors.push(`Rune '${node.command}' tidak diizinkan pada level ini.`);
        }
      } else if (node.type === "REPEAT") {
        if (!allowRepeat) {
          errors.push("Blok perulangan (REPEAT) belum diizinkan pada level ini.");
        }
        if (node.count < 1 || node.count > maxLoopCount) {
          errors.push(
            `Jumlah perulangan harus antara 1 sampai ${maxLoopCount}. Nilai saat ini: ${node.count}.`
          );
        }
        if (node.body.length === 0) {
          warnings.push(`Blok perulangan '${node.id}' tidak memiliki instruksi di dalamnya.`);
        }
        validateNodes(node.body);
      } else if (node.type === "IF") {
        if (!allowCondition) {
          errors.push("Blok percabangan kondisi (IF) belum diizinkan pada level ini.");
        }
        if (node.thenBody.length === 0) {
          warnings.push(`Blok percabangan '${node.id}' memiliki cabang aksi yang kosong.`);
        }
        validateNodes(node.thenBody);
        if (node.elseBody) {
          validateNodes(node.elseBody);
        }
      } else {
        errors.push(`Tipe node tidak dikenal.`);
      }
    }
  }

  validateNodes(program.nodes);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalNodes,
    maxDepth: depth,
  };
}
