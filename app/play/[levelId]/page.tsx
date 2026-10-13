"use client";

import React, { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import { getLevelById, getNextLevel } from "@/lib/levels";
import { LevelDefinition } from "@/lib/levels/types";
import {
  ActionNode,
  AstNode,
  CommandType,
  ExecutionStep,
  LevelGridState,
  RepeatNode,
  SpellProgram,
} from "@/lib/engine/types";
import {
  createActionNode,
  createEmptyProgram,
  createRepeatNode,
} from "@/lib/engine/ast";
import { createSpellVM } from "@/lib/engine/vm";
import { applyStep } from "@/lib/engine/grid";
import { evaluateLevelState, EvaluationResult } from "@/lib/engine/evaluator";
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
      <div className="w-16 h-16 rounded-2xl bg-spell-purple-900 border border-spell-coral-500/40 flex items-center justify-center text-spell-coral-400 mb-4">
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
  // Buat state grid awal dari konfigurasi level
  const createInitialState = React.useCallback((): LevelGridState => ({
    width: level.grid.width,
    height: level.grid.height,
    obstacles: level.grid.obstacles,
    shards: level.grid.shards,
    torches: level.grid.torches,
    portal: level.grid.portal,
    player: {
      position: { ...level.grid.playerStart },
      direction: level.grid.playerStart.direction,
      manaUsed: 0,
      collectedShards: [],
      litTorches: [],
    },
    status: "IDLE",
  }), [level]);

  const [gridState, setGridState] = useState<LevelGridState>(createInitialState);
  const [program, setProgram] = useState<SpellProgram>(createEmptyProgram);
  const [activeNodeId, setActiveNodeId] = useState<string | undefined>();
  const [misfireNodeId, setMisfireNodeId] = useState<string | undefined>();
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [stepsTaken, setStepsTaken] = useState<number>(0);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [newRankNotice, setNewRankNotice] = useState<{ isNew: boolean; rank?: string }>({ isNew: false });

  // Ref untuk VM generator saat eksekusi berjalan
  const activeVmRef = useRef<Generator<ExecutionStep, void, unknown> | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pulihkan draf susunan blok terakhir jika ada
  useEffect(() => {
    const draft = getDraftAst(level.id);
    if (draft && draft.nodes.length > 0) {
      setProgram(draft);
    } else {
      setProgram(createEmptyProgram());
    }
    setGridState(createInitialState());
    setActiveNodeId(undefined);
    setMisfireNodeId(undefined);
    setIsRunning(false);
    setStepsTaken(0);
    setIsVictoryModalOpen(false);
  }, [level.id, createInitialState]);

  // Bersihkan timer saat unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Update draf lokal
  const updateProgram = (newProgram: SpellProgram) => {
    setProgram(newProgram);
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

  const handleRemoveNode = (nodeId: string) => {
    updateProgram({
      ...program,
      nodes: program.nodes.filter((n) => n.id !== nodeId),
    });
  };

  const handleClearDeck = () => {
    updateProgram(createEmptyProgram());
    handleReset();
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

  const handleAddSubAction = (repeatId: string, command: CommandType) => {
    const updatedNodes = program.nodes.map((node) => {
      if (node.id === repeatId && node.type === "REPEAT") {
        const repeatNode = node as RepeatNode;
        const subNode = createActionNode(command);
        return { ...repeatNode, body: [...repeatNode.body, subNode] };
      }
      return node;
    });
    updateProgram({ ...program, nodes: updatedNodes });
  };

  const handleRemoveSubAction = (repeatId: string, subIndex: number) => {
    const updatedNodes = program.nodes.map((node) => {
      if (node.id === repeatId && node.type === "REPEAT") {
        const repeatNode = node as RepeatNode;
        const newBody = [...repeatNode.body];
        newBody.splice(subIndex, 1);
        return { ...repeatNode, body: newBody };
      }
      return node;
    });
    updateProgram({ ...program, nodes: updatedNodes });
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    activeVmRef.current = null;
    setIsRunning(false);
    setActiveNodeId(undefined);
    setMisfireNodeId(undefined);
    setStepsTaken(0);
    setGridState(createInitialState());
  };

  // Eksekusi satu langkah (Step Next)
  const handleStep = () => {
    if (isRunning) return;

    if (!activeVmRef.current) {
      if (program.nodes.length === 0) return;
      activeVmRef.current = createSpellVM(program, 100);
      setGridState((prev) => ({ ...prev, status: "RUNNING" }));
    }

    try {
      const nextYield = activeVmRef.current.next();
      if (!nextYield.done) {
        const step = nextYield.value;
        setActiveNodeId(step.activeNodeId);
        setStepsTaken((prev) => prev + 1);

        // Suara interaksi
        if (step.command === "STEP_FORWARD") soundManager.playStep();
        else if (step.command === "TURN_LEFT" || step.command === "TURN_RIGHT") soundManager.playTurn();
        else if (step.command === "LIGHT_TORCH") soundManager.playTorch();
        else if (step.command === "COLLECT_SHARD") soundManager.playShard();

        setGridState((currentState) => {
          const nextState = applyStep(currentState, step);
          if (nextState.status === "FAILED") {
            soundManager.playMisfire();
            setMisfireNodeId(step.activeNodeId);
            activeVmRef.current = null;
          }
          return nextState;
        });
      } else {
        // VM selesai
        finishSimulation(gridState, stepsTaken);
        activeVmRef.current = null;
      }
    } catch (err: unknown) {
      soundManager.playMisfire();
      setGridState((prev) => ({
        ...prev,
        status: "FAILED",
        failureReason: err instanceof Error ? err.message : "Mantra terhenti!",
      }));
      activeVmRef.current = null;
    }
  };

  // Eksekusi otomatis dari awal hingga akhir (Play)
  const handlePlay = () => {
    if (isRunning || program.nodes.length === 0) return;

    handleReset();
    setIsRunning(true);

    const vm = createSpellVM(program, 100);
    let currentLocalState = createInitialState();
    let currentSteps = 0;

    const delay = speed === 1 ? 400 : 220;

    const runNext = () => {
      try {
        const result = vm.next();
        if (!result.done) {
          const step = result.value;
          setActiveNodeId(step.activeNodeId);
          currentSteps++;
          setStepsTaken(currentSteps);

          // Efek suara
          if (step.command === "STEP_FORWARD") soundManager.playStep();
          else if (step.command === "TURN_LEFT" || step.command === "TURN_RIGHT") soundManager.playTurn();
          else if (step.command === "LIGHT_TORCH") soundManager.playTorch();
          else if (step.command === "COLLECT_SHARD") soundManager.playShard();

          currentLocalState = applyStep(currentLocalState, step);
          setGridState(currentLocalState);

          if (currentLocalState.status === "FAILED") {
            soundManager.playMisfire();
            setMisfireNodeId(step.activeNodeId);
            setIsRunning(false);
            return;
          }

          timerRef.current = setTimeout(runNext, delay);
        } else {
          // VM selesai, evaluasi hasil
          setIsRunning(false);
          setActiveNodeId(undefined);
          finishSimulation(currentLocalState, currentSteps);
        }
      } catch (err: unknown) {
        soundManager.playMisfire();
        setIsRunning(false);
        setGridState((prev) => ({
          ...prev,
          status: "FAILED",
          failureReason: err instanceof Error ? err.message : "Energi manamu overflow!",
        }));
      }
    };

    timerRef.current = setTimeout(runNext, 100);
  };

  const finishSimulation = (finalState: LevelGridState, finalSteps: number) => {
    const evaluation = evaluateLevelState(finalState, level.parSteps, finalSteps);
    setEvalResult(evaluation);

    if (evaluation.isVictory) {
      setGridState((prev) => ({ ...prev, status: "VICTORY" }));
      const saveRes = saveLevelResult(
        level.id,
        evaluation.stars,
        finalSteps,
        program,
        evaluation.xpEarned
      );
      setNewRankNotice({ isNew: saveRes.isNewRank, rank: saveRes.newRank });
      setIsVictoryModalOpen(true);
    } else {
      setGridState((prev) => ({
        ...prev,
        status: "FAILED",
        failureReason: evaluation.message,
      }));
    }
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
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between pb-3 border-b border-spell-purple-800">
        <div className="flex items-center gap-3">
          <Link
            href="/map"
            className="p-2 rounded-xl bg-spell-purple-900 hover:bg-spell-purple-800 text-spell-purple-200 hover:text-white border border-spell-purple-700 transition-colors"
            title="Kembali ke Peta"
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
          <span>Rekor Optimal: Par {level.parSteps}</span>
        </div>
      </div>

      {/* Main Gameplay Dual-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Arena Viewport & Debugger Guide (5 Kolom) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <ArenaGrid state={gridState} isMoving={isRunning} />
          <DebuggerGuide
            message={getGuideMessage()}
            hintText={level.hint}
            type={
              gridState.status === "FAILED"
                ? "misfire"
                : gridState.status === "VICTORY"
                ? "victory"
                : "info"
            }
          />
        </div>

        {/* Kolom Kanan: Meja Mantra, Rak Rune & Kontrol (7 Kolom) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <SpellDeck
            nodes={program.nodes}
            activeNodeId={activeNodeId}
            misfireNodeId={misfireNodeId}
            onRemoveNode={handleRemoveNode}
            onClearDeck={handleClearDeck}
            onUpdateRepeatCount={handleUpdateRepeatCount}
            onAddSubAction={handleAddSubAction}
            onRemoveSubAction={handleRemoveSubAction}
            allowedRunes={level.allowedRunes}
            disabled={isRunning}
          />

          <BlockTray
            allowedRunes={level.allowedRunes}
            allowRepeat={level.allowRepeatRune}
            onAddAction={handleAddAction}
            onAddRepeat={handleAddRepeat}
            disabled={isRunning}
          />

          <ControlBar
            isRunning={isRunning}
            canPlay={program.nodes.length > 0}
            onPlay={handlePlay}
            onStep={handleStep}
            onReset={handleReset}
            speed={speed}
            onToggleSpeed={() => setSpeed((s) => (s === 1 ? 2 : 1))}
          />
        </div>
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
