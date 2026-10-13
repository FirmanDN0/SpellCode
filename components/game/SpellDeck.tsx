"use client";

import React from "react";
import { ActionNode, AstNode, CommandType, RepeatNode } from "@/lib/engine/types";
import {
  ArrowUp,
  RotateCcw,
  RotateCw,
  Flame,
  Diamond,
  Repeat,
  Trash2,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { soundManager } from "@/lib/audio/soundManager";

interface SpellDeckProps {
  nodes: AstNode[];
  activeNodeId?: string;
  misfireNodeId?: string;
  onRemoveNode: (nodeId: string) => void;
  onClearDeck: () => void;
  onUpdateRepeatCount?: (nodeId: string, newCount: number) => void;
  onAddSubAction?: (repeatId: string, command: CommandType) => void;
  onRemoveSubAction?: (repeatId: string, subIndex: number) => void;
  allowedRunes?: CommandType[];
  disabled?: boolean;
}

export function SpellDeck({
  nodes,
  activeNodeId,
  misfireNodeId,
  onRemoveNode,
  onClearDeck,
  onUpdateRepeatCount,
  onAddSubAction,
  onRemoveSubAction,
  allowedRunes = ["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"],
  disabled = false,
}: SpellDeckProps) {
  const getCommandInfo = (command: CommandType) => {
    switch (command) {
      case "STEP_FORWARD":
        return { label: "Maju 1 Langkah", icon: ArrowUp, bg: "bg-spell-teal-700/60 border-spell-teal-500/40" };
      case "TURN_LEFT":
        return { label: "Putar Kiri", icon: RotateCcw, bg: "bg-spell-purple-800/80 border-spell-purple-500/40" };
      case "TURN_RIGHT":
        return { label: "Putar Kanan", icon: RotateCw, bg: "bg-spell-purple-800/80 border-spell-purple-500/40" };
      case "LIGHT_TORCH":
        return { label: "Nyalakan Lentera", icon: Flame, bg: "bg-spell-gold-600/60 border-spell-gold-400/50" };
      case "COLLECT_SHARD":
        return { label: "Ambil Kristal", icon: Diamond, bg: "bg-cyan-700/60 border-cyan-400/40" };
    }
  };

  const handleRemove = (id: string) => {
    if (disabled) return;
    soundManager.playClick();
    onRemoveNode(id);
  };

  const handleClear = () => {
    if (disabled || nodes.length === 0) return;
    soundManager.playClick();
    onClearDeck();
  };

  return (
    <div className="w-full flex flex-col rounded-card bg-spell-purple-950 border border-spell-purple-800 shadow-card-fantasy overflow-hidden">
      {/* Header Meja Mantra */}
      <div className="flex items-center justify-between px-4 py-3 bg-spell-purple-900 border-b border-spell-purple-800">
        <div className="flex items-center gap-2">
          <span className="text-base font-extrabold text-white">📜 Meja Mantra</span>
          <span className="px-2 py-0.5 rounded-full bg-spell-purple-800 text-xs text-spell-teal-300 font-bold">
            {nodes.length} Blok
          </span>
        </div>

        {nodes.length > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleClear}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-spell-coral-400 hover:text-spell-coral-300 hover:bg-spell-coral-500/10 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan</span>
          </button>
        )}
      </div>

      {/* Konten Daftar Slot Mantra */}
      <div className="p-3 sm:p-4 min-h-[220px] max-h-[340px] overflow-y-auto flex flex-col gap-2.5">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-auto py-8 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-spell-purple-900 flex items-center justify-center text-spell-purple-400 mb-2 border border-spell-purple-800">
              <span className="text-xl">✨</span>
            </div>
            <p className="text-sm font-bold text-spell-purple-200">Meja Mantra Masih Kosong</p>
            <p className="text-xs text-spell-purple-400 mt-1 max-w-[260px]">
              Klik tombol rune di rak bawah untuk meracik mantra pertamamu!
            </p>
          </div>
        ) : (
          nodes.map((node, index) => {
            const isActive = activeNodeId === node.id;
            const isMisfire = misfireNodeId === node.id;

            if (node.type === "ACTION") {
              const actionNode = node as ActionNode;
              const info = getCommandInfo(actionNode.command);
              const Icon = info.icon;

              return (
                <div
                  key={node.id}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-rune border transition-all ${
                    info.bg
                  } ${
                    isActive
                      ? "ring-4 ring-spell-gold-400 scale-[1.02] shadow-glow-gold z-10"
                      : isMisfire
                      ? "ring-4 ring-spell-coral-400 bg-spell-coral-500/30"
                      : "hover:border-spell-purple-400/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-black/30 flex items-center justify-center text-xs font-mono font-bold text-spell-purple-200">
                      {index + 1}
                    </span>
                    <Icon className="w-4 h-4 text-spell-gold-300" />
                    <span className="text-sm font-bold text-white">{info.label}</span>
                  </div>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleRemove(node.id)}
                    className="p-1 rounded-md text-spell-purple-400 hover:text-spell-coral-400 hover:bg-black/20 transition-colors disabled:opacity-40"
                    aria-label={`Hapus langkah ${index + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            }

            if (node.type === "REPEAT") {
              const repeatNode = node as RepeatNode;

              return (
                <div
                  key={node.id}
                  className={`p-3 rounded-rune border-2 border-dashed border-amber-500/60 bg-amber-950/20 flex flex-col gap-2 transition-all ${
                    isActive
                      ? "ring-4 ring-spell-gold-400 shadow-glow-gold"
                      : isMisfire
                      ? "ring-4 ring-spell-coral-400 bg-spell-coral-500/30"
                      : ""
                  }`}
                >
                  {/* Header Repeat Block */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-amber-500/30 flex items-center justify-center text-xs font-mono font-bold text-spell-gold-300">
                        {index + 1}
                      </span>
                      <Repeat className="w-4 h-4 text-spell-gold-400" />
                      <span className="text-sm font-extrabold text-spell-gold-300">
                        Ulangi {repeatNode.count} Kali:
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onUpdateRepeatCount && (
                        <div className="flex items-center bg-spell-purple-900 rounded-md border border-spell-purple-700">
                          <button
                            type="button"
                            disabled={disabled || repeatNode.count <= 2}
                            onClick={() => onUpdateRepeatCount(node.id, repeatNode.count - 1)}
                            className="p-1 text-spell-purple-300 hover:text-white disabled:opacity-30"
                            aria-label="Kurangi jumlah perulangan"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold font-mono text-spell-gold-300">
                            {repeatNode.count}
                          </span>
                          <button
                            type="button"
                            disabled={disabled || repeatNode.count >= 10}
                            onClick={() => onUpdateRepeatCount(node.id, repeatNode.count + 1)}
                            className="p-1 text-spell-purple-300 hover:text-white disabled:opacity-30"
                            aria-label="Tambah jumlah perulangan"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleRemove(node.id)}
                        className="p-1 text-spell-purple-400 hover:text-spell-coral-400"
                        aria-label="Hapus blok perulangan"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Isi di Dalam Blok Repeat */}
                  <div className="pl-6 flex flex-col gap-1.5 border-l-2 border-amber-500/40 my-1">
                    {repeatNode.body.length === 0 ? (
                      <p className="text-xs text-amber-300/70 italic py-1">
                        Pilih aksi untuk dimasukkan ke dalam perulangan ini:
                      </p>
                    ) : (
                      repeatNode.body.map((subNode, subIdx) => {
                        const isSubActive = activeNodeId === subNode.id;
                        const subAction = subNode as ActionNode;
                        const info = getCommandInfo(subAction.command);
                        const Icon = info.icon;

                        return (
                          <div
                            key={subNode.id}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs font-bold transition-all ${
                              info.bg
                            } ${
                              isSubActive
                                ? "ring-2 ring-spell-gold-400 shadow-glow-gold scale-[1.02]"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5 text-spell-gold-300" />
                              <span className="text-white">{info.label}</span>
                            </div>

                            {onRemoveSubAction && (
                              <button
                                type="button"
                                disabled={disabled}
                                onClick={() => onRemoveSubAction(node.id, subIdx)}
                                className="text-spell-purple-400 hover:text-spell-coral-400"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Quick Add Sub Action Buttons */}
                    {onAddSubAction && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {allowedRunes.map((cmd) => (
                          <button
                            key={cmd}
                            type="button"
                            disabled={disabled}
                            onClick={() => onAddSubAction(node.id, cmd)}
                            className="px-2 py-1 rounded bg-spell-purple-800 hover:bg-spell-purple-700 text-[11px] font-semibold text-spell-teal-300 border border-spell-purple-600 transition-colors disabled:opacity-40"
                          >
                            + {cmd === "STEP_FORWARD" ? "Maju" : cmd === "TURN_LEFT" ? "Kiri" : cmd === "TURN_RIGHT" ? "Kanan" : cmd}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return null;
          })
        )}
      </div>
    </div>
  );
}
