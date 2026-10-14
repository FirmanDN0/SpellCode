"use client";

import React, { useState } from "react";
import { Sparkles, HelpCircle, AlertCircle, CheckCircle2, RotateCcw, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DebuggerGuideProps {
  message: string;
  hintText?: string;
  hints?: string[];
  type?: "info" | "hint" | "misfire" | "victory";
  onShowHint?: () => void;
  onReset?: () => void;
  onStepDebug?: () => void;
  stepNumber?: number;
  conditionFailed?: string;
}

export function DebuggerGuide({
  message,
  hintText,
  hints,
  type = "info",
  onShowHint,
  onReset,
  onStepDebug,
  stepNumber,
  conditionFailed,
}: DebuggerGuideProps) {
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintStep, setHintStep] = useState(0);

  const iconInfo = {
    info: {
      icon: Sparkles,
      color: "text-spell-gold-300",
      border: "border-spell-purple-700/80",
      bg: "bg-spell-purple-900/90",
      title: "Pyx si Kucing Api (Pendamping)",
    },
    hint: {
      icon: HelpCircle,
      color: "text-spell-teal-300",
      border: "border-spell-teal-500/60",
      bg: "bg-spell-purple-900/90",
      title: "Petunjuk Langkah dari Pyx",
    },
    misfire: {
      icon: AlertCircle,
      color: "text-spell-coral-400",
      border: "border-spell-coral-500/70",
      bg: "bg-spell-coral-950/40",
      title: "Getaran Misfire: Analisis Kesalahan",
    },
    victory: {
      icon: CheckCircle2,
      color: "text-spell-emerald-400",
      border: "border-spell-emerald-500/60",
      bg: "bg-spell-purple-900/90",
      title: "Mantra Sukses!",
    },
  }[type];

  const Icon = iconInfo.icon;
  const isMisfire = type === "misfire";

  return (
    <div
      className={`w-full flex flex-col p-3.5 sm:p-4 rounded-card border shadow-card-fantasy transition-all ${
        iconInfo.bg
      } ${iconInfo.border} ${
        isMisfire ? "ring-2 ring-spell-coral-500/40" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Sprite Pyx si Kucing Api */}
        <div className="relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-rune-gold border-2 border-amber-300/60 overflow-hidden">
          <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow" fill="none">
            {/* Telinga Kucing Api */}
            <polygon points="12,8 20,20 8,18" fill="#DC2626" />
            <polygon points="14,11 18,18 10,17" fill="#FBBF24" />
            <polygon points="36,8 40,18 28,20" fill="#DC2626" />
            <polygon points="34,11 38,17 30,18" fill="#FBBF24" />

            {/* Kepala Kucing */}
            <ellipse cx="24" cy="27" rx="14" ry="12" fill="#EA580C" />

            {/* Api Kening Khas Sihir */}
            <path d="M24 16 Q 26 21, 24 23 Q 22 21, 24 16 Z" fill="#FDE68A" />

            {/* Mata Bulat Besar Ramah */}
            <ellipse cx="19" cy="26" rx="3.5" ry="4" fill="#FEF08A" />
            <ellipse cx="29" cy="26" rx="3.5" ry="4" fill="#FEF08A" />
            <circle cx="19.5" cy="26" r="2" fill="#1C1917" />
            <circle cx="28.5" cy="26" r="2" fill="#1C1917" />
            <circle cx="18.5" cy="24.5" r="1" fill="#FFFFFF" />
            <circle cx="27.5" cy="24.5" r="1" fill="#FFFFFF" />

            {/* Hidung & Senyum Kucing */}
            <polygon points="24,31 22.5,29.5 25.5,29.5" fill="#7C2D12" />
            <path d="M21 32 Q 24 35, 27 32" stroke="#7C2D12" strokeWidth="1.2" strokeLinecap="round" />

            {/* Kumis Lucu */}
            <line x1="12" y1="28" x2="6" y2="27" stroke="#FED7AA" strokeWidth="1" strokeLinecap="round" />
            <line x1="12" y1="31" x2="7" y2="33" stroke="#FED7AA" strokeWidth="1" strokeLinecap="round" />
            <line x1="36" y1="28" x2="42" y2="27" stroke="#FED7AA" strokeWidth="1" strokeLinecap="round" />
            <line x1="36" y1="31" x2="41" y2="33" stroke="#FED7AA" strokeWidth="1" strokeLinecap="round" />
          </svg>

          {/* Indikator Online Sahabat */}
          <span
            className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border border-spell-purple-950 ${
              isMisfire ? "bg-spell-coral-400" : "bg-spell-teal-400"
            }`}
          />
        </div>

        {/* Balon Ucapan & Penjelasan */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-black text-spell-gold-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Icon className={`w-3.5 h-3.5 ${iconInfo.color}`} />
              <span>{iconInfo.title}</span>
              {isMisfire && stepNumber !== undefined && stepNumber > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-spell-coral-950/80 border border-spell-coral-500/50 text-[10px] font-mono font-bold text-spell-coral-300">
                  Langkah {stepNumber}
                </span>
              )}
            </span>

            {(hintText || (hints && hints.length > 0)) && (
              <button
                type="button"
                onClick={() => {
                  setShowHintModal(!showHintModal);
                  onShowHint?.();
                }}
                className="text-xs font-bold text-spell-teal-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5 text-spell-gold-400" />
                <span>{showHintModal ? "Tutup Petunjuk" : "Butuh Petunjuk?"}</span>
              </button>
            )}
          </div>

          <p
            className={`text-xs sm:text-sm font-semibold leading-relaxed ${
              isMisfire ? "text-spell-coral-200" : "text-spell-purple-100"
            }`}
          >
            {message}
          </p>

          {/* Banner Kondisi Gagal jika ada */}
          {isMisfire && conditionFailed && (
            <div className="mt-1.5 p-2 rounded-lg bg-spell-coral-950/60 border border-spell-coral-500/40 text-[11px] text-spell-coral-200 leading-snug">
              <strong>Kondisi yang belum terpenuhi: </strong>
              <span>{conditionFailed}</span>
            </div>
          )}

          {/* Tips Tambahan Khusus Misfire Error */}
          {isMisfire && (
            <div className="mt-2 p-2 rounded-lg bg-black/40 border border-spell-coral-500/30 text-[11px] text-spell-coral-300 leading-snug">
              <strong>💡 Pyx Berbisik: </strong>
              <span>
                Periksa balok yang berkedip merah di Meja Mantra. Kamu bisa menekan tombol <strong>Langkah</strong> untuk melacak gerakan penyihir satu per satu!
              </span>
            </div>
          )}

          {/* Tombol Aksi Debug & Reset Cepat */}
          {isMisfire && (onReset || onStepDebug) && (
            <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-spell-coral-500/30">
              {onReset && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onReset}
                  className="text-xs h-7 px-2.5 flex items-center gap-1.5 bg-spell-purple-850 hover:bg-spell-purple-700 text-spell-coral-200 border border-spell-coral-500/40"
                >
                  <RotateCcw className="w-3 h-3 text-spell-coral-400" />
                  <span>Ulangi Misi (Reset)</span>
                </Button>
              )}
              {onStepDebug && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={onStepDebug}
                  className="text-xs h-7 px-2.5 flex items-center gap-1.5 bg-spell-teal-950/60 hover:bg-spell-teal-900 text-spell-teal-200 border border-spell-teal-500/40"
                >
                  <Sparkles className="w-3 h-3 text-spell-gold-300" />
                  <span>Telusuri Langkah (Step)</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Accordion Panel Petunjuk Bertahap */}
      {showHintModal && (hintText || (hints && hints.length > 0)) && (
        <div className="mt-3 pt-3 border-t border-spell-purple-800 p-2.5 rounded-xl bg-spell-teal-950/60 border border-spell-teal-500/30 text-xs text-spell-teal-200 leading-relaxed animate-in fade-in duration-200">
          <p className="font-bold text-spell-teal-100 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-spell-gold-300" />
            <span>Petunjuk Misi dari Pyx:</span>
          </p>

          {hints && hints.length > 0 ? (
            <div className="flex flex-col gap-2">
              {hints.slice(0, hintStep + 1).map((h, i) => (
                <div key={i} className="p-2 rounded bg-spell-teal-900/50 border border-spell-teal-600/30">
                  <span className="font-bold text-spell-gold-300 mr-1.5">Petunjuk {i + 1}:</span>
                  <span>{h}</span>
                </div>
              ))}

              {hintStep < hints.length - 1 && (
                <button
                  type="button"
                  onClick={() => setHintStep((prev) => Math.min(prev + 1, hints.length - 1))}
                  className="self-start text-[11px] font-bold text-spell-gold-300 hover:text-white underline mt-1"
                >
                  Masih bingung? Buka petunjuk berikutnya ({hintStep + 2}/{hints.length})
                </button>
              )}
            </div>
          ) : (
            <p>{hintText}</p>
          )}
        </div>
      )}
    </div>
  );
}
