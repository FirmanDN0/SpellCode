"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Star,
  Zap,
  Award,
  ArrowRight,
  RotateCcw,
  Map,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { soundManager } from "@/lib/audio/soundManager";
import { Button } from "../ui/Button";

interface VictoryModalProps {
  isOpen: boolean;
  stars: number;
  stepsTaken: number;
  parSteps: number;
  instructionCount?: number;
  xpEarned: number;
  message: string;
  nextLevelId?: string;
  isNewRank?: boolean;
  newRank?: string;
  syncState?: "idle" | "saving" | "saved" | "failed";
  syncError?: string | null;
  onRetrySync?: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export function VictoryModal({
  isOpen,
  stars,
  stepsTaken,
  parSteps,
  instructionCount,
  xpEarned,
  message,
  nextLevelId,
  isNewRank = false,
  newRank,
  syncState = "saved",
  syncError = null,
  onRetrySync,
  onRetry,
  onClose,
}: VictoryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement;

    soundManager.playVictory();
    // Mainkan chime bintang berurutan
    for (let i = 1; i <= stars; i++) {
      setTimeout(() => {
        soundManager.playStar(i);
      }, 300 + i * 250);
    }

    // Auto-fokus ke tombol aksi utama
    const focusTimer = setTimeout(() => {
      const primaryBtn = modalRef.current?.querySelector<HTMLElement>(
        'a[href], button'
      );
      primaryBtn?.focus();
    }, 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Focus Trap WCAG AA
      if (e.key === "Tab") {
        if (!modalRef.current) return;
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [isOpen, stars, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md p-5 sm:p-8 rounded-dialog bg-gradient-to-b from-spell-purple-900 to-spell-purple-950 border-2 border-spell-gold-400/80 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.25)] flex flex-col items-center text-center"
      >
        {/* Hiasan Puncak */}
        <div className="absolute -top-6 px-6 py-1.5 rounded-full bg-gradient-to-r from-spell-gold-600 via-spell-gold-400 to-spell-gold-600 border-2 border-white text-spell-purple-950 font-black text-sm tracking-wider uppercase shadow-lg">
          {nextLevelId ? "✨ Mantra Selesai! ✨" : "🏆 Seluruh Realm Ditaklukkan! 🏆"}
        </div>

        {/* Tampilan Bintang Bouncy */}
        <div className="flex items-center justify-center gap-3 my-4 pt-2">
          {[1, 2, 3].map((starIndex) => {
            const isEarned = starIndex <= stars;
            return (
              <div
                key={starIndex}
                className={`relative transition-all duration-300 transform ${isEarned
                    ? "scale-110 animate-bounce"
                    : "opacity-30 scale-90"
                  }`}
                style={{ animationDelay: `${starIndex * 150}ms` }}
              >
                <Star
                  className={`w-12 h-12 sm:w-14 sm:h-14 ${isEarned
                      ? "text-spell-gold-400 fill-spell-gold-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]"
                      : "text-spell-purple-600 fill-spell-purple-800"
                    }`}
                />
              </div>
            );
          })}
        </div>

        {/* Judul & Pesan Kemenangan */}
        <h2 id="victory-title" className="text-2xl font-black text-white mt-1">
          {stars === 3 ? "Sempurna! 3 Bintang" : stars === 2 ? "Hebat! 2 Bintang" : "Bagus! 1 Bintang"}
        </h2>
        <p className="text-sm text-spell-purple-200 mt-1 max-w-xs">{message}</p>

        {/* Notifikasi Kenaikan Gelar (Rank Up) */}
        {isNewRank && newRank && (
          <div className="w-full my-3 p-3 rounded-rune bg-spell-gold-500/15 border border-spell-gold-400/40 flex items-center justify-center gap-2 text-spell-gold-300 text-sm font-bold animate-pulse">
            <Award className="w-5 h-5 text-spell-gold-400 shrink-0" />
            <span>Selamat! Kamu naik pangkat menjadi {newRank}!</span>
          </div>
        )}

        {/* Statistik Langkah / Blok & Perolehan XP */}
        <div className="grid grid-cols-2 gap-3 w-full my-4">
          <div className="p-3 rounded-rune bg-spell-purple-800/60 border border-spell-purple-700 flex flex-col items-center">
            <span className="text-xs text-spell-purple-300 font-semibold">
              {instructionCount !== undefined && instructionCount <= parSteps
                ? "Efisiensi Blok Mantra"
                : "Efisiensi Langkah"}
            </span>
            <div className="text-lg font-black text-white font-mono mt-0.5">
              {instructionCount !== undefined && instructionCount <= parSteps
                ? instructionCount
                : stepsTaken}{" "}
              <span className="text-xs text-spell-purple-400 font-normal">
                / Par {parSteps}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-rune bg-spell-purple-800/60 border border-spell-purple-700 flex flex-col items-center">
            <span className="text-xs text-spell-teal-300 font-semibold">Mana XP Diperoleh</span>
            <div className="text-lg font-black text-spell-teal-400 font-mono mt-0.5 flex items-center gap-1">
              <Zap className="w-4 h-4 fill-spell-teal-400" />
              <span>+{xpEarned} XP</span>
            </div>
          </div>
        </div>

        {/* Status Sinkronisasi Supabase (Awan / Lokal) */}
        {syncState === "saving" && (
          <div className="w-full mb-3 p-2.5 rounded-xl bg-spell-purple-800/50 border border-spell-purple-700/60 flex items-center justify-center gap-2 text-xs text-spell-purple-200">
            <Loader2 className="w-4 h-4 text-spell-teal-400 animate-spin" />
            <span>Menyimpan ke Grimoire Awan...</span>
          </div>
        )}

        {syncState === "saved" && (
          <div className="w-full mb-3 p-2 rounded-xl bg-spell-emerald-950/40 border border-spell-emerald-600/30 flex items-center justify-center gap-2 text-xs text-spell-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-spell-emerald-400 shrink-0" />
            <span>Tersimpan aman di Grimoire Awan dan Lokal</span>
          </div>
        )}

        {syncState === "failed" && (
          <div className="w-full mb-3 p-2.5 rounded-xl bg-spell-coral-950/40 border border-spell-coral-600/40 flex flex-col items-center gap-1.5 text-xs text-spell-coral-200">
            <div className="flex items-center gap-1.5 text-spell-coral-300 font-semibold">
              <CloudOff className="w-4 h-4 text-spell-coral-400 shrink-0" />
              <span>Sinkronisasi Awan Tertunda (Tersimpan Lokal)</span>
            </div>
            {syncError && <span className="text-[11px] text-spell-coral-400/80">{syncError}</span>}
            {onRetrySync && (
              <button
                type="button"
                onClick={onRetrySync}
                className="mt-1 px-3 py-1 rounded-lg bg-spell-coral-500/20 hover:bg-spell-coral-500/30 text-spell-coral-300 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Coba Simpan ke Awan Lagi</span>
              </button>
            )}
          </div>
        )}

        {/* Tombol Tindakan */}
        <div className="flex flex-col gap-2.5 w-full mt-2">
          {nextLevelId ? (
            <Link href={`/play/${nextLevelId}`} className="w-full" onClick={onClose}>
              <Button variant="primary" size="lg" className="w-full font-extrabold text-base">
                <span>Lanjut ke Level Berikutnya</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/map" className="w-full" onClick={onClose}>
              <Button variant="primary" size="lg" className="w-full font-extrabold text-base">
                <span>Selamat! Kembali ke Peta Dunia</span>
                <Map className="w-5 h-5" />
              </Button>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                onRetry();
                onClose();
              }}
              className="text-sm font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Level</span>
            </Button>

            {nextLevelId ? (
              <Link href="/map" className="w-full" onClick={onClose}>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={onClose}
                  className="w-full text-sm font-bold border border-spell-purple-700/80 hover:bg-spell-purple-800/80"
                >
                  <Map className="w-4 h-4" />
                  <span>Peta Dunia</span>
                </Button>
              </Link>
            ) : (
              <Link href="/profile" className="w-full" onClick={onClose}>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={onClose}
                  className="w-full text-sm font-bold border border-spell-gold-500/60 text-spell-gold-300 hover:bg-spell-purple-800/80"
                >
                  <Award className="w-4 h-4 text-spell-gold-400" />
                  <span>Lihat Gelar</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
