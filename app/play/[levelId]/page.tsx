"use client";

import React, { use, useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, AlertCircle, Compass, Code2 } from "lucide-react";
import { getLevelById, getNextLevel } from "@/lib/levels";
import { LevelDefinition } from "@/lib/levels/types";
import {
  ActionNode,
  AstNode,
  CommandType,
  ConditionType,
  ExecutionStep,
  IfNode,
  LevelGridState,
  RepeatNode,
  SpellProgram,
} from "@/lib/engine/types";
import {
  createActionNode,
  createEmptyProgram,
  createRepeatNode,
  createIfNode,
} from "@/lib/engine/ast";
import { EvaluationResult } from "@/lib/engine/evaluator";
import { useExecutionController } from "@/lib/engine/useExecutionController";
import {
  getDraftAst,
  saveDraftAst,
  saveLevelResult,
} from "@/lib/storage/guestStorage";
import { soundManager } from "@/lib/audio/soundManager";
import { ArenaGrid } from "@/components/game/ArenaGrid";
import { SpellDeck } from "@/components/game/SpellDeck";
import { BlockTray } from "@/components/game/BlockTray";
import { ControlBar } from "@/components/game/ControlBar";
import { DebuggerGuide } from "@/components/game/DebuggerGuide";
import { VictoryModal } from "@/components/game/VictoryModal";
import { Button } from "@/components/ui/Button";

interface PageProps {
  params: Promise<{ levelId: string }>;
}

export default function PlayLevelPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const levelId = resolvedParams.levelId;

  const level = getLevelById(levelId);

  if (!level) {
    return <LevelNotFoundView />;
  }

  return <PlayLevelContent level={level} />;
}

function LevelNotFoundView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-spell-purple-900 border border-spell-coral-500/40 flex items-center justify-center text-spell-coral-400 mb-4 shadow-md">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-white">Misi Tidak Ditemukan</h1>
      <p className="text-sm text-spell-purple-300 mt-2 max-w-sm">
        Pulau sihir yang kamu cari mungkin berada di balik awan kabut atau belum terbuka.
      </p>
      <Link href="/map" className="mt-6">
        <Button variant="primary" size="md">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Peta Dunia</span>
        </Button>
      </Link>
    </div>
  );
}

