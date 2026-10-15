"use client";

import { ActionNode, AstNode, CommandType, RepeatNode, IfNode, ConditionType } from "@/lib/engine/types";
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
  ChevronUp,
  ChevronDown,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { soundManager } from "@/lib/audio/soundManager";
import { Badge } from "@/components/ui/Badge";

interface SpellDeckProps {
  nodes: AstNode[];
  activeNodeId?: string;
  misfireNodeId?: string;
  parSteps?: number;
  onRemoveNode: (nodeId: string) => void;
  onClearDeck: () => void;
  onMoveNode?: (fromIndex: number, toIndex: number) => void;
  onUpdateRepeatCount?: (nodeId: string, newCount: number) => void;
  onAddSubAction?: (repeatId: string, command: CommandType) => void;
  onRemoveSubAction?: (repeatId: string, subIndex: number) => void;
  allowedRunes?: CommandType[];
  disabled?: boolean;
  allowCondition?: boolean;
  onAddSubCondition?: (repeatId: string, condition?: ConditionType) => void;
  onUpdateCondition?: (nodeId: string, condition: ConditionType) => void;
  onUpdateSubCondition?: (repeatId: string, subIfId: string, condition: ConditionType) => void;
  onAddSubIfAction?: (repeatId: string, subIfId: string, command: CommandType) => void;
  onRemoveSubIfAction?: (repeatId: string, subIfId: string, actionIndex: number) => void;
}

