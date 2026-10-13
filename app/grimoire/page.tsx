"use client";

import React, { useState } from "react";
import { BookOpen, Sparkles, Heart, Lock, Code2, Flame, ArrowUp, RotateCcw, RotateCw, Diamond, Repeat } from "lucide-react";

export default function GrimoirePage() {
  const [activeTab, setActiveTab] = useState<"runes" | "familiars">("runes");

  const runesData = [
    {
      id: "step",
      name: "Rune Langkah (stepForward)",
      icon: ArrowUp,
      color: "bg-spell-teal-600 border-spell-teal-400",
      pythonCode: "wizard.step_forward()",
      concept: "Sequencing",
      description:
        "Memerintahkan penyihir magang melangkah 1 petak ke depan sesuai arah hadap saat ini.",
      kidTip: "Hati-hati! Jika melangkah ke jurang atau semak duri, mantramu akan misfire.",
    },
    {
      id: "turn_left",
      name: "Rune Putar Kiri (turnLeft)",
      icon: RotateCcw,
      color: "bg-spell-purple-700 border-spell-purple-400",
      pythonCode: "wizard.turn_left()",
      concept: "Orientation",
      description:
        "Memutar arah hadap penyihir 90 derajat berlawanan arah jarum jam tanpa berpindah petak.",
      kidTip: "Putar kiri 4 kali akan membuat penyihir kembali menghadap ke arah semula!",
    },
    {
      id: "turn_right",
      name: "Rune Putar Kanan (turnRight)",
      icon: RotateCw,
      color: "bg-spell-purple-700 border-spell-purple-400",
      pythonCode: "wizard.turn_right()",
      concept: "Orientation",
      description:
        "Memutar arah hadap penyihir 90 derajat searah jarum jam tanpa berpindah petak.",
      kidTip: "Ingat tangan kananmu saat memikirkan arah putaran kanan.",
    },
    {
      id: "torch",
      name: "Rune Cahaya (lightTorch)",
      icon: Flame,
      color: "bg-spell-gold-600 border-spell-gold-400",
      pythonCode: "wizard.light_torch()",
      concept: "Action Execution",
      description:
        "Membakar lentera suci kuno yang padam di petak tempat penyihir sedang berdiri.",
      kidTip: "Kamu harus berdiri tepat di atas petak lentera sebelum merapalkan mantra ini.",
    },
    {
      id: "shard",
      name: "Rune Panen (collectShard)",
      icon: Diamond,
      color: "bg-cyan-600 border-cyan-400",
      pythonCode: "wizard.collect_shard()",
      concept: "State Mutation",
      description:
        "Menyerap energi kristal mana misterius ke dalam kantong sihir magang.",
      kidTip: "Kumpulkan semua kristal di arena untuk membuka kunci portal kemenangan.",
    },
    {
      id: "repeat",
      name: "Rune Lingkaran (repeat)",
      icon: Repeat,
      color: "bg-amber-600 border-amber-400",
      pythonCode: "for step in range(N): ...",
      concept: "Loops & Efficiency",
      description:
        "Membungkus serangkaian instruksi untuk dijalankan berulang kali sejumlah N kali.",
      kidTip: "Gunakan loop saat kamu melihat pola langkah yang sama. Ini kunci meraih 3 bintang!",
    },
  ];

  const familiarsData = [
    {
      id: "pyx",
      name: "Pyx si Kucing Api",
      species: "Elemental Feline",
      status: "Aktif Mendampingi",
      unlocked: true,
      bio: "Familiar pertama setiap murid akademi. Memiliki rasa ingin tahu tinggi dan selalu siap memberikan petunjuk saat mantramu menemui kendala.",
      trait: "Petunjuk Scaffolding & Semangat Positif",
    },
    {
      id: "lumina",
      name: "Lumina Burung Hantu Mistis",
      species: "Astral Strigidae",
      status: "Terkunci (Butuh 300 XP)",
      unlocked: false,
      bio: "Penjaga perpustakaan bintang kuno. Mampu mendeteksi algoritma paling optimal dengan sekali kedipan mata.",
      trait: "Analisis Efisiensi Kode Lanjutan",
    },
    {
      id: "aqua",
      name: "Aqua Drake si Naga Sungai",
      species: "Aquatic Wyrmling",
      status: "Terkunci (Butuh 700 XP)",
      unlocked: false,
      bio: "Naga mungil yang mahir memanipulasi arus logika percabangan kondisional.",
      trait: "Master Logika Percabangan (Conditionals)",
    },
  ];

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
      {/* Header Grimoire */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-spell-purple-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-spell-gold-300 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-spell-gold-400" />
            <span>Ensiklopedia & Pengetahuan Akademi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Buku Mantra (Grimoire)
          </h1>
          <p className="text-sm text-spell-purple-200 mt-1">
            Pelajari rahasia setiap rune sihir dan kenali makhluk pendamping akademi.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1.5 rounded-rune bg-spell-purple-900 border border-spell-purple-700 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("runes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "runes"
                ? "bg-spell-purple-700 text-white shadow-rune-purple"
                : "text-spell-purple-300 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-spell-gold-400" />
            <span>Kamus Rune Sihir</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("familiars")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "familiars"
                ? "bg-spell-teal-700 text-white shadow-rune-teal"
                : "text-spell-purple-300 hover:text-white"
            }`}
          >
            <Heart className="w-4 h-4 text-spell-coral-400" />
            <span>Sanctuary Familiar</span>
          </button>
        </div>
      </div>

      {/* Tab Content 1: Kamus Rune Sihir */}
      {activeTab === "runes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {runesData.map((rune) => {
            const Icon = rune.icon;
            return (
              <div
                key={rune.id}
                className="p-5 rounded-card bg-spell-purple-900/80 border border-spell-purple-700/80 shadow-card-fantasy flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${rune.color} text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-spell-purple-800 text-[10px] font-bold text-spell-teal-300 border border-spell-purple-700">
                      {rune.concept}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white">{rune.name}</h3>
                  <p className="text-xs text-spell-purple-200 mt-2 leading-relaxed">
                    {rune.description}
                  </p>

                  {/* Jembatan ke Kode Nyata */}
                  <div className="mt-4 p-2.5 rounded-lg bg-black/40 border border-spell-purple-800 flex items-center justify-between text-xs font-mono text-spell-teal-300">
                    <div className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-spell-purple-400" />
                      <span>{rune.pythonCode}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-spell-purple-800 text-[11px] text-spell-gold-300/90 leading-snug">
                  <span className="font-bold">💡 Tips Pyx: </span>
                  {rune.kidTip}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Content 2: Sanctuary Familiar */}
      {activeTab === "familiars" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          {familiarsData.map((fam) => (
            <div
              key={fam.id}
              className={`p-6 rounded-card border shadow-card-fantasy flex flex-col justify-between ${
                fam.unlocked
                  ? "bg-gradient-to-b from-spell-purple-900 to-spell-purple-950 border-spell-gold-400/60"
                  : "bg-spell-purple-950/60 border-spell-purple-800/60 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl shadow-md border border-amber-300">
                    {fam.id === "pyx" ? "🐱" : fam.id === "lumina" ? "🦉" : "🐉"}
                  </div>
                  {fam.unlocked ? (
                    <span className="px-2.5 py-1 rounded-full bg-spell-emerald-500/15 border border-spell-emerald-500/40 text-spell-emerald-400 text-xs font-bold">
                      {fam.status}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-spell-purple-900 border border-spell-purple-700 text-spell-purple-400 text-xs font-bold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Terkunci</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-black text-white">{fam.name}</h3>
                <span className="text-xs text-spell-teal-300 font-semibold">{fam.species}</span>
                <p className="text-xs text-spell-purple-200 mt-3 leading-relaxed">{fam.bio}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-spell-purple-800/80">
                <span className="text-[11px] text-spell-purple-400 block font-semibold">Keistimewaan:</span>
                <span className="text-xs font-bold text-spell-gold-300">{fam.trait}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