function PlayLevelContent({ level }: { level: LevelDefinition }) {
  const {
    snapshot,
    step: controllerStep,
    run: controllerRun,
    reset: controllerReset,
    setProgram: controllerSetProgram,
    clearProgram: controllerClearProgram,
  } = useExecutionController(level);

  const [speed, setSpeed] = useState<1 | 2>(1);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [newRankNotice, setNewRankNotice] = useState<{ isNew: boolean; rank?: string }>({ isNew: false });
  const [mobileView, setMobileView] = useState<"all" | "arena" | "editor">("all");

  // Inisialisasi atau pulihkan draf susunan blok terakhir
  useEffect(() => {
    const draft = getDraftAst(level.id);
    if (draft && draft.nodes.length > 0) {
      controllerSetProgram(draft);
    } else if (level.initialProgram && level.initialProgram.nodes.length > 0) {
      controllerSetProgram(level.initialProgram);
    } else {
      controllerSetProgram(createEmptyProgram());
    }
    setIsVictoryModalOpen(false);
  }, [level.id, level.initialProgram, controllerSetProgram]);

  const program = snapshot.program;
  const gridState = snapshot.worldState;
  const isRunning = snapshot.isRunning;
  const activeNodeId = snapshot.activeNodeId;
  const misfireNodeId = snapshot.misfireNodeId;
  const stepsTaken = snapshot.stepsTaken;

  // Sinkronisasi evalResult saat selesai
  useEffect(() => {
    if (snapshot.evaluation) {
      setEvalResult(snapshot.evaluation);
    }
  }, [snapshot.evaluation]);

  const updateProgram = (newProgram: SpellProgram) => {
    controllerSetProgram(newProgram);
    saveDraftAst(level.id, newProgram);
  };

  const handleAddAction = (command: CommandType) => {
    const newNode = createActionNode(command);
    updateProgram({
      ...program,
      nodes: [...program.nodes, newNode],
    });
  };

  const handleAddRepeat = () => {
    const newRepeat = createRepeatNode(2, []);
    updateProgram({
      ...program,
      nodes: [...program.nodes, newRepeat],
    });
  };

  const handleAddCondition = (condition: ConditionType = "IS_OBSTACLE_AHEAD") => {
    const newIf = createIfNode(condition, []);
    updateProgram({
      ...program,
      nodes: [...program.nodes, newIf],
    });
  };

  const handleRemoveNode = (nodeId: string) => {
    updateProgram({
      ...program,
      nodes: program.nodes.filter((n) => n.id !== nodeId),
    });
  };

  const handleMoveNode = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 ||
      fromIndex >= program.nodes.length ||
      toIndex < 0 ||
      toIndex >= program.nodes.length
    ) {
      return;
    }
    const newNodes = [...program.nodes];
    const [moved] = newNodes.splice(fromIndex, 1);
    newNodes.splice(toIndex, 0, moved);
    updateProgram({ ...program, nodes: newNodes });
  };

  const handleClearDeck = () => {
    controllerClearProgram();
    saveDraftAst(level.id, createEmptyProgram());
  };

  const handleUpdateRepeatCount = (nodeId: string, newCount: number) => {
    const updatedNodes = program.nodes.map((node) => {
      if (node.id === nodeId && node.type === "REPEAT") {
        return { ...node, count: Math.max(2, Math.min(newCount, 10)) };
      }
      return node;
    });
    updateProgram({ ...program, nodes: updatedNodes });
  };

  const handleAddSubAction = (parentId: string, command: CommandType) => {
    const updatedNodes = program.nodes.map((node) => {
      if (node.id === parentId && node.type === "REPEAT") {
        const repeatNode = node as RepeatNode;
        const subNode = createActionNode(command);
        return { ...repeatNode, body: [...repeatNode.body, subNode] };
      }
      if (node.id === parentId && node.type === "IF") {
        const ifNode = node as IfNode;
        const subNode = createActionNode(command);
        return { ...ifNode, thenBody: [...ifNode.thenBody, subNode] };
      }
      return node;
    });
    updateProgram({ ...program, nodes: updatedNodes });
  };

  const handleRemoveSubAction = (parentId: string, subIndex: number) => {
    const updatedNodes = program.nodes.map((node) => {
      if (node.id === parentId && node.type === "REPEAT") {
        const repeatNode = node as RepeatNode;
        const newBody = [...repeatNode.body];
        newBody.splice(subIndex, 1);
        return { ...repeatNode, body: newBody };
      }
      if (node.id === parentId && node.type === "IF") {
        const ifNode = node as IfNode;
        const newBody = [...ifNode.thenBody];
        newBody.splice(subIndex, 1);
        return { ...ifNode, thenBody: newBody };
      }
      return node;
    });
    updateProgram({ ...program, nodes: updatedNodes });
  };

  const playSoundForCommand = (command?: CommandType) => {
    if (command === "STEP_FORWARD") soundManager.playStep();
    else if (command === "TURN_LEFT" || command === "TURN_RIGHT") soundManager.playTurn();
    else if (command === "LIGHT_TORCH") soundManager.playTorch();
    else if (command === "COLLECT_SHARD") soundManager.playShard();
    else if (command === "ACTIVATE") soundManager.playTorch();
  };

  const handleVictory = (evaluation: EvaluationResult, finalSteps: number) => {
    soundManager.playVictory();
    const saveRes = saveLevelResult(
      level.id,
      evaluation.stars,
      finalSteps,
      program,
      evaluation.xpEarned
    );
    setNewRankNotice({ isNew: saveRes.isNewRank, rank: saveRes.newRank });
    setIsVictoryModalOpen(true);
  };

  const handleStep = () => {
    if (isRunning) return;
    const hasNext = controllerStep();
    const currentEvents = snapshot.events;
    const latestEvent = currentEvents[currentEvents.length - 1];

    if (hasNext) {
      playSoundForCommand(latestEvent?.command);
    } else {
      if (snapshot.status === "FAILED") {
        soundManager.playMisfire();
      } else if (snapshot.evaluation?.isVictory) {
        handleVictory(snapshot.evaluation, snapshot.stepsTaken);
      }
    }
  };

  const handlePlay = async () => {
    if (isRunning || program.nodes.length === 0) return;

    controllerReset();
    const delay = speed === 1 ? 400 : 220;

    const result = await controllerRun({
      speedMs: delay,
      onStep: (event) => {
        if (event.type === "STEP_COMPLETE") {
          playSoundForCommand(event.command);
        }
      },
    });

    if (result) {
      if (result.status === "VICTORY") {
        handleVictory(result.evaluation, result.totalSteps);
      } else {
        soundManager.playMisfire();
      }
    }
  };

  const handleReset = () => {
    controllerReset();
  };

  const nextLevel = getNextLevel(level.id);

  // Pesan panduan Pyx
  const getGuideMessage = () => {
    if (gridState.status === "FAILED") {
      return gridState.failureReason || "Ada yang belum tepat. Coba periksa urutan mantramu!";
    }
    if (gridState.status === "VICTORY") {
      return "Sempurna! Kamu berhasil mengaktifkan portal sihir!";
    }
    if (isRunning) {
      return "Mengamati mantramu bekerja di arena...";
    }
    if (program.nodes.length === 0) {
      return `Misi Level ${level.levelNumber}: ${level.description}`;
    }
    return "Mantramu sudah siap dirapalkan! Tekan tombol hijau 'Rapalkan Mantra'.";
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-spell-purple-800 gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/map"
            className="p-2 rounded-xl bg-spell-purple-900 hover:bg-spell-purple-800 text-spell-purple-200 hover:text-white border border-spell-purple-700 transition-colors"
            title="Kembali ke Peta Dunia"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-spell-teal-300">
              <span>{level.worldTitle}</span>
              <span>•</span>
              <span>Misi {level.levelNumber}</span>
              <span className="px-2 py-0.5 rounded-full bg-spell-purple-800 text-[10px] text-spell-gold-300 border border-spell-purple-600">
                {level.conceptTag}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{level.title}</h1>
          </div>
        </div>

        {/* Par Steps Target Info */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-spell-purple-900 border border-spell-purple-700 text-xs font-bold text-spell-gold-300">
          <Sparkles className="w-4 h-4 text-spell-gold-400" />
          <span>Rekor Optimal: Par {level.parSteps} Langkah</span>
        </div>
      </div>

      {/* Mobile Screen Tab Toggle (Layar Kecil < 768px) */}
      <div className="flex lg:hidden items-center justify-center p-1 rounded-rune bg-spell-purple-900/80 border border-spell-purple-800 self-center">
        <button
          type="button"
          onClick={() => setMobileView("all")}
          className={`px-3 sm:px-4 py-2 min-h-[38px] rounded-lg text-xs font-bold transition-all ${
            mobileView === "all"
              ? "bg-spell-purple-700 text-white shadow-sm"
              : "text-spell-purple-300 hover:text-white"
          }`}
        >
          Semua Tampilan
        </button>
        <button
          type="button"
          onClick={() => setMobileView("arena")}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 min-h-[38px] rounded-lg text-xs font-bold transition-all ${
            mobileView === "arena"
              ? "bg-spell-teal-700 text-white shadow-sm"
              : "text-spell-purple-300 hover:text-white"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Arena Saja</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileView("editor")}
          className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 min-h-[38px] rounded-lg text-xs font-bold transition-all ${
            mobileView === "editor"
              ? "bg-spell-purple-700 text-white shadow-sm"
              : "text-spell-purple-300 hover:text-white"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Editor Mantra</span>
        </button>
      </div>

      {/* Main Gameplay Dual-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Arena Viewport & Debugger Guide (5 Kolom di Desktop) */}
        {(mobileView === "all" || mobileView === "arena") && (
          <div className="lg:col-span-5 flex flex-col gap-4">
            <ArenaGrid state={gridState} isMoving={isRunning} />
            <DebuggerGuide
              message={getGuideMessage()}
              hintText={level.hint}
              hints={level.hints}
              type={
                gridState.status === "FAILED"
                  ? "misfire"
                  : gridState.status === "VICTORY"
                  ? "victory"
                  : "info"
              }
              stepNumber={snapshot.stepsTaken}
              conditionFailed={
                snapshot.evaluation?.objectives?.find((o) => !o.isCompleted)?.description
              }
              onReset={handleReset}
              onStepDebug={handleStep}
            />
          </div>
        )}

        {/* Kolom Kanan: Meja Mantra, Rak Rune & Kontrol (7 Kolom di Desktop) */}
        {(mobileView === "all" || mobileView === "editor") && (
          <div className="lg:col-span-7 flex flex-col gap-4">
            <SpellDeck
              nodes={program.nodes}
              activeNodeId={activeNodeId}
              misfireNodeId={misfireNodeId}
              parSteps={level.parSteps}
              onRemoveNode={handleRemoveNode}
              onClearDeck={handleClearDeck}
              onMoveNode={handleMoveNode}
              onUpdateRepeatCount={handleUpdateRepeatCount}
              onAddSubAction={handleAddSubAction}
              onRemoveSubAction={handleRemoveSubAction}
              allowedRunes={level.allowedRunes}
              disabled={isRunning}
            />

            <BlockTray
              allowedRunes={level.allowedRunes}
              allowRepeat={level.allowRepeatRune}
              allowCondition={level.allowConditionRune}
              onAddAction={handleAddAction}
              onAddRepeat={handleAddRepeat}
              onAddCondition={handleAddCondition}
              disabled={isRunning}
            />

            <ControlBar
              isRunning={isRunning}
              canPlay={program.nodes.length > 0}
              hasBlocks={program.nodes.length > 0}
              onPlay={handlePlay}
              onStep={handleStep}
              onReset={handleReset}
              onClear={handleClearDeck}
              speed={speed}
              onToggleSpeed={() => setSpeed((s) => (s === 1 ? 2 : 1))}
            />
          </div>
        )}
      </div>

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={isVictoryModalOpen}
        stars={evalResult?.stars || 1}
        stepsTaken={stepsTaken}
        parSteps={level.parSteps}
        xpEarned={evalResult?.xpEarned || 50}
        message={evalResult?.message || "Misi selesai!"}
        nextLevelId={nextLevel?.id}
        isNewRank={newRankNotice.isNew}
        newRank={newRankNotice.rank}
        onRetry={handleReset}
        onClose={() => setIsVictoryModalOpen(false)}
      />
    </div>
  );
}
