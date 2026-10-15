"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Star,
  Zap,
  Award,
  Cloud,
  Edit2,
  Check,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  getGuestData,
  updateDisplayName,
  resetGuestDataToDefault,
  GuestData,
} from "@/lib/storage/guestStorage";
import { allLevels } from "@/lib/levels";
import { Button } from "@/components/ui/Button";
import { useUserSession } from "@/lib/supabase/useUserSession";
import { updateProfileAppearance } from "@/lib/supabase/repository";

export default function ProfilePage() {
  const { user, profile, isOnline, signOut, isLoading } = useUserSession();
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [inputName, setInputName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleSyncState = () => {
      let data = getGuestData();
      // Jika pengguna tidak sedang login dan data tamu masih mencatat sisa akun email
      if (!isOnline && (data.profile.syncedCloudUserId || data.profile.displayName === "FirmanDN")) {
        data = resetGuestDataToDefault();
      }
      setGuestData(data);
      if (profile?.display_name) {
        setInputName(profile.display_name);
      } else {
        setInputName(data.profile.displayName);
      }
    };

    handleSyncState();

    window.addEventListener("spellcode_guest_reset", handleSyncState);
    window.addEventListener("storage", handleSyncState);
    return () => {
      window.removeEventListener("spellcode_guest_reset", handleSyncState);
      window.removeEventListener("storage", handleSyncState);
    };
  }, [profile, isOnline]);

  const handleSaveName = async () => {
    if (!inputName.trim()) return;
    setIsSaving(true);
    try {
      const updated = updateDisplayName(inputName);
      setGuestData(updated);

      if (user && isOnline) {
        await updateProfileAppearance(user.id, {
          displayName: inputName.trim(),
        });
      }
      setIsEditingName(false);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName =
    profile?.display_name || guestData?.profile.displayName || "Penyihir Cilik";
  const wizardRank =
    profile?.wizard_rank || guestData?.profile.wizardRank || "Novice Conjurer";
  const xp = profile?.total_xp ?? guestData?.profile.totalXp ?? 0;

  const totalStars = guestData
    ? Object.values(guestData.progress).reduce(
        (sum, p) => sum + (p.stars || 0),
        0
      )
    : 0;

  const completedLevelsCount = guestData
    ? Object.values(guestData.progress).filter((p) => p.status === "completed")
        .length
    : 0;

  const nextRankTarget =
    xp < 200 ? 200 : xp < 500 ? 500 : xp < 1000 ? 1000 : 2000;
  const currentRankBase =
    xp < 200 ? 0 : xp < 500 ? 200 : xp < 1000 ? 500 : 1000;
  const progressPercent = Math.min(
    100,
    Math.round(
      ((xp - currentRankBase) / (nextRankTarget - currentRankBase)) * 100
    )
  );

  const allAchievements = [
    {
      id: "welcome_apprentice",
      title: "Murid Baru Akademi",
      desc: "Memulai petualangan sihir pertama di gerbang SpellCode.",
      icon: "🎓",
    },
    {
      id: "first_spell",
      title: "Mantra Pertama Berhasil",
      desc: "Menyelesaikan misi pertamamu dengan minimal 1 bintang.",
      icon: "✨",
    },
    {
      id: "three_stars_perfection",
      title: "Ahli Efisiensi",
      desc: "Menyelesaikan level dengan jumlah langkah optimal (3 bintang).",
      icon: "⭐",
    },
    {
      id: "loop_master",
      title: "Penguasa Perulangan",
      desc: "Menyelesaikan misi World 2 menggunakan blok perulangan.",
      icon: "🔮",
    },
  ];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      {/* Kartu Profil Magang */}
      <div className="p-6 sm:p-8 rounded-dialog bg-gradient-to-b from-spell-purple-900 to-spell-purple-950 border-2 border-spell-purple-700/80 shadow-card-fantasy flex flex-col md:flex-row items-center md:items-start gap-6">
        {/* Avatar Penyihir */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-spell-purple-600 to-indigo-800 flex items-center justify-center text-4xl shadow-rune-purple border-2 border-spell-purple-400 shrink-0">
          <span>🧙‍♂️</span>
          <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-spell-gold-500 text-spell-purple-950 text-[10px] font-black uppercase tracking-wider shadow">
            {isOnline ? "Online" : "Magang"}
          </div>
        </div>

        {/* Informasi Utama & Edit Nama */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-3 mb-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  maxLength={25}
                  disabled={isSaving}
                  className="px-3 py-1 rounded-lg bg-spell-purple-950 border border-spell-teal-400 text-white font-bold text-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  disabled={isSaving}
                  className="p-1.5 rounded-md bg-spell-emerald-600 text-white hover:bg-spell-emerald-500 disabled:opacity-50"
                  aria-label="Simpan Nama"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {displayName}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-spell-purple-800/60 hover:bg-spell-purple-700 text-spell-purple-300 hover:text-white border border-spell-purple-700 transition-colors"
                  aria-label="Ubah Nama Tampilan"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-spell-gold-500/15 border border-spell-gold-500/30 text-spell-gold-300 text-xs font-bold">
              <Award className="w-3.5 h-3.5 text-spell-gold-400" />
              <span>Gelar: {wizardRank}</span>
            </div>

            {isOnline && profile?.username && (
              <span className="text-xs text-spell-purple-300 font-mono">
                @{profile.username}
              </span>
            )}
          </div>

          {/* Progress Bar Menuju Pangkat Berikutnya */}
          <div className="w-full max-w-md mt-4">
            <div className="flex justify-between text-xs text-spell-purple-300 font-semibold mb-1">
              <span>Progres Pangkat Berikutnya</span>
              <span className="font-mono text-spell-teal-300">
                {xp} / {nextRankTarget} XP
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-spell-purple-950 border border-spell-purple-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-spell-teal-500 to-spell-teal-300 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cloud Sync & Auth Callout Banner */}
        <div className="w-full md:w-auto p-4 rounded-card bg-spell-purple-950/80 border border-spell-purple-800 flex flex-col items-center justify-center text-center shrink-0">
          <div className="p-2 rounded-full bg-spell-purple-900 text-spell-teal-400 mb-2">
            {isOnline ? (
              <ShieldCheck className="w-5 h-5 text-spell-emerald-400" />
            ) : (
              <Cloud className="w-5 h-5" />
            )}
          </div>
          <p className="text-xs font-bold text-white">
            {isOnline ? "Akun Cloud Aktif" : "Status: Akun Tamu"}
          </p>
          <p className="text-[11px] text-spell-purple-400 max-w-[180px] mt-0.5">
            {isOnline
              ? user?.email || "Tersimpan aman di Supabase"
              : "Tersimpan di browser perangkat ini."}
          </p>

          {isOnline ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => signOut()}
              disabled={isLoading}
              className="mt-3 w-full text-xs text-spell-ruby-300 hover:text-white"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sesi</span>
            </Button>
          ) : (
            <div className="w-full flex flex-col gap-2 mt-3">
              <Link href="/login" className="w-full">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  Hubungkan Cloud
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const fresh = resetGuestDataToDefault();
                  setGuestData(fresh);
                  setInputName(fresh.profile.displayName);
                }}
                className="w-full text-[11px] text-spell-purple-300 hover:text-white hover:bg-spell-purple-900/60"
              >
                Mulai Akun Tamu Baru
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Statistik Ringkas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-card bg-spell-purple-900/70 border border-spell-purple-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-spell-gold-500/15 border border-spell-gold-500/30 flex items-center justify-center text-spell-gold-400">
            <Star className="w-6 h-6 fill-spell-gold-400" />
          </div>
          <div>
            <p className="text-xs text-spell-purple-300 font-semibold">
              Total Bintang
            </p>
            <p className="text-2xl font-black text-white font-mono mt-0.5">
              {totalStars}{" "}
              <span className="text-xs text-spell-purple-400 font-normal">
                / {allLevels.length * 3}
              </span>
            </p>
          </div>
        </div>

        <div className="p-5 rounded-card bg-spell-purple-900/70 border border-spell-purple-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-spell-teal-500/15 border border-spell-teal-500/30 flex items-center justify-center text-spell-teal-400">
            <Zap className="w-6 h-6 fill-spell-teal-400" />
          </div>
          <div>
            <p className="text-xs text-spell-purple-300 font-semibold">
              Total Mana XP
            </p>
            <p className="text-2xl font-black text-white font-mono mt-0.5">
              {xp} XP
            </p>
          </div>
        </div>

        <div className="p-5 rounded-card bg-spell-purple-900/70 border border-spell-purple-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-spell-emerald-500/15 border border-spell-emerald-500/30 flex items-center justify-center text-spell-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-spell-purple-300 font-semibold">
              Misi Terselesaikan
            </p>
            <p className="text-2xl font-black text-white font-mono mt-0.5">
              {completedLevelsCount}{" "}
              <span className="text-xs text-spell-purple-400 font-normal">
                / {allLevels.length} Level
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Koleksi Lencana Prestasi (Achievements) */}
      <div>
        <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <span>🏆 Lencana Prestasi Sihir</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {allAchievements.map((ach) => {
            const isUnlocked = guestData?.achievements.includes(ach.id);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-card border flex flex-col justify-between ${
                  isUnlocked
                    ? "bg-spell-purple-900/80 border-spell-gold-500/40 shadow-sm"
                    : "bg-spell-purple-950/40 border-spell-purple-800/40 opacity-50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{ach.icon}</span>
                    {isUnlocked && (
                      <span className="px-2 py-0.5 rounded-full bg-spell-gold-500/20 text-spell-gold-300 text-[10px] font-bold">
                        Terbuka
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white">{ach.title}</h3>
                  <p className="text-xs text-spell-purple-300 mt-1">{ach.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
