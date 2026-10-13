"use client";

import React from "react";
import { CommandType } from "@/lib/engine/types";
import { ArrowUp, RotateCcw, RotateCw, Flame, Diamond, Repeat } from "lucide-react";
import { soundManager } from "@/lib/audio/soundManager";

interface BlockTrayProps {
  allowedRunes: CommandType[];
  allowRepeat?: boolean;
  onAddAction: (command: CommandType) => void;
  onAddRepeat: () => void;
  disabled?: boolean;
}

export function BlockTray({
  allowedRunes,
  allowRepeat = false,
  onAddAction,
  onAddRepeat,
  disabled = false,
}: BlockTrayProps) {
  const runeConfigs: Record<
    CommandType,
    { label: string; icon: React.ElementType; colorClass: string; shadowClass: string }
  > = {
    STEP_FORWARD: {
      label: "Maju 1 Langkah",
      icon: ArrowUp,
      colorClass: "bg-spell-teal-600 hover:bg-spell-teal-500 text-white border-spell-teal-400/40",
      shadowClass: "shadow-[0_4px_0_#0F766E]",
    },
    TURN_LEFT: {
      label: "Putar Kiri (90°)",
      icon: RotateCcw,
      colorClass: "bg-spell-purple-700 hover:bg-spell-purple-600 text-spell-purple-50 border-spell-purple-400/40",
      shadowClass: "shadow-[0_4px_0_#452482]",
    },
    TURN_RIGHT: {
      label: "Putar Kanan (90°)",
      icon: RotateCw,
      colorClass: "bg-spell-purple-700 hover:bg-spell-purple-600 text-spell-purple-50 border-spell-purple-400/40",
      shadowClass: "shadow-[0_4px_0_#452482]",
    },
    LIGHT_TORCH: {
      label: "Nyalakan Lentera",
      icon: Flame,
      colorClass: "bg-spell-gold-600 hover:bg-spell-gold-500 text-spell-purple-950 border-spell-gold-300/60",
      shadowClass: "shadow-[0_4px_0_#B45309]",
    },
    COLLECT_SHARD: {
      label: "Ambil Kristal",
      icon: Diamond,
      colorClass: "bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-300/40",
      shadowClass: "shadow-[0_4px_0_#0E7490]",
    },
  };

  const handleActionClick = (command: CommandType) => {
    if (disabled) return;
    soundManager.playClick();
    onAddAction(command);
  };

  const handleRepeatClick = () => {
    if (disabled) return;
    soundManager.playClick();
    onAddRepeat();
  };

  return (
    <div className="w-full p-3 sm:p-4 rounded-card bg-spell-purple-900/90 border border-spell-purple-700/80 shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-extrabold text-spell-purple-200 uppercase tracking-wider flex items-center gap-2">
          <span>🔮 Rak Rune Sihir</span>
          <span className="text-xs text-spell-purple-400 font-normal">
            (Klik rune untuk menambahkan ke mantra)
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {allowedRunes.map((command) => {
          const cfg = runeConfigs[command];
          if (!cfg) return null;
          const Icon = cfg.icon;

          return (
            <button
              key={command}
              type="button"
              disabled={disabled}
              onClick={() => handleActionClick(command)}
              className={`flex items-center gap-2 px-3.5 py-3 rounded-rune border font-bold text-xs sm:text-sm text-left transition-all active:translate-y-1 select-none disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spell-teal-400 ${cfg.colorClass} ${cfg.shadowClass}`}
            >
              <div className="p-1 rounded-md bg-black/20 flex items-center justify-center">
                <Icon className="w-4 h-4 shrink-0" />
              </div>
              <span className="truncate">{cfg.label}</span>
            </button>
          );
        })}

        {allowRepeat && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleRepeatClick}
            className="flex items-center gap-2 px-3.5 py-3 rounded-rune border font-bold text-xs sm:text-sm text-left transition-all active:translate-y-1 select-none disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spell-teal-400 bg-amber-600 hover:bg-amber-500 text-spell-purple-950 border-amber-300 shadow-[0_4px_0_#B45309]"
          >
            <div className="p-1 rounded-md bg-black/20 flex items-center justify-center">
              <Repeat className="w-4 h-4 shrink-0" />
            </div>
            <span className="truncate">Ulangi (Loop)</span>
          </button>
        )}
      </div>
    </div>
  );
}
