"use client";

import React, { useState } from "react";
import { Play, SkipForward, RotateCcw, Trash2, FastForward } from "lucide-react";
import { Button } from "../ui/Button";

interface ControlBarProps {
  isRunning: boolean;
  canPlay: boolean;
  hasBlocks: boolean;
  onPlay: () => void;
  onStep: () => void;
  onReset: () => void;
  onClear: () => void;
  speed: 1 | 2;
  onToggleSpeed: () => void;
}

export function ControlBar({
  isRunning,
  canPlay,
  hasBlocks,
  onPlay,
  onStep,
  onReset,
  onClear,
  speed,
  onToggleSpeed,
}: ControlBarProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearClick = () => {
    if (showClearConfirm) {
      onClear();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  return (
    <div className="w-full p-2.5 sm:p-3 rounded-card bg-spell-purple-950 border border-spell-purple-800 shadow-card-fantasy flex flex-wrap items-center justify-between gap-2">
      {/* Tombol Utama: Run / Rapalkan Mantra */}
      <Button
        variant="success"
        size="md"
        disabled={!canPlay || isRunning}
        onClick={onPlay}
        className="flex-1 min-w-[140px] shadow-[0_4px_0_#059669,0_8px_16px_rgba(16,185,129,0.3)] font-black text-sm sm:text-base"
        aria-label="Rapalkan Mantra dan Jalankan Seluruh Kode"
      >
        <Play className="w-5 h-5 fill-white shrink-0" />
        <span>Rapalkan Mantra</span>
      </Button>

      {/* Tombol Step: Eksekusi Satu Instruksi untuk Debugging */}
      <Button
        variant="secondary"
        size="md"
        disabled={!canPlay || isRunning}
        onClick={onStep}
        className="font-bold border-spell-teal-400/50 text-spell-teal-300 hover:text-white"
        title="Eksekusi satu langkah instruksi untuk melacak alur kode (Debugging)"
        aria-label="Eksekusi Satu Langkah"
      >
        <SkipForward className="w-4 h-4 shrink-0" />
        <span className="text-xs sm:text-sm">Langkah</span>
      </Button>

      {/* Tombol Reset: Kembalikan Posisi Karakter ke Awal Tanpa Hapus Blok */}
      <Button
        variant="secondary"
        size="md"
        onClick={onReset}
        className="font-bold text-spell-purple-200 border-spell-purple-600/60 hover:text-white"
        title="Kembalikan posisi karakter dan arena ke awal tanpa menghapus susunan balok"
        aria-label="Reset Posisi Arena"
      >
        <RotateCcw className="w-4 h-4 shrink-0 text-spell-gold-400" />
        <span className="text-xs sm:text-sm">Reset</span>
      </Button>

      {/* Tombol Clear: Kosongkan Seluruh Meja Mantra */}
      <Button
        variant="ghost"
        size="md"
        disabled={!hasBlocks || isRunning}
        onClick={handleClearClick}
        className={`font-bold transition-all text-xs sm:text-sm border ${
          showClearConfirm
            ? "bg-spell-coral-600 text-white border-spell-coral-400 shadow-rune-coral animate-pulse"
            : "text-spell-coral-400 border-spell-coral-500/30 hover:bg-spell-coral-500/10"
        }`}
        title="Hapus semua balok di meja mantra untuk mulai menyusun dari awal"
        aria-label="Kosongkan Meja Mantra"
      >
        <Trash2 className="w-4 h-4 shrink-0" />
        <span>{showClearConfirm ? "Yakin Hapus?" : "Hapus Semua"}</span>
      </Button>

      {/* Pengatur Kecepatan Simulasi */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleSpeed}
        className="font-mono text-xs px-2.5 py-1 text-spell-purple-300 border border-spell-purple-800 rounded-lg hover:bg-spell-purple-800"
        title={`Kecepatan simulasi saat ini: ${speed}x. Klik untuk mengubah.`}
        aria-label="Ubah Kecepatan Simulasi"
      >
        <FastForward className="w-3.5 h-3.5 mr-1 text-spell-gold-400" />
        <span>{speed}x</span>
      </Button>
    </div>
  );
}
