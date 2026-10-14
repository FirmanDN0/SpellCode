"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ExecutionController, ControllerSnapshot } from "./controller";
import { LevelDefinition } from "../levels/types";
import { ExecutionEvent, ExecutionResult, SpellProgram } from "./types";
import { createInitialGridState } from "./grid";

export interface UseExecutionControllerReturn {
  controller: ExecutionController | null;
  snapshot: ControllerSnapshot;
  step: () => boolean;
  run: (options?: {
    speedMs?: number;
    onStep?: (event: ExecutionEvent) => void;
  }) => Promise<ExecutionResult | undefined>;
  pause: () => void;
  reset: () => void;
  setProgram: (program: SpellProgram) => void;
  clearProgram: () => void;
}

/**
 * React Hook untuk mengintegrasikan ExecutionController dengan antarmuka pengguna
 * secara deklaratif tanpa menaruh logika eksekusi di dalam komponen React.
 */
export function useExecutionController(
  level: LevelDefinition,
  initialProgram?: SpellProgram
): UseExecutionControllerReturn {
  const controllerRef = useRef<ExecutionController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new ExecutionController(
      {
        initialWorldState: createInitialGridState(level.grid),
        parSteps: level.parSteps,
        objectives: level.objectives,
      },
      initialProgram
    );
  }

  const [snapshot, setSnapshot] = useState<ControllerSnapshot>(() =>
    controllerRef.current!.getSnapshot()
  );

  // Inisialisasi dan berlangganan ke controller saat level berubah
  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.destroy();
    }
    controllerRef.current = new ExecutionController(
      {
        initialWorldState: createInitialGridState(level.grid),
        parSteps: level.parSteps,
        objectives: level.objectives,
      },
      initialProgram
    );

    const controller = controllerRef.current;
    const unsubscribe = controller.subscribe(setSnapshot);

    return () => {
      unsubscribe();
      controller.destroy();
    };
  }, [level.id, level.grid, level.parSteps, level.objectives, initialProgram]);

  const step = useCallback(() => {
    if (!controllerRef.current) return false;
    return controllerRef.current.step();
  }, []);

  const run = useCallback(
    async (options?: {
      speedMs?: number;
      onStep?: (event: ExecutionEvent) => void;
    }) => {
      if (!controllerRef.current) return undefined;
      return controllerRef.current.run(options);
    },
    []
  );

  const pause = useCallback(() => {
    controllerRef.current?.pause();
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.reset();
  }, []);

  const setProgram = useCallback((program: SpellProgram) => {
    controllerRef.current?.setProgram(program);
  }, []);

  const clearProgram = useCallback(() => {
    controllerRef.current?.clearProgram();
  }, []);

  return {
    controller: controllerRef.current,
    snapshot,
    step,
    run,
    pause,
    reset,
    setProgram,
    clearProgram,
  };
}
