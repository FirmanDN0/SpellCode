"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Lock, Sparkles, Compass, CheckCircle2, AlertCircle } from "lucide-react";
import { world1Levels } from "@/lib/levels/world1";
import { world2Levels } from "@/lib/levels/world2";
import { LevelDefinition } from "@/lib/levels/types";
import { getGuestData, GuestData } from "@/lib/storage/guestStorage";
import { Button } from "@/components/ui/Button";

export default function WorldMapPage() {
  const [selectedWorld, setSelectedWorld] = useState<1 | 2>(1);
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  useEffect(() => {
    setGuestData(getGuestData());
  }, []);

  const activeLevels = selectedWorld === 1 ? world1Levels : world2Levels;

  // Cek apakah World 2 terbuka (butuh menyelesaikan World 1 atau minimal 16 bintang)
  const world1Stars = guestData
    ? world1Levels.reduce((sum, lvl) => sum + (guestData.progress[lvl.id]?.stars || 0), 0)
    : 0;

  const isWorld2Unlocked = world1Stars >= 8 || Boolean(guestData?.progress["w2-l1"]);

  const isLevelUnlocked = (level: LevelDefinition, index: number): boolean => {
    if (!guestData) return index === 0;

    // Level pertama selalu terbuka
    if (level.id === "w1-l1") return true;

    // Khusus level pertama world 2
    if (level.id === "w2-l1") return isWorld2Unlocked;

    // Cek record level saat ini
    const record = guestData.progress[level.id];
    if (record && (record.status === "unlocked" || record.status === "completed")) {
      return true;
    }

    // Atau cek apakah level sebelumnya sudah diselesaikan
    const prevLevel = activeLevels[index - 1];
    if (prevLevel && guestData.progress[prevLevel.id]?.status === "completed") {
      return true;
    }

    return false;
  };

  const handleLockedClick = (level: LevelDefinition, index: number) => {
    if (selectedWorld === 2 && !isWorld2Unlocked) {
      setLockedNotice("Kumpulkan minimal 8 bintang di World 1 terlebih dahulu untuk membuka Gua Kristal!");
      return;
    }
    const prevLevel = activeLevels[index - 1];
    setLockedNotice(
      `Selesaikan misi Level ${prevLevel?.levelNumber || 1}: "${prevLevel?.title || 'sebelumnya'}" terlebih dahulu untuk membuka tantangan ini!`
    );
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
      {/* Header Peta Dunia */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-spell-purple-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-spell-gold-300 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-spell-gold-400" />
            <span>Peta Kepulauan Terapung Akademi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Pilih Misi Petualangan
          </h1>
          <p className="text-sm text-spell-purple-200 mt-1">
            Pilih pulau misi sihir yang terbuka untuk memulai latihan komputasi.
          </p>
        </div>

        {/* Tab Pemilihan World */}
        <div className="flex items-center p-1.5 rounded-rune bg-spell-purple-900 border border-spell-purple-700 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setSelectedWorld(1);
              setLockedNotice(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedWorld === 1
                ? "bg-spell-purple-700 text-white shadow-rune-purple"
                : "text-spell-purple-300 hover:text-white"
            }`}
          >
            <span>🌲 World 1: Hutan Peri</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedWorld(2);
              setLockedNotice(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              selectedWorld === 2
                ? "bg-spell-teal-700 text-white shadow-rune-teal"
                : "text-spell-purple-300 hover:text-white"
            }`}
          >
            <span>💎 World 2: Gua Kristal</span>
            {!isWorld2Unlocked && <Lock className="w-3.5 h-3.5 text-spell-coral-400" />}
          </button>
        </div>
      </div>

      {/* Banner Informasi World Aktif */}
      <div className="my-6 p-4 rounded-card bg-spell-purple-900/60 border border-spell-purple-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-spell-purple-800 flex items-center justify-center text-xl">
            {selectedWorld === 1 ? "🌲" : "💎"}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {selectedWorld === 1 ? "World 1: Whispering Woods" : "World 2: Crystal Caverns"}
            </h2>
            <p className="text-xs text-spell-purple-300">
              {selectedWorld === 1
                ? "Fokus Pembelajaran: Urutan Logika & Algoritma Sekuensial (8 Level)"
                : "Fokus Pembelajaran: Perulangan (Loops) & Pengenalan Pola (7 Level)"}
            </p>
          </div>
        </div>

        {/* Progress Tracker Bintang World */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-spell-purple-950 border border-spell-purple-700 text-xs font-bold text-spell-gold-300 self-start sm:self-auto">
          <Star className="w-4 h-4 fill-spell-gold-400 text-spell-gold-400" />
          <span>
            {activeLevels.reduce(
              (acc, lvl) => acc + (guestData?.progress[lvl.id]?.stars || 0),
              0
            )}{" "}
            / {activeLevels.length * 3} Bintang
          </span>
        </div>
      </div>

      {/* Notifikasi Gembok Terkunci */}
      {lockedNotice && (
        <div className="mb-6 p-3.5 rounded-rune bg-spell-coral-500/15 border border-spell-coral-500/40 text-spell-coral-200 text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-spell-coral-400 shrink-0" />
          <span>{lockedNotice}</span>
          <button
            type="button"
            onClick={() => setLockedNotice(null)}
            className="ml-auto text-xs underline font-bold"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Grid Node Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 my-6">
        {activeLevels.map((level, idx) => {
          const unlocked = isLevelUnlocked(level, idx);
          const record = guestData?.progress[level.id];
          const isCompleted = record?.status === "completed";
          const stars = record?.stars || 0;

          if (!unlocked) {
            return (
              <div
                key={level.id}
                onClick={() => handleLockedClick(level, idx)}
                className="relative p-5 rounded-card bg-spell-purple-950/70 border border-spell-purple-800/60 flex flex-col justify-between opacity-60 cursor-not-allowed hover:opacity-80 transition-opacity"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-spell-purple-900 flex items-center justify-center font-mono font-bold text-spell-purple-400 text-sm">
                    {level.levelNumber}
                  </div>
                  <div className="p-2 rounded-full bg-spell-purple-900 text-spell-purple-400">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>

                <div className="my-4">
                  <h3 className="font-bold text-spell-purple-300 text-base">{level.title}</h3>
                  <p className="text-xs text-spell-purple-500 line-clamp-2 mt-1">
                    {level.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-spell-purple-900 flex items-center justify-between text-xs text-spell-purple-500 font-semibold">
                  <span>Terkunci</span>
                  <span className="font-mono">Par: {level.parSteps}</span>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={level.id}
              href={`/play/${level.id}`}
              className="group relative p-5 rounded-card bg-gradient-to-b from-spell-purple-900 to-spell-purple-950 border-2 border-spell-purple-700/80 hover:border-spell-gold-400 shadow-card-fantasy flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-glow-gold"
            >
              {/* Header Card Level */}
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-spell-purple-800 group-hover:bg-spell-gold-500 group-hover:text-spell-purple-950 flex items-center justify-center font-mono font-black text-white text-base transition-colors shadow-sm">
                  {level.levelNumber}
                </div>

                {/* Status Bintang */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      className={`w-4 h-4 ${
                        starIdx <= stars
                          ? "fill-spell-gold-400 text-spell-gold-400"
                          : "fill-spell-purple-900 text-spell-purple-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Konten Judul & Tag */}
              <div className="my-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-spell-teal-500/15 text-spell-teal-300 text-[10px] font-bold border border-spell-teal-500/30">
                    {level.conceptTag}
                  </span>
                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-spell-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Selesai</span>
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-white text-base group-hover:text-spell-gold-300 transition-colors">
                  {level.title}
                </h3>
                <p className="text-xs text-spell-purple-200 line-clamp-2 mt-1">
                  {level.description}
                </p>
              </div>

              {/* Footer Card */}
              <div className="pt-3 border-t border-spell-purple-800/80 flex items-center justify-between text-xs">
                <span className="text-spell-purple-300 font-medium">
                  {stars === 3 ? "Bintang Penuh!" : isCompleted ? "Bisa diulang" : "Siap dimainkan"}
                </span>
                <span className="font-mono font-bold text-spell-gold-300">
                  Par: {level.parSteps}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
