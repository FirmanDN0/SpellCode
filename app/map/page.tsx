"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Star,
  Lock,
  Sparkles,
  Compass,
  CheckCircle2,
  AlertCircle,
  Play,
  Flame,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { getGuestData, GuestData } from "@/lib/storage/guestStorage";
import {
  getLevelNodeStates,
  LevelNodeState,
  LevelStatus,
} from "@/lib/storage/progressService";
import { useUserSession } from "@/lib/supabase/useUserSession";
import { Button, Badge, Card, Modal, ProgressBar } from "@/components/ui";

export default function WorldMapPage() {
  const [selectedWorld, setSelectedWorld] = useState<1 | 2 | 3>(1);
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const { user, profile, progress: onlineProgress, isLoading: isAuthLoading } = useUserSession();

  const [lockedModal, setLockedModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setGuestData(getGuestData());
    };
    handleStorageChange();
    window.addEventListener("spellcode_guest_reset", handleStorageChange);
    window.addEventListener("spellcode_progress_updated", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("spellcode_guest_reset", handleStorageChange);
      window.removeEventListener("spellcode_progress_updated", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Gabungkan data online Supabase dengan data lokal
  const effectiveData: GuestData = React.useMemo(() => {
    const base = guestData || getGuestData();
    if (!user) return base;

    const mergedProgress = { ...base.progress };
    for (const [lvlId, record] of Object.entries(onlineProgress)) {
      mergedProgress[lvlId] = {
        status: record.status as "unlocked" | "completed",
        stars: record.stars,
        bestStepCount: record.best_step_count ?? 0,
        attemptsCount: record.attempts_count ?? 1,
        firstCompletedAt: record.first_completed_at ?? undefined,
      };
    }

    return {
      ...base,
      profile: {
        ...base.profile,
        displayName: profile?.display_name || base.profile.displayName,
        avatarId: profile?.avatar_id || base.profile.avatarId,
        totalXp: profile?.total_xp ?? base.profile.totalXp,
        wizardRank: profile?.wizard_rank || base.profile.wizardRank,
      },
      progress: mergedProgress,
    };
  }, [guestData, user, profile, onlineProgress]);

  const levelStates = getLevelNodeStates(selectedWorld, effectiveData);

  // Total bintang di World aktif
  const worldStars = levelStates.reduce((sum, item) => sum + item.stars, 0);
  const maxWorldStars = levelStates.length * 3;
  const completedWorldLevels = levelStates.filter((item) => item.status === "completed").length;

  // Cek apakah World 2 terbuka (butuh minimal 8 bintang di World 1)
  const world1Stars = getLevelNodeStates(1, effectiveData).reduce(
    (sum, item) => sum + item.stars,
    0
  );
  const world2Stars = getLevelNodeStates(2, effectiveData).reduce(
    (sum, item) => sum + item.stars,
    0
  );
  const isWorld2Unlocked = world1Stars >= 8 || Boolean(effectiveData?.progress["w2-l1"]);
  const isWorld3Unlocked =
    world1Stars + world2Stars >= 16 || Boolean(effectiveData?.progress["w3-l1"]);

  const handleWorldSwitch = (worldNum: 1 | 2 | 3) => {
    if (worldNum === 2 && !isWorld2Unlocked) {
      setLockedModal({
        isOpen: true,
        title: "World 2 Masih Disegel Kabut Kristal!",
        description:
          "Untuk melangkah ke Crystal Caverns, kamu harus mengumpulkan minimal 8 Bintang Sihir di World 1 (Whispering Woods). Ayo selesaikan misi sebelumnya dengan mantap!",
      });
      return;
    }
    if (worldNum === 3 && !isWorld3Unlocked) {
      setLockedModal({
        isOpen: true,
        title: "World 3 Masih Diselimuti Badai Awan!",
        description:
          "Untuk mendaki ke Cloud Citadel (Benteng Awan), kamu harus mengumpulkan minimal 16 Bintang Sihir dari gabungan World 1 dan World 2. Terus asah mantramu!",
      });
      return;
    }
    setSelectedWorld(worldNum);
  };

  const handleLockedNodeClick = (node: LevelNodeState) => {
    setLockedModal({
      isOpen: true,
      title: `Level ${node.level.levelNumber}: ${node.level.title} Belum Terbuka`,
      description: `${node.prerequisiteText}. Berlatihlah di level sebelumnya terlebih dahulu untuk menguasai mantranya!`,
    });
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
      {/* Header Peta Dunia */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-spell-purple-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-spell-gold-300 uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-spell-gold-400" />
            <span>Peta Kepulauan Terapung Akademi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Peta Misi Petualangan
          </h1>
          <p className="text-sm text-spell-purple-200 mt-1 max-w-xl">
            Pilih pulau misi sihir yang terbuka untuk melatih logika berpikir komputasimu. Selesaikan setiap tantangan untuk membuka gerbang berikutnya.
          </p>
        </div>

        {/* Tab Pemilihan World */}
        <div className="flex items-center p-1.5 rounded-rune bg-spell-purple-900 border border-spell-purple-700/80 shadow-inner flex-wrap gap-1">
          <button
            type="button"
            onClick={() => handleWorldSwitch(1)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${selectedWorld === 1
                ? "bg-spell-purple-700 text-white shadow-rune-purple border border-spell-purple-500/50"
                : "text-spell-purple-300 hover:text-white"
              }`}
          >
            <span>🌲 World 1: Hutan Peri</span>
          </button>

          <button
            type="button"
            onClick={() => handleWorldSwitch(2)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${selectedWorld === 2
                ? "bg-spell-teal-700 text-white shadow-rune-teal border border-spell-teal-500/50"
                : "text-spell-purple-300 hover:text-white"
              }`}
          >
            <span>💎 World 2: Gua Kristal</span>
            {!isWorld2Unlocked && (
              <span className="p-1 rounded-full bg-spell-coral-500/20 text-spell-coral-400">
                <Lock className="w-3 h-3" />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleWorldSwitch(3)}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${selectedWorld === 3
                ? "bg-spell-gold-500 text-spell-purple-950 font-black shadow-rune-gold border border-spell-gold-400"
                : "text-spell-purple-300 hover:text-white"
              }`}
          >
            <span>☁️ World 3: Benteng Awan</span>
            {!isWorld3Unlocked && (
              <span className="p-1 rounded-full bg-spell-coral-500/20 text-spell-coral-400">
                <Lock className="w-3 h-3" />
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Ringkasan World Aktif */}
      <div className="my-6 p-5 sm:p-6 rounded-card bg-gradient-to-r from-spell-purple-900/90 via-spell-purple-950 to-spell-purple-900/90 border border-spell-purple-700/80 shadow-card-fantasy flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-spell-purple-800 border border-spell-purple-600/60 flex items-center justify-center text-3xl shadow-md">
            {selectedWorld === 1 ? "🌲" : selectedWorld === 2 ? "💎" : "☁️"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">
                {selectedWorld === 1
                  ? "World 1: Whispering Woods"
                  : selectedWorld === 2
                  ? "World 2: Crystal Caverns"
                  : "World 3: Cloud Citadel"}
              </h2>
              <Badge
                variant={selectedWorld === 1 ? "purple" : selectedWorld === 2 ? "teal" : "gold"}
                size="sm"
              >
                {selectedWorld === 1
                  ? "Sekuensial"
                  : selectedWorld === 2
                  ? "Perulangan (Loops)"
                  : "Kondisi Percabangan (Conditionals)"}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-spell-purple-300 mt-1">
              {selectedWorld === 1
                ? "Fokus: Menyusun urutan langkah runtun tanpa melewatkan petak instruksi (6 Level)."
                : selectedWorld === 2
                ? "Fokus: Mengidentifikasi pola berulang dan membungkusnya dalam satu loop efisien (6 Level)."
                : "Fokus: Mengambil keputusan cerdas dengan sensor kondisi IF dan aksi adaptif (6 Level)."}
            </p>
          </div>
        </div>

        {/* Progres Tracker Bintang & Level */}
        <div className="flex items-center gap-4 bg-spell-purple-950/80 p-3 sm:px-4 sm:py-2.5 rounded-rune border border-spell-purple-800 shrink-0">
          <div className="text-left">
            <span className="text-[11px] font-bold text-spell-purple-400 block">Progres Misi</span>
            <span className="text-sm font-extrabold text-white">
              {completedWorldLevels} / {levelStates.length} Selesai
            </span>
          </div>

          <div className="h-8 w-px bg-spell-purple-800" />

          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-spell-gold-400 text-spell-gold-400" />
            <div>
              <span className="text-[11px] font-bold text-spell-purple-400 block">Total Bintang</span>
              <span className="text-sm font-mono font-black text-spell-gold-300">
                {worldStars} / {maxWorldStars}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pemberitahuan Transparansi Penyimpanan Lokal / Awan */}
      {user ? (
        <div className="mb-6 px-4 py-3 rounded-rune bg-spell-purple-950/80 border border-spell-teal-600/50 text-xs text-spell-teal-200 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-spell-teal-400 shrink-0" />
            <span>
              <strong>Grimoire Awan Terhubung:</strong> Masuk sebagai <span className="font-extrabold text-white">{profile?.display_name || user.email}</span> ({profile?.wizard_rank || "Novice Conjurer"}). Progres tersinkronisasi otomatis dengan aman.
            </span>
          </div>
          <Link href="/profile" className="text-spell-gold-300 hover:text-white underline font-bold shrink-0">
            Lihat Profil & Prestasi
          </Link>
        </div>
      ) : (
        <div className="mb-6 px-4 py-3 rounded-rune bg-spell-purple-950/60 border border-spell-purple-800/80 text-xs text-spell-purple-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-spell-teal-400 shrink-0" />
            <span>
              <strong>Mode Magang Tamu:</strong> Progres level disimpan di browser ini. Masuk dengan akun keluarga untuk sinkronisasi awan.
            </span>
          </div>
          <Link href="/login" className="text-spell-teal-300 hover:text-white underline font-bold shrink-0">
            Masuk Akun
          </Link>
        </div>
      )}

      {/* Grid Node Level */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 my-6">
        {levelStates.map((node) => {
          const { level, status, stars, prerequisiteText, rewardsText, canPlay } = node;

          // 1. STATE: TERKUNCI (LOCKED)
          if (status === "locked" || !canPlay) {
            return (
              <div
                key={level.id}
                onClick={() => handleLockedNodeClick(node)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleLockedNodeClick(node);
                }}
                className="relative p-5 rounded-card bg-spell-purple-950/70 border-2 border-spell-purple-900/90 flex flex-col justify-between opacity-65 cursor-not-allowed hover:opacity-85 hover:border-spell-coral-500/40 transition-all select-none"
                aria-label={`Level ${level.levelNumber}: ${level.title} (Terkunci)`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-spell-purple-900/90 border border-spell-purple-800 flex items-center justify-center font-mono font-black text-spell-purple-500 text-sm">
                      {level.levelNumber}
                    </div>
                    <Badge variant="coral" size="sm">
                      <Lock className="w-3 h-3 mr-1" />
                      <span>Terkunci</span>
                    </Badge>
                  </div>

                  <div className="my-3">
                    <h3 className="font-bold text-spell-purple-400 text-base">{level.title}</h3>
                    <p className="text-xs text-spell-purple-500 line-clamp-2 mt-1">
                      {level.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-spell-purple-900/90 flex flex-col gap-1.5 text-[11px]">
                  <div className="text-spell-purple-400 font-medium">
                    <span className="font-bold text-spell-purple-300">Prasyarat: </span>
                    <span>{prerequisiteText}</span>
                  </div>
                  <div className="text-spell-purple-500">
                    <span className="font-bold text-spell-purple-400">Reward: </span>
                    <span>{rewardsText}</span>
                  </div>
                </div>
              </div>
            );
          }

          // 2. STATE: SEDANG DIKERJAKAN (IN_PROGRESS)
          if (status === "in_progress") {
            return (
              <div
                key={level.id}
                className="relative p-5 rounded-card bg-gradient-to-b from-spell-purple-900 to-spell-purple-950 border-2 border-spell-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.3)] flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_0_28px_rgba(45,212,191,0.45)]"
              >
                {/* Beacon penanda aktif */}
                <div className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-spell-teal-500 text-spell-purple-950 text-[11px] font-black uppercase tracking-wider shadow-md">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block" />
                  <span>Misi Aktif</span>
                </div>

                <div>
                  <div className="flex items-start justify-between mt-1">
                    <div className="w-10 h-10 rounded-xl bg-spell-teal-600 border border-spell-teal-300 flex items-center justify-center font-mono font-black text-white text-base shadow-sm">
                      {level.levelNumber}
                    </div>

                    <Badge variant="teal" size="sm">
                      <Sparkles className="w-3 h-3 mr-1" />
                      <span>{level.conceptTag}</span>
                    </Badge>
                  </div>

                  <div className="my-3">
                    <h3 className="font-black text-white text-base text-spell-teal-200">
                      {level.title}
                    </h3>
                    <p className="text-xs text-spell-purple-200 line-clamp-2 mt-1">
                      {level.description}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="pt-3 border-t border-spell-purple-800/80 mb-3 flex flex-col gap-1 text-[11px]">
                    <div className="text-spell-gold-300 font-semibold">
                      <span className="font-bold">Hadiah: </span>
                      <span>{rewardsText}</span>
                    </div>
                  </div>

                  <Link href={`/play/${level.id}`} className="w-full block">
                    <Button variant="teal" size="md" className="w-full font-black text-sm">
                      <Play className="w-4 h-4 fill-white" />
                      <span>Mulai Misi Ini</span>
                    </Button>
                  </Link>
                </div>
              </div>
            );
          }

          // 3. STATE: SELESAI (COMPLETED) ATAU TERSEDIA (AVAILABLE)
          const isCompleted = status === "completed";

          return (
            <div
              key={level.id}
              className={`relative p-5 rounded-card bg-gradient-to-b from-spell-purple-900 to-spell-purple-950 border-2 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 shadow-card-fantasy ${isCompleted
                  ? "border-spell-purple-700/80 hover:border-spell-gold-400/80"
                  : "border-spell-purple-700/80 hover:border-spell-teal-400"
                }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-base shadow-sm ${isCompleted
                        ? "bg-spell-purple-800 text-spell-gold-300 border border-spell-purple-600"
                        : "bg-spell-purple-800 text-white border border-spell-purple-600"
                      }`}
                  >
                    {level.levelNumber}
                  </div>

                  {isCompleted ? (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-4 h-4 ${starIdx <= stars
                              ? "fill-spell-gold-400 text-spell-gold-400"
                              : "fill-spell-purple-900 text-spell-purple-700"
                            }`}
                        />
                      ))}
                    </div>
                  ) : (
                    <Badge variant="purple" size="sm">
                      <span>Tersedia</span>
                    </Badge>
                  )}
                </div>

                <div className="my-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-spell-teal-300">
                      {level.conceptTag}
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-spell-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Selesai</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-white text-base">{level.title}</h3>
                  <p className="text-xs text-spell-purple-200 line-clamp-2 mt-1">
                    {level.description}
                  </p>
                </div>
              </div>

              <div>
                <div className="pt-3 border-t border-spell-purple-800/80 mb-3 flex items-center justify-between text-xs">
                  <span className="text-spell-purple-300 font-medium">
                    {stars === 3 ? "Bintang Penuh!" : isCompleted ? "Bisa Diulang" : "Siap Ditantang"}
                  </span>
                  <span className="font-mono font-bold text-spell-gold-300">
                    Par: {level.parSteps}
                  </span>
                </div>

                <Link href={`/play/${level.id}`} className="w-full block">
                  <Button
                    variant={isCompleted ? "secondary" : "primary"}
                    size="sm"
                    className="w-full font-bold text-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isCompleted ? "Main Ulang (Asah Logika)" : "Mulai Level"}</span>
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog untuk Level / World Terkunci */}
      <Modal
        isOpen={lockedModal.isOpen}
        onClose={() => setLockedModal({ isOpen: false, title: "", description: "" })}
        title={lockedModal.title}
        description={lockedModal.description}
        maxWidth="md"
      >
        <div className="mt-4 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-spell-purple-900 border border-spell-coral-500/40 flex items-center justify-center text-spell-coral-400 mb-3 shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <p className="text-xs sm:text-sm text-spell-purple-200 leading-relaxed mb-6">
            Di Akademi SpellCode, setiap petualang membuka gerbang sihir dengan membuktikan pemahaman konsep di level sebelumnya.
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={() => setLockedModal({ isOpen: false, title: "", description: "" })}
            className="w-full font-bold"
          >
            <span>Mengerti, Saya Siap Berlatih!</span>
          </Button>
        </div>
      </Modal>
    </div>
  );
}
