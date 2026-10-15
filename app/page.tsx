"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Play,
  BookOpen,
  Compass,
  ShieldCheck,
  Star,
  Award,
  Zap,
  ArrowRight,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { getGuestData, GuestData } from "@/lib/storage/guestStorage";
import {
  getPlayerProgressSummary,
  PlayerProgressSummary,
} from "@/lib/storage/progressService";
import { Button, Card, Badge, ProgressBar } from "@/components/ui";

export default function HomePage() {
  const [summary, setSummary] = useState<PlayerProgressSummary | null>(null);
  const [guestData, setGuestData] = useState<GuestData | null>(null);

  useEffect(() => {
    const data = getGuestData();
    setGuestData(data);
    setSummary(getPlayerProgressSummary(data));
  }, []);

  const currentLevel = summary?.currentLevel;
  const isStarted = (summary?.completedCount || 0) > 0;
  const isAllCompleted = summary?.completedCount === summary?.totalLevels;

  return (
    <div className="flex-1 flex flex-col">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden py-14 sm:py-20 border-b border-spell-purple-800/60 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.28)_0,rgba(15,6,34,1)_75%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center relative z-10">
          {/* Badge Gelar Akademi */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-spell-purple-900/90 border border-spell-purple-700 text-spell-gold-300 font-bold text-xs sm:text-sm shadow-md mb-6">
            <Sparkles className="w-4 h-4 text-spell-gold-400" />
            <span>Akademi Sihir SpellCode: Cast Spells with Code</span>
          </div>

          {/* Headline Utama */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl leading-tight">
            Belajar Coding dengan Merapalkan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-spell-gold-300 via-spell-gold-400 to-amber-500 drop-shadow-[0_4px_10px_rgba(245,158,11,0.3)]">
              Mantra Sihir!
            </span>
          </h1>

          {/* Subhead Ramah Anak */}
          <p className="mt-4 sm:mt-5 text-base sm:text-xl text-spell-purple-200 max-w-2xl font-medium leading-relaxed">
            Dunia akademi fantasi untuk anak usia 7-12 tahun. Susun rune instruksi, gerakkan penyihir magang, kumpulkan kristal mana, dan kuasai logika berpikir komputasi nyata!
          </p>

          {/* CTA Buttons - Dinamis Sesuai Progres Pemain */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {currentLevel ? (
              <Link
                href={isAllCompleted ? "/map" : `/play/${currentLevel.id}`}
                className="w-full sm:w-auto"
              >
                <Button variant="primary" size="lg" className="w-full sm:w-auto font-black text-base sm:text-lg px-8">
                  <Play className="w-5 h-5 fill-spell-purple-950" />
                  <span>
                    {isAllCompleted
                      ? "Jelajahi Peta Dunia"
                      : isStarted
                      ? `Lanjutkan: Level ${currentLevel.levelNumber} (${currentLevel.title})`
                      : `Mulai: Level ${currentLevel.levelNumber} (${currentLevel.title})`}
                  </span>
                </Button>
              </Link>
            ) : (
              <Link href="/map" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto font-black text-lg px-8">
                  <Play className="w-5 h-5 fill-spell-purple-950" />
                  <span>Mulai Petualangan Sihir</span>
                </Button>
              </Link>
            )}

            <Link href="/grimoire" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto font-bold text-base px-6 border-spell-purple-600"
              >
                <BookOpen className="w-5 h-5 text-spell-teal-400" />
                <span>Buku Mantra (Grimoire)</span>
              </Button>
            </Link>
          </div>

          {/* Jaminan Kenyamanan Anak & Orang Tua */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-spell-purple-300">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-spell-gold-400 fill-spell-gold-400" />
              <span>18 Level Terkurasi di 3 Realm</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-spell-teal-400" />
              <span>Bebas Iklan & Aman untuk Anak</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-spell-emerald-400 fill-spell-emerald-400" />
              <span>Simulasi Logika Deterministik 100%</span>
            </div>
          </div>
        </div>
      </section>

      {/* WIDGET RINGKASAN PROGRES PEMAIN (Ringkas & Tidak Membebani Anak) */}
      <section className="py-8 bg-spell-purple-950 border-b border-spell-purple-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Card
            variant="default"
            className="p-5 sm:p-6 bg-gradient-to-r from-spell-purple-900/90 via-spell-purple-950 to-spell-purple-900/90 border-2 border-spell-purple-700/80 shadow-card-fantasy flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            {/* Profil Singkat Murid */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-spell-purple-700 to-spell-purple-900 border-2 border-spell-gold-400/50 flex items-center justify-center text-2xl shadow-md">
                🧙
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {guestData?.profile.displayName || "Penyihir Cilik"}
                  </h3>
                  <Badge variant="gold" size="sm">
                    {guestData?.profile.wizardRank || "Novice Conjurer"}
                  </Badge>
                </div>
                <p className="text-xs text-spell-purple-300 mt-0.5">
                  Familiar Pendamping: <strong>Pyx si Kucing Api</strong> 🐱
                </p>
              </div>
            </div>

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center bg-spell-purple-950/70 p-3 sm:px-5 sm:py-3 rounded-rune border border-spell-purple-800">
              {/* Bintang */}
              <div className="flex items-center gap-2.5">
                <Star className="w-5 h-5 fill-spell-gold-400 text-spell-gold-400 shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-spell-purple-400 block">Bintang</span>
                  <span className="text-sm font-mono font-black text-spell-gold-300">
                    {summary?.totalStars || 0} / {summary?.maxStars || 54}
                  </span>
                </div>
              </div>

              {/* Misi Selesai */}
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-spell-emerald-400 shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-spell-purple-400 block">Misi Tuntas</span>
                  <span className="text-sm font-mono font-black text-white">
                    {summary?.completedCount || 0} / {summary?.totalLevels || 18}
                  </span>
                </div>
              </div>

              {/* XP Akademi */}
              <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5">
                <Flame className="w-5 h-5 text-spell-coral-400 shrink-0" />
                <div>
                  <span className="text-[11px] font-bold text-spell-purple-400 block">Total Energi XP</span>
                  <span className="text-sm font-mono font-black text-spell-teal-300">
                    {summary?.totalXp || 0} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Aksi Cepat Lanjutkan */}
            <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
              <Link href="/map" className="w-full sm:w-auto">
                <Button variant="secondary" size="md" className="w-full sm:w-auto font-bold text-xs sm:text-sm">
                  <Compass className="w-4 h-4 text-spell-teal-400" />
                  <span>Buka Peta</span>
                </Button>
              </Link>
            </div>
          </Card>

          {/* Catatan Transparansi Penyimpanan Lokal */}
          <div className="mt-3 px-3 py-2 text-center text-xs text-spell-purple-400">
            <span>
              ℹ️ Progresmu saat ini tersimpan di browser ini (Mode Tamu). Nanti kamu bisa menghubungkan akun orang tua untuk penyimpanan awan permanen.
            </span>
          </div>
        </div>
      </section>

      {/* 3 PILAR PEMBELAJARAN BERPIKIR KOMPUTASIONAL */}
      <section className="py-16 sm:py-20 bg-spell-purple-950/90 border-b border-spell-purple-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Mengapa Anak Belajar Lebih Cepat di SpellCode?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-spell-purple-300 leading-relaxed">
              Konsep ilmu komputer abstrak disederhanakan menjadi aksi sihir yang konkret dan menyenangkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pilar 1 */}
            <Card variant="default" className="flex flex-col items-start p-6">
              <div className="w-12 h-12 rounded-xl bg-spell-teal-500/15 border border-spell-teal-500/40 flex items-center justify-center text-spell-teal-300 mb-4 shadow-sm">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Runtutan Logika (Sequencing)</h3>
              <p className="text-sm text-spell-purple-200 leading-relaxed">
                Anak belajar bahwa komputer mengeksekusi instruksi langkah demi langkah secara teratur. Satu belokan salah mengubah seluruh hasil mantra.
              </p>
              <Link href="/grimoire" className="mt-4 text-xs font-bold text-spell-teal-300 hover:text-white flex items-center gap-1">
                <span>Pelajari di Buku Mantra</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            {/* Pilar 2 */}
            <Card variant="default" className="flex flex-col items-start p-6">
              <div className="w-12 h-12 rounded-xl bg-spell-gold-500/15 border border-spell-gold-500/40 flex items-center justify-center text-spell-gold-300 mb-4 shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Pengenalan Pola & Loop</h3>
              <p className="text-sm text-spell-purple-200 leading-relaxed">
                Di World 2, anak menemukan pola berulang dan meringkas langkah panjang menjadi satu blok perulangan rapi untuk meraih 3 bintang efisiensi!
              </p>
              <Link href="/grimoire" className="mt-4 text-xs font-bold text-spell-gold-300 hover:text-white flex items-center gap-1">
                <span>Pelajari Cara Kerja Loop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            {/* Pilar 3 */}
            <Card variant="default" className="flex flex-col items-start p-6">
              <div className="w-12 h-12 rounded-xl bg-spell-coral-500/15 border border-spell-coral-500/40 flex items-center justify-center text-spell-coral-300 mb-4 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Debugging Tanpa Rasa Takut</h3>
              <p className="text-sm text-spell-purple-200 leading-relaxed">
                Tidak ada layar Game Over yang menakutkan. Pyx si Kucing Api mendampingi anak menelusuri langkah satu per satu untuk menemukan di mana letak kesalahan.
              </p>
              <Link href="/grimoire" className="mt-4 text-xs font-bold text-spell-coral-300 hover:text-white flex items-center gap-1">
                <span>Pelajari Tips Pyx</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* REALM SHOWCASE DENGAN AKSES CEPAT */}
      <section className="py-16 bg-spell-purple-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 p-8 sm:p-12 rounded-dialog bg-gradient-to-r from-spell-purple-900 via-spell-purple-950 to-spell-purple-900 border-2 border-spell-purple-800 shadow-card-fantasy">
            <div className="max-w-xl">
              <Badge variant="gold" size="md">
                <span>Petualangan Menanti</span>
              </Badge>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-3">
                Jelajahi 3 Realm Sihir Petualangan
              </h2>
              <p className="mt-3 text-sm sm:text-base text-spell-purple-200 leading-relaxed">
                Dari hutan peri <strong>Whispering Woods</strong>, lorong bawah tanah <strong>Crystal Caverns</strong>, hingga benteng awan <strong>Cloud Citadel</strong>, setiap level dirancang menantang rasa ingin tahu anak secara terstruktur.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Link href="/map">
                  <Button variant="primary" size="md">
                    <span>Buka Peta Dunia</span>
                  </Button>
                </Link>
                <Link href="/grimoire">
                  <Button variant="ghost" size="md">
                    <span>Buka Grimoire</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Kartu Realm Preview - 3 Worlds */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <Link href="/map" className="group">
                <Card
                  variant="interactive"
                  className="p-3.5 flex flex-col items-center text-center bg-spell-purple-800/60 border-spell-purple-600/50 hover:border-spell-emerald-400 transition-all"
                >
                  <div className="w-11 h-11 rounded-full bg-spell-emerald-500/20 text-spell-emerald-300 flex items-center justify-center font-bold text-xl mb-2">
                    🌲
                  </div>
                  <h4 className="font-bold text-white text-sm">World 1</h4>
                  <p className="text-xs text-spell-purple-300">Whispering Woods</p>
                  <span className="mt-2 text-[11px] font-semibold text-spell-teal-300">6 Misi Sequencing</span>
                </Card>
              </Link>

              <Link href="/map" className="group">
                <Card
                  variant="interactive"
                  className="p-3.5 flex flex-col items-center text-center bg-spell-purple-800/60 border-spell-purple-600/50 hover:border-spell-teal-400 transition-all"
                >
                  <div className="w-11 h-11 rounded-full bg-spell-teal-500/20 text-spell-teal-300 flex items-center justify-center font-bold text-xl mb-2">
                    💎
                  </div>
                  <h4 className="font-bold text-white text-sm">World 2</h4>
                  <p className="text-xs text-spell-purple-300">Crystal Caverns</p>
                  <span className="mt-2 text-[11px] font-semibold text-spell-gold-300">6 Misi Loops</span>
                </Card>
              </Link>

              <Link href="/map" className="group">
                <Card
                  variant="interactive"
                  className="p-3.5 flex flex-col items-center text-center bg-spell-purple-800/60 border-spell-purple-600/50 hover:border-spell-gold-400 transition-all"
                >
                  <div className="w-11 h-11 rounded-full bg-spell-gold-500/20 text-spell-gold-300 flex items-center justify-center font-bold text-xl mb-2">
                    ☁️
                  </div>
                  <h4 className="font-bold text-white text-sm">World 3</h4>
                  <p className="text-xs text-spell-purple-300">Cloud Citadel</p>
                  <span className="mt-2 text-[11px] font-semibold text-spell-coral-300">6 Misi Conditionals</span>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
