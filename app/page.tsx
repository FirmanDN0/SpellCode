"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Play, BookOpen, Compass, ShieldCheck, Star, Award, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-spell-purple-800/60 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.25)_0,rgba(15,6,34,1)_70%)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center relative z-10">
          {/* Badge Gelar Akademi */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-spell-purple-900/90 border border-spell-purple-700 text-spell-gold-300 font-bold text-xs sm:text-sm shadow-md mb-6 animate-float-gentle">
            <Sparkles className="w-4 h-4 text-spell-gold-400" />
            <span>Selamat Datang di Akademi Sihir SpellCode</span>
          </div>

          {/* Headline Utama */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl leading-tight">
            Belajar Coding dengan Merapalkan{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-spell-gold-300 via-spell-gold-400 to-amber-500 drop-shadow-[0_4px_10px_rgba(245,158,11,0.3)]">
              Mantra Sihir!
            </span>
          </h1>

          {/* Subhead Ramah Anak */}
          <p className="mt-5 text-base sm:text-xl text-spell-purple-200 max-w-2xl font-medium leading-relaxed">
            Dunia akademi fantasi untuk anak usia 7-12 tahun. Susun rune instruksi, gerakkan penyihir magang, kumpulkan kristal mana, dan kuasai logika komputasi nyata!
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/map" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto font-black text-lg px-8">
                <Play className="w-5 h-5 fill-spell-purple-950" />
                <span>Mulai Petualangan Sihir</span>
              </Button>
            </Link>

            <Link href="/grimoire" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto font-bold text-base px-6 border-spell-purple-600"
              >
                <BookOpen className="w-5 h-5 text-spell-teal-400" />
                <span>Pelajari Buku Mantra</span>
              </Button>
            </Link>
          </div>

          {/* Stat Ringkas */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-semibold text-spell-purple-300">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-spell-gold-400 fill-spell-gold-400" />
              <span>15 Level Terkurasi di 2 Dunia</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-spell-teal-400" />
              <span>Bebas Akun & Iklan (Mode Tamu)</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-spell-emerald-400 fill-spell-emerald-400" />
              <span>Simulasi Logika Deterministik 100%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pilar Pembelajaran Berpikir Komputasional */}
      <section className="py-16 sm:py-20 bg-spell-purple-950/90 border-b border-spell-purple-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Mengapa Anak Belajar Lebih Cepat di SpellCode?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-spell-purple-300">
              Konsep ilmu komputer abstrak disederhanakan menjadi aksi sihir yang konkret dan menyenangkan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Pilar 1 */}
            <div className="p-6 rounded-card bg-spell-purple-900/70 border border-spell-purple-800 shadow-card-fantasy flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-spell-teal-500/15 border border-spell-teal-500/40 flex items-center justify-center text-spell-teal-300 mb-4 shadow-sm">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Runtutan Logika (Sequencing)</h3>
              <p className="text-sm text-spell-purple-200 leading-relaxed">
                Anak belajar bahwa komputer mengeksekusi instruksi langkah demi langkah secara teratur. Satu belokan salah mengubah seluruh hasil mantra.
              </p>
            </div>

            {/* Pilar 2 */}
            <div className="p-6 rounded-card bg-spell-purple-900/70 border border-spell-purple-800 shadow-card-fantasy flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-spell-gold-500/15 border border-spell-gold-500/40 flex items-center justify-center text-spell-gold-300 mb-4 shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Pengenalan Pola & Loop</h3>
              <p className="text-sm text-spell-purple-200 leading-relaxed">
                Di World 2, anak menemukan pola berulang dan meringkas 16 langkah panjang menjadi 1 blok perulangan rapi untuk meraih 3 bintang efisiensi!
              </p>
            </div>

            {/* Pilar 3 */}
            <div className="p-6 rounded-card bg-spell-purple-900/70 border border-spell-purple-800 shadow-card-fantasy flex flex-col items-start">
              <div className="w-12 h-12 rounded-xl bg-spell-coral-500/15 border border-spell-coral-500/40 flex items-center justify-center text-spell-coral-300 mb-4 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Debugging Tanpa Rasa Takut</h3>
              <p className="text-sm text-spell-purple-200 leading-relaxed">
                Tidak ada layar Game Over yang menakutkan. Pyx si Kucing Api mendampingi anak menelusuri langkah satu per satu untuk menemukan di mana letak kesalahan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* World Preview Showcase */}
      <section className="py-16 bg-spell-purple-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 sm:p-12 rounded-dialog bg-gradient-to-r from-spell-purple-900 via-spell-purple-950 to-spell-purple-900 border-2 border-spell-purple-800 shadow-card-fantasy">
            <div className="max-w-xl">
              <span className="px-3 py-1 rounded-full bg-spell-gold-500/15 text-spell-gold-300 text-xs font-bold border border-spell-gold-500/30 uppercase tracking-wider">
                Petualangan Menanti
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-3">
                Jelajahi 2 Realm Sihir Pertama
              </h2>
              <p className="mt-3 text-sm sm:text-base text-spell-purple-200 leading-relaxed">
                Dari hutan peri <strong>Whispering Woods</strong> hingga lorong bawah tanah <strong>Crystal Caverns</strong>, setiap level dirancang menantang rasa ingin tahu anak.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <Link href="/map">
                  <Button variant="primary" size="md">
                    <span>Buka Peta Dunia</span>
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="md">
                    <span>Lihat Profil Magang</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Ilustrasi Preview Kartu */}
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div className="p-4 rounded-card bg-spell-purple-800/60 border border-spell-purple-600/50 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-spell-emerald-500/20 text-spell-emerald-300 flex items-center justify-center font-bold text-xl mb-2">
                  🌲
                </div>
                <h4 className="font-bold text-white text-sm">World 1</h4>
                <p className="text-xs text-spell-purple-300">Whispering Woods</p>
                <span className="mt-2 text-[11px] font-semibold text-spell-teal-300">8 Misi Sequencing</span>
              </div>

              <div className="p-4 rounded-card bg-spell-purple-800/60 border border-spell-purple-600/50 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-spell-teal-500/20 text-spell-teal-300 flex items-center justify-center font-bold text-xl mb-2">
                  💎
                </div>
                <h4 className="font-bold text-white text-sm">World 2</h4>
                <p className="text-xs text-spell-purple-300">Crystal Caverns</p>
                <span className="mt-2 text-[11px] font-semibold text-spell-gold-300">7 Misi Loops</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
