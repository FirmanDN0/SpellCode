"use client";

import React from "react";
import { Play, SkipForward, RotateCcw, FastForward } from "lucide-react";
import { Button } from "../ui/Button";

interface ControlBarProps {
  isRunning: boolean;
  canPlay: boolean;
  onPlay: () => void;
  onStep: () => void;
  onReset: () => void;
  speed: 1 | 2;
  onToggleSpeed: () => void;
}

export function ControlBar({
  isRunning,
  canPlay,
  onPlay,
  onStep,
  onReset,
  speed,
  onToggleSpeed,
}: ControlBarProps) {
  return (
    <div className="w-full p-2.5 sm:p-3 rounded-card bg-spell-purple-950 border border-spell-purple-800 shadow-lg flex items-center justify-between gap-2">
      {/* Tombol Utama: Rapalkan Mantra */}
      <Button
        variant="success"
        size="lg"
        disabled={!canPlay || isRunning}
        onClick={onPlay}
        className="flex-1 shadow-[0_4px_0_#059669,0_8px_16px_rgba(16,185,129,0.3)] font-extrabold"
        aria-label="Rapalkan Mantra dan Jalankan Simulasi"
      >
        <Play className="w-5 h-5 fill-white" />
        <span>Rapalkan Mantra</span>
      </Button>

      {/* Tombol Satu Langkah (Step) */}
      <Button
        variant="secondary"
        size="md"
        disabled={!canPlay || isRunning}
        onClick={onStep}
        className="font-bold border-spell-teal-400/40 text-spell-teal-300"
        title="Eksekusi satu langkah instruksi untuk debugging"
        aria-label="Eksekusi satu langkah"
      >
        <SkipForward className="w-4 h-4" />
        <span className="hidden sm:inline">Langkah</span>
      </Button>

      {/* Tombol Reset Posisi */}
      <Button
        variant="secondary"
        size="md"
        onClick={onReset}
        className="font-bold text-spell-coral-300 border-spell-coral-500/40"
        title="Kembalikan posisi karakter ke awal tanpa menghapus mantra"
        aria-label="Reset Posisi"
      >
        <RotateCcw className="w-4 h-4" />
        <span className="hidden sm:inline">Reset</span>
      </Button>

      {/* Kecepatan Animasi */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleSpeed}
        className="font-mono text-xs px-2.5 py-1 text-spell-purple-300 border border-spell-purple-800 rounded-lg hover:bg-spell-purple-800"
        title={`Kecepatan animasi saat ini: ${speed}x`}
        aria-label="Ubah Kecepatan Animasi"
      >
        <FastForward className="w-3.5 h-3.5 mr-1 text-spell-gold-400" />
        <span>{speed}x</span>
      </Button>
    </div>
  );
}