export function SpellDeck({
  nodes,
  activeNodeId,
  misfireNodeId,
  parSteps,
  onRemoveNode,
  onClearDeck,
  onMoveNode,
  onUpdateRepeatCount,
  onAddSubAction,
  onRemoveSubAction,
  allowedRunes = ["STEP_FORWARD", "TURN_LEFT", "TURN_RIGHT"],
  disabled = false,
  allowCondition = false,
  onAddSubCondition,
  onUpdateCondition,
  onUpdateSubCondition,
  onAddSubIfAction,
  onRemoveSubIfAction,
}: SpellDeckProps) {
  const getCommandInfo = (command: CommandType) => {
    switch (command) {
      case "STEP_FORWARD":
        return { label: "Maju 1 Langkah", icon: ArrowUp, bg: "bg-spell-teal-700/60 border-spell-teal-500/40 text-spell-teal-200" };
      case "TURN_LEFT":
        return { label: "Putar Kiri", icon: RotateCcw, bg: "bg-spell-purple-800/80 border-spell-purple-500/40 text-spell-purple-200" };
      case "TURN_RIGHT":
        return { label: "Putar Kanan", icon: RotateCw, bg: "bg-spell-purple-800/80 border-spell-purple-500/40 text-spell-purple-200" };
      case "LIGHT_TORCH":
        return { label: "Nyalakan Lentera", icon: Flame, bg: "bg-spell-gold-600/60 border-spell-gold-400/50 text-spell-gold-200" };
      case "COLLECT_SHARD":
        return { label: "Ambil Kristal", icon: Diamond, bg: "bg-cyan-700/60 border-cyan-400/40 text-cyan-200" };
      case "CAST_SPELL":
        return { label: "Lontarkan Mantra", icon: Sparkles, bg: "bg-purple-600/60 border-purple-400/50 text-purple-200" };
      case "ACTIVATE":
        return { label: "Aktivasi Benda", icon: Sparkles, bg: "bg-amber-600/60 border-amber-400/50 text-amber-200" };
      default:
        return { label: "Aksi Khusus", icon: Sparkles, bg: "bg-spell-purple-700/60 border-spell-purple-500/40 text-spell-purple-200" };
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

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (disabled || !onMoveNode) return;
    soundManager.playClick();
    onMoveNode(fromIndex, toIndex);
  };

  // Indikator Efisiensi Langkah (Par Steps Rating)
  const getEfficiencyBadge = () => {
    if (!parSteps) return null;
    const count = nodes.length;
    if (count <= parSteps) {
      return (
        <Badge variant="gold" size="sm">
          <Sparkles className="w-3 h-3 mr-1" />
          <span>Optimal (Par {parSteps}) ⭐⭐⭐</span>
        </Badge>
      );
    } else if (count <= parSteps + 2) {
      return (
        <Badge variant="teal" size="sm">
          <span>Bagus (Par +{count - parSteps}) ⭐⭐</span>
        </Badge>
      );
    } else {
      return (
        <Badge variant="coral" size="sm">
          <span>Panjang (+{count - parSteps}) ⭐</span>
        </Badge>
      );
    }
  };

  return (
    <div className="w-full flex flex-col rounded-card bg-spell-purple-950 border border-spell-purple-800 shadow-card-fantasy overflow-hidden">
      {/* Header Meja Mantra */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-spell-purple-900 border-b border-spell-purple-800 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-base font-black text-white">📜 Meja Mantra</span>
          <span className="px-2.5 py-0.5 rounded-full bg-spell-purple-800 border border-spell-purple-700 text-xs text-spell-teal-300 font-bold font-mono">
            {nodes.length} Blok
          </span>
          {getEfficiencyBadge()}
        </div>

        {nodes.length > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleClear}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-spell-coral-400 hover:text-spell-coral-300 hover:bg-spell-coral-500/10 transition-colors disabled:opacity-40"
            title="Kosongkan seluruh meja mantra"
            aria-label="Kosongkan Meja Mantra"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan</span>
          </button>
        )}
      </div>

      {/* Konten Daftar Slot Mantra */}
      <div className="p-3 sm:p-4 min-h-[200px] max-h-[360px] overflow-y-auto flex flex-col gap-2">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-auto py-10 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-spell-purple-900 flex items-center justify-center text-spell-purple-400 mb-2 border border-spell-purple-800 shadow-inner">
              <span className="text-xl">✨</span>
            </div>
            <p className="text-sm font-bold text-white">Meja Mantra Masih Kosong</p>
            <p className="text-xs text-spell-purple-300 mt-1 max-w-[280px] leading-relaxed">
              Klik salah satu tombol rune di rak bawah untuk mulai meracik instruksi sihirmu!
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
                      ? "ring-4 ring-spell-teal-400 bg-spell-teal-900/80 scale-[1.02] shadow-[0_0_20px_rgba(45,212,191,0.5)] z-10"
                      : isMisfire
                      ? "ring-4 ring-spell-coral-400 bg-spell-coral-950 border-spell-coral-500 animate-pulse"
                      : "hover:border-spell-purple-400/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-black/40 flex items-center justify-center text-xs font-mono font-black text-spell-purple-200">
                      {index + 1}
                    </span>
                    <Icon className="w-4 h-4 text-spell-gold-300 shrink-0" />
                    <span className="text-sm font-bold text-white">{info.label}</span>
                  </div>

                  {/* Kontrol Interaksi Blok: Naik, Turun, Hapus */}
                  <div className="flex items-center gap-1 shrink-0">
                    {onMoveNode && (
                      <>
                        <button
                          type="button"
                          disabled={disabled || index === 0}
                          onClick={() => handleMove(index, index - 1)}
                          className="p-1.5 sm:p-1 min-w-[32px] min-h-[32px] flex items-center justify-center rounded text-spell-purple-300 hover:text-white hover:bg-black/20 disabled:opacity-20 transition-colors"
                          title="Geser ke atas"
                          aria-label={`Geser langkah ${index + 1} ke atas`}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={disabled || index === nodes.length - 1}
                          onClick={() => handleMove(index, index + 1)}
                          className="p-1.5 sm:p-1 min-w-[32px] min-h-[32px] flex items-center justify-center rounded text-spell-purple-300 hover:text-white hover:bg-black/20 disabled:opacity-20 transition-colors"
                          title="Geser ke bawah"
                          aria-label={`Geser langkah ${index + 1} ke bawah`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleRemove(node.id)}
                      className="p-1.5 sm:p-1 min-w-[32px] min-h-[32px] flex items-center justify-center rounded text-spell-purple-400 hover:text-spell-coral-400 hover:bg-black/20 transition-colors disabled:opacity-30 ml-0.5"
                      title="Hapus balok ini"
                      aria-label={`Hapus langkah ${index + 1}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            }

            if (node.type === "REPEAT") {
              const repeatNode = node as RepeatNode;

              return (
                <div
                  key={node.id}
                  className={`p-3 rounded-rune border-2 border-dashed border-amber-500/70 bg-amber-950/25 flex flex-col gap-2 transition-all ${
                    isActive
                      ? "ring-4 ring-spell-gold-400 bg-amber-950/50 shadow-glow-gold scale-[1.01]"
                      : isMisfire
                      ? "ring-4 ring-spell-coral-400 bg-spell-coral-950/60 border-spell-coral-500 animate-pulse"
                      : ""
                  }`}
                >
                  {/* Header Repeat Block */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-amber-500/30 flex items-center justify-center text-xs font-mono font-bold text-spell-gold-300">
                        {index + 1}
                      </span>
                      <Repeat className="w-4 h-4 text-spell-gold-400 shrink-0" />
                      <span className="text-sm font-extrabold text-spell-gold-300">
                        Ulangi {repeatNode.count} Kali:
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Counter Stepper */}
                      {onUpdateRepeatCount && (
                        <div className="flex items-center bg-spell-purple-900 rounded-md border border-spell-purple-700">
                          <button
                            type="button"
                            disabled={disabled || repeatNode.count <= 2}
                            onClick={() => onUpdateRepeatCount(node.id, repeatNode.count - 1)}
                            className="p-1.5 text-spell-purple-300 hover:text-white disabled:opacity-30 min-w-[28px] min-h-[28px] flex items-center justify-center"
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
                            className="p-1.5 text-spell-purple-300 hover:text-white disabled:opacity-30 min-w-[28px] min-h-[28px] flex items-center justify-center"
                            aria-label="Tambah jumlah perulangan"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Reorder Buttons */}
                      {onMoveNode && (
                        <>
                          <button
                            type="button"
                            disabled={disabled || index === 0}
                            onClick={() => handleMove(index, index - 1)}
                            className="p-1.5 sm:p-1 min-w-[32px] min-h-[32px] flex items-center justify-center rounded text-spell-purple-300 hover:text-white disabled:opacity-20"
                            title="Geser ke atas"
                            aria-label={`Geser blok perulangan ${index + 1} ke atas`}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={disabled || index === nodes.length - 1}
                            onClick={() => handleMove(index, index + 1)}
                            className="p-1.5 sm:p-1 min-w-[32px] min-h-[32px] flex items-center justify-center rounded text-spell-purple-300 hover:text-white disabled:opacity-20"
                            title="Geser ke bawah"
                            aria-label={`Geser blok perulangan ${index + 1} ke bawah`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleRemove(node.id)}
                        className="p-1.5 sm:p-1 min-w-[32px] min-h-[32px] flex items-center justify-center text-spell-purple-400 hover:text-spell-coral-400 disabled:opacity-30 ml-0.5"
                        title="Hapus blok perulangan"
                        aria-label="Hapus blok perulangan"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Isi di Dalam Blok Repeat */}
                  <div className="pl-6 flex flex-col gap-1.5 border-l-2 border-amber-500/50 my-1">
                    {repeatNode.body.length === 0 ? (
                      <p className="text-xs text-amber-300/80 italic py-1">
                        Pilih aksi dari rak di bawah untuk dimasukkan ke dalam perulangan ini:
                      </p>
                    ) : (
                      repeatNode.body.map((subNode, subIdx) => {
                        if (subNode.type === "ACTION") {
                          const isSubActive = activeNodeId === subNode.id;
                          const subAction = subNode as ActionNode;
                          const info = getCommandInfo(subAction.command);
                          const Icon = info.icon;
                          const isSubMisfire = misfireNodeId === subNode.id;

                          return (
                            <div
                              key={subNode.id}
                              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs font-bold transition-all ${
                                info.bg
                              } ${
                                isSubActive
                                  ? "ring-2 ring-spell-gold-400 shadow-glow-gold scale-[1.02]"
                                  : isSubMisfire
                                  ? "ring-2 ring-spell-coral-400 bg-spell-coral-950/80 border-spell-coral-500 animate-pulse"
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
                                  aria-label={`Hapus sub-aksi ${subIdx + 1}`}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        }

                        if (subNode.type === "IF") {
                          const subIf = subNode as IfNode;
                          const isSubIfActive = activeNodeId === subIf.id;
                          const isSubIfMisfire = misfireNodeId === subIf.id;

                          return (
                            <div
                              key={subIf.id}
                              className={`p-2.5 rounded-lg border-2 border-dashed border-cyan-500/80 bg-cyan-950/40 flex flex-col gap-2 my-1 transition-all ${
                                isSubIfActive
                                  ? "ring-2 ring-cyan-400 bg-cyan-950/60 shadow-glow-cyan"
                                  : isSubIfMisfire
                                  ? "ring-2 ring-spell-coral-400 bg-spell-coral-950/70 border-spell-coral-500 animate-pulse"
                                  : ""
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-extrabold text-cyan-300">JIKA:</span>
                                  <select
                                    disabled={disabled}
                                    value={subIf.condition}
                                    onChange={(e) =>
                                      onUpdateSubCondition?.(node.id, subIf.id, e.target.value as ConditionType)
                                    }
                                    className="bg-cyan-900 border border-cyan-600 text-cyan-100 text-[11px] rounded px-1.5 py-0.5 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400"
                                  >
                                    <option value="IS_OBSTACLE_AHEAD">Ada Rintangan di Depan</option>
                                    <option value="IS_CLEAR_AHEAD">Jalan Terbuka di Depan</option>
                                    <option value="IS_SHARD_PRESENT">Ada Kristal di Kotak Ini</option>
                                    <option value="IS_TORCH_PRESENT">Ada Lentera di Kotak Ini</option>
                                    <option value="IS_PORTAL_PRESENT">Ada Gerbang di Kotak Ini</option>
                                  </select>
                                </div>

                                {onRemoveSubAction && (
                                  <button
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => onRemoveSubAction(node.id, subIdx)}
                                    className="p-1 text-spell-purple-400 hover:text-spell-coral-400"
                                    aria-label="Hapus blok jika bersarang"
                                    title="Hapus blok jika bersarang"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              {/* Cabang Maka di dalam Sub-If */}
                              <div className="pl-4 flex flex-col gap-1 border-l-2 border-cyan-500/50">
                                <span className="text-[10px] font-bold text-cyan-400">Maka:</span>
                                {subIf.thenBody.length === 0 ? (
                                  <p className="text-[11px] text-cyan-300/60 italic">Belum ada aksi</p>
                                ) : (
                                  subIf.thenBody.map((thenNode, thenIdx) => {
                                    if (thenNode.type !== "ACTION") return null;
                                    const thenAction = thenNode as ActionNode;
                                    const info = getCommandInfo(thenAction.command);
                                    const Icon = info.icon;
                                    const isThenActive = activeNodeId === thenNode.id;
                                    const isThenMisfire = misfireNodeId === thenNode.id;

                                    return (
                                      <div
                                        key={thenNode.id}
                                        className={`flex items-center justify-between px-2 py-1 rounded border text-[11px] font-bold ${
                                          info.bg
                                        } ${
                                          isThenActive
                                            ? "ring-2 ring-cyan-400 shadow-glow-cyan"
                                            : isThenMisfire
                                            ? "ring-2 ring-spell-coral-400 bg-spell-coral-950/80 border-spell-coral-500"
                                            : ""
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5">
                                          <Icon className="w-3 h-3 text-spell-gold-300" />
                                          <span className="text-white">{info.label}</span>
                                        </div>
                                        {onRemoveSubIfAction && (
                                          <button
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => onRemoveSubIfAction(node.id, subIf.id, thenIdx)}
                                            className="text-spell-purple-400 hover:text-spell-coral-400"
                                            aria-label="Hapus aksi syarat"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    );
                                  })
                                )}

                                {/* Tombol aksi cepat untuk sub-IF */}
                                {onAddSubIfAction && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {allowedRunes.map((cmd) => (
                                      <button
                                        key={cmd}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onAddSubIfAction(node.id, subIf.id, cmd)}
                                        className="px-1.5 py-0.5 rounded bg-cyan-900/90 hover:bg-cyan-800 text-[10px] font-bold text-cyan-200 border border-cyan-700/60 transition-colors disabled:opacity-40"
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

                    {/* Quick Add Sub Action Buttons */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {onAddSubAction &&
                        allowedRunes.map((cmd) => (
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

                      {allowCondition && onAddSubCondition && (
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => onAddSubCondition(node.id, "IS_OBSTACLE_AHEAD")}
                          className="px-2 py-1 rounded bg-cyan-900 hover:bg-cyan-800 text-[11px] font-bold text-cyan-200 border border-cyan-500 shadow-sm transition-colors disabled:opacity-40 flex items-center gap-1"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-cyan-300" />
                          <span>+ Jika (Kondisi)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            if (node.type === "IF") {
              const ifNode = node as IfNode;

              return (
                <div
                  key={node.id}
                  className={`p-3 rounded-rune border-2 border-dashed border-cyan-500/70 bg-cyan-950/25 flex flex-col gap-2 transition-all ${
                    isActive
                      ? "ring-4 ring-cyan-400 bg-cyan-950/50 shadow-glow-cyan scale-[1.01]"
                      : isMisfire
                      ? "ring-4 ring-spell-coral-400 bg-spell-coral-950/60 border-spell-coral-500 animate-pulse"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-md bg-cyan-500/30 flex items-center justify-center text-xs font-mono font-bold text-cyan-300">
                        {index + 1}
                      </span>
                      <span className="text-sm font-extrabold text-cyan-300">
                        JIKA:
                      </span>
                      <select
                        disabled={disabled}
                        value={ifNode.condition}
                        onChange={(e) =>
                          onUpdateCondition?.(node.id, e.target.value as ConditionType)
                        }
                        className="bg-cyan-900 border border-cyan-600 text-cyan-100 text-xs rounded px-2 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-cyan-400 max-w-[170px] sm:max-w-none"
                      >
                        <option value="IS_OBSTACLE_AHEAD">Ada Rintangan di Depan</option>
                        <option value="IS_CLEAR_AHEAD">Jalan Terbuka di Depan</option>
                        <option value="IS_SHARD_PRESENT">Ada Kristal di Kotak Ini</option>
                        <option value="IS_TORCH_PRESENT">Ada Lentera di Kotak Ini</option>
                        <option value="IS_PORTAL_PRESENT">Ada Gerbang di Kotak Ini</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {onMoveNode && (
                        <>
                          <button
                            type="button"
                            disabled={disabled || index === 0}
                            onClick={() => handleMove(index, index - 1)}
                            className="p-1.5 sm:p-1 min-w-[32px] min-h-[32px] flex items-center justify-center rounded text-spell-purple-300 hover:text-white disabled:opacity-20"
                            title="Geser ke atas"
                            aria-label={`Geser blok jika ${index + 1} ke atas`}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            disabled={disabled || index === nodes.length - 1}
                            onClick={() => handleMove(index, index + 1)}
                            className="p-1.5 sm:p-1 min-w-[32px] min-h-[32px] flex items-center justify-center rounded text-spell-purple-300 hover:text-white disabled:opacity-20"
                            title="Geser ke bawah"
                            aria-label={`Geser blok jika ${index + 1} ke bawah`}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleRemove(node.id)}
                        className="p-1.5 sm:p-1 min-w-[32px] min-h-[32px] flex items-center justify-center text-spell-purple-400 hover:text-spell-coral-400 disabled:opacity-30 ml-0.5"
                        title="Hapus blok jika"
                        aria-label="Hapus blok jika"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Cabang Then */}
                  <div className="pl-6 flex flex-col gap-1.5 border-l-2 border-cyan-500/50 my-1">
                    <span className="text-[11px] font-bold text-cyan-400">Maka:</span>
                    {ifNode.thenBody.length === 0 ? (
                      <p className="text-xs text-cyan-300/60 italic py-1">Belum ada aksi</p>
                    ) : (
                      ifNode.thenBody.map((subNode: AstNode, subIdx: number) => {
                        if (subNode.type !== "ACTION") return null;
                        const subAction = subNode as ActionNode;
                        const info = getCommandInfo(subAction.command);
                        const Icon = info.icon;
                        const isSubActive = activeNodeId === subNode.id;
                        const isSubMisfire = misfireNodeId === subNode.id;

                        return (
                          <div
                            key={subNode.id}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs font-bold transition-all ${
                              info.bg
                            } ${
                              isSubActive
                                ? "ring-2 ring-cyan-400 shadow-glow-cyan scale-[1.02]"
                                : isSubMisfire
                                ? "ring-2 ring-spell-coral-400 bg-spell-coral-950/80 border-spell-coral-500 animate-pulse"
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
                                aria-label={`Hapus aksi syarat ${subIdx + 1}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Quick Add Sub Action ke Blok If */}
                    {onAddSubAction && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {allowedRunes.map((cmd) => (
                          <button
                            key={cmd}
                            type="button"
                            disabled={disabled}
                            onClick={() => onAddSubAction(node.id, cmd)}
                            className="px-2 py-1 rounded bg-cyan-900/80 hover:bg-cyan-800 text-[11px] font-semibold text-cyan-200 border border-cyan-700/60 transition-colors disabled:opacity-40"
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
