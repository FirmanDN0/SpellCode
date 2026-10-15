"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  Heart,
  Lock,
  Code2,
  Flame,
  ArrowUp,
  RotateCcw,
  RotateCw,
  Diamond,
  Repeat,
  Compass,
  Bug,
  HelpCircle,
  Play,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Card, Badge, Button, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";

export default function GrimoirePage() {
  const [activeTab, setActiveTab] = useState<string>("concepts");

  const coreConcepts = [
    {
      id: "sequencing",
      number: "01",
      title: "Sequencing (Urutan Runtun)",
      conceptLabel: "Fondasi Algoritma",
      badgeVariant: "teal" as const,
      icon: Compass,
      kidSummary:
        "Komputer mengeksekusi instruksi satu per satu secara berurutan dari atas ke bawah, persis seperti resep kue sihir.",
      analogy:
        "Bayangkan memakai kaus kaki dan sepatu. Jika kamu memakai sepatu terlebih dahulu baru kaus kaki, hasilnya akan aneh! Urutan langkah sangat menentukan keberhasilan mantramu.",
      codeExample: [
        { label: "Langkah 1", action: "Maju 1 Petak", rune: "STEP_FORWARD" },
        { label: "Langkah 2", action: "Maju 1 Petak", rune: "STEP_FORWARD" },
        { label: "Langkah 3", action: "Nyalakan Lentera Suci", rune: "LIGHT_TORCH" },
      ],
      resultDescription:
        "Penyihir melangkah dua kotak ke depan dan menyulut lentera. Lentera menyala terang dan portal kemenangan terbuka!",
      debugTip:
        "Jika kamu merapalkan 'Nyalakan Lentera' sebelum tiba di petak lentera, mantramu akan misfire karena lentera belum terjangkau.",
      practiceLevelId: "w1-l1",
      practiceLevelTitle: "World 1 Level 1: Langkah Pertama Magang",
    },
    {
      id: "loops",
      number: "02",
      title: "Loops (Perulangan Pola)",
      conceptLabel: "Efisiensi Kode",
      badgeVariant: "gold" as const,
      icon: Repeat,
      kidSummary:
        "Daripada menyusun balok yang sama 10 kali yang melelahkan tangan, bungkus instruksi itu dalam satu lingkaran mantra 'Ulangi N Kali'.",
      analogy:
        "Ketika kamu melompat tali 5 kali, kamu tidak perlu memikirkan lima rencana berbeda. Kamu hanya melakukan satu gerakan lompat yang diulang 5 kali berturut-turut.",
      codeExample: [
        { label: "Bungkus Loop", action: "Ulangi 4 Kali:", rune: "REPEAT (4x)" },
        { label: "  Instruksi A", action: "  Maju 1 Petak", rune: "  STEP_FORWARD" },
        { label: "  Instruksi B", action: "  Belok Kanan", rune: "  TURN_RIGHT" },
      ],
      resultDescription:
        "Penyihir melangkah membentuk bujur sangkar 4 sudut dengan sangat ringkas, hanya menggunakan 1 blok perulangan!",
      debugTip:
        "Perhatikan angka perulangan! Jika kamu mengulang 5 kali pada jalan yang hanya butuh 4 kali, penyihir akan menabrak rintangan di ujung jalan.",
      practiceLevelId: "w2-l1",
      practiceLevelTitle: "World 2 Level 1: Langkah Berulang di Gua Kristal",
    },
    {
      id: "conditionals",
      number: "03",
      title: "Conditionals (Kondisi Percabangan)",
      conceptLabel: "Pengambilan Keputusan",
      badgeVariant: "purple" as const,
      icon: HelpCircle,
      kidSummary:
        "Mantra cerdas yang memeriksa keadaan arena terlebih dahulu sebelum bertindak: 'Jika ada api di depan, belok kiri; jika aman, terus maju'.",
      analogy:
        "Ketika akan pergi ke akademi di pagi hari: JIKA hujan turun, pakailah jubah payung; JIKA cerah, cukup kenakan topi sihirmu.",
      codeExample: [
        { label: "Kondisi", action: "Jika (Ada Kristal di Petak):", rune: "IF_HAS_SHARD" },
        { label: "  Aksi Benar", action: "  Panen Kristal Mana", rune: "  COLLECT_SHARD" },
        { label: "Lainnya", action: "Jika Tidak: Maju", rune: "ELSE STEP_FORWARD" },
      ],
      resultDescription:
        "Penyihir hanya menyerap mana saat benar-benar berdiri di atas kristal bersinar, menghemat energi mantra tanpa ada langkah sia-sia.",
      debugTip:
        "Pastikan kondisi yang kamu tanyakan jelas. Komputer hanya mengenal jawaban pasti: Benar (True) atau Salah (False).",
      practiceLevelId: "w3-l1",
      practiceLevelTitle: "World 3 Level 1: Sensor Jurang Awan",
    },
    {
      id: "debugging",
      number: "04",
      title: "Debugging (Menemukan & Memperbaiki Error)",
      conceptLabel: "Keterampilan Detektif",
      badgeVariant: "coral" as const,
      icon: Bug,
      kidSummary:
        "Kesalahan mantra (*misfire*) bukan kegagalan, melainkan petunjuk teka-teki seru! Kita melacak langkah demi langkah untuk menemukan letak balok yang keliru.",
      analogy:
        "Detektif tidak menyerah saat jejak kaki berbelok ke arah yang salah. Mereka menelusuri kembali langkah terakhir untuk menemukan jalan yang benar.",
      codeExample: [
        { label: "Langkah 1", action: "Amati petak di mana penyihir berhenti", rune: "OBSERVE" },
        { label: "Langkah 2", action: "Jalankan mantra bertahap dengan tombol 'Langkah'", rune: "STEP_BY_STEP" },
        { label: "Langkah 3", action: "Ganti arah belokan atau hapus balok berlebih", rune: "FIX_BLOCK" },
      ],
      resultDescription:
        "Pyx si Kucing Api memandu menandai balok mana yang membuatmu berbelok salah arah, sehingga kamu bisa memperbaikinya dengan tenang.",
      debugTip:
        "Gunakan tombol 'Langkah' di arena permainan untuk melihat animasi mantra satu per satu secara perlahan.",
      practiceLevelId: "w1-l2",
      practiceLevelTitle: "World 1 Level 2: Belokan di Tikungan Peri",
    },
  ];

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-spell-purple-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-spell-gold-300 uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4 text-spell-gold-400" />
            <span>Ensiklopedia & Pengetahuan Akademi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Buku Mantra (Grimoire)
          </h1>
          <p className="text-sm text-spell-purple-200 mt-1 max-w-2xl">
            Pelajari konsep berpikir komputasional dengan bahasa sederhana, amati kamus setiap rune sihir, dan kenali familiar pendampingmu.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1.5 rounded-rune bg-spell-purple-900 border border-spell-purple-700/80 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("concepts")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "concepts"
                ? "bg-spell-purple-700 text-white shadow-rune-purple border border-spell-purple-500/50"
                : "text-spell-purple-300 hover:text-white"
            }`}
          >
            <Compass className="w-4 h-4 text-spell-gold-400" />
            <span>Konsep Komputasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("runes")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "runes"
                ? "bg-spell-purple-700 text-white shadow-rune-purple border border-spell-purple-500/50"
                : "text-spell-purple-300 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-spell-teal-400" />
            <span>Kamus Rune</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("familiars")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "familiars"
                ? "bg-spell-teal-700 text-white shadow-rune-teal border border-spell-teal-500/50"
                : "text-spell-purple-300 hover:text-white"
            }`}
          >
            <Heart className="w-4 h-4 text-spell-coral-400" />
            <span>Familiar</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KONSEP DASAR BERPIKIR KOMPUTASIONAL */}
      {activeTab === "concepts" && (
        <div className="my-8 flex flex-col gap-8">
          <div className="p-4 sm:p-5 rounded-card bg-spell-purple-900/40 border border-spell-purple-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-spell-gold-500/15 border border-spell-gold-500/40 flex items-center justify-center text-spell-gold-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm text-spell-purple-200">
                Setiap petualang hebat menguasai 4 pilar ini. Pelajari konsepnya, lalu klik <strong>Tantang di Game</strong> untuk mempraktikkannya langsung di arena!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {coreConcepts.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.id}
                  variant="default"
                  className="flex flex-col justify-between border-2 border-spell-purple-700/80"
                >
                  <div>
                    {/* Header Konsep */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-spell-purple-800 border border-spell-purple-600 flex items-center justify-center text-white shadow-sm">
                          <Icon className="w-5 h-5 text-spell-teal-300" />
                        </div>
                        <div>
                          <span className="text-[11px] font-mono font-bold text-spell-purple-400 block">
                            PILAR {item.number}
                          </span>
                          <h2 className="text-lg font-black text-white">{item.title}</h2>
                        </div>
                      </div>

                      <Badge variant={item.badgeVariant} size="sm">
                        {item.conceptLabel}
                      </Badge>
                    </div>

                    {/* Penjelasan Ramah Anak */}
                    <p className="text-sm font-semibold text-spell-purple-100 leading-relaxed mb-3">
                      {item.kidSummary}
                    </p>

                    {/* Analogi Kehidupan Nyata */}
                    <div className="p-3.5 rounded-rune bg-spell-purple-950/70 border border-spell-purple-800/80 mb-4 text-xs text-spell-purple-200 leading-relaxed">
                      <strong className="text-spell-gold-300 block mb-1">Perumpamaan Dunia Nyata:</strong>
                      <span>{item.analogy}</span>
                    </div>

                    {/* Contoh Instruksi Visual & Hasil */}
                    <div className="p-3.5 rounded-rune bg-black/40 border border-spell-purple-800/80 mb-4">
                      <div className="flex items-center justify-between text-[11px] font-bold text-spell-purple-400 mb-2">
                        <span>CONTOH SUSUNAN RUNE</span>
                        <span className="text-spell-teal-400 font-mono">Simulasi Visual</span>
                      </div>

                      <div className="flex flex-col gap-1.5 font-mono text-xs">
                        {item.codeExample.map((codeStep, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between px-2.5 py-1.5 rounded bg-spell-purple-900/60 border border-spell-purple-700/50 text-spell-teal-300"
                          >
                            <span className="text-spell-purple-300 font-bold">{codeStep.label}:</span>
                            <span className="font-semibold text-white">{codeStep.action}</span>
                            <span className="text-[10px] text-spell-gold-400">{codeStep.rune}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-spell-purple-800/80 text-xs text-spell-purple-300">
                        <strong className="text-spell-emerald-400 font-bold">Hasil di Arena: </strong>
                        <span>{item.resultDescription}</span>
                      </div>
                    </div>

                    {/* Tips Debugging */}
                    <div className="p-3 rounded-lg bg-spell-coral-500/10 border border-spell-coral-500/30 text-xs text-spell-coral-200 leading-snug mb-5">
                      <strong className="font-bold text-spell-coral-300">Catatan Penting Pyx: </strong>
                      <span>{item.debugTip}</span>
                    </div>
                  </div>

                  {/* Tombol Tantangan Game Terkait */}
                  <div className="pt-4 border-t border-spell-purple-800 flex items-center justify-between gap-4">
                    <span className="text-xs text-spell-purple-400 font-medium">
                      Praktikkan di arena:
                    </span>
                    {item.practiceLevelId ? (
                      <Link href={`/play/${item.practiceLevelId}`}>
                        <Button variant="primary" size="sm" className="font-bold text-xs">
                          <Play className="w-3.5 h-3.5" />
                          <span>{item.practiceLevelTitle}</span>
                        </Button>
                      </Link>
                    ) : (
                      <Badge variant="purple" size="md">
                        <span>Segera di World 3</span>
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: KAMUS RUNE SIHIR */}
      {activeTab === "runes" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {runesData.map((rune) => {
            const Icon = rune.icon;
            return (
              <Card
                key={rune.id}
                variant="default"
                className="flex flex-col justify-between border-spell-purple-700/80"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${rune.color} text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="teal" size="sm">
                      {rune.concept}
                    </Badge>
                  </div>

                  <h3 className="text-base font-black text-white">{rune.name}</h3>
                  <p className="text-xs text-spell-purple-200 mt-2 leading-relaxed">
                    {rune.description}
                  </p>

                  {/* Padanan Kode Nyata */}
                  <div className="mt-4 p-2.5 rounded-lg bg-black/40 border border-spell-purple-800 flex items-center justify-between text-xs font-mono text-spell-teal-300">
                    <div className="flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-spell-purple-400" />
                      <span>{rune.pythonCode}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-spell-purple-800 text-[11px] text-spell-gold-300 leading-snug">
                  <span className="font-bold">Tips Pyx: </span>
                  <span>{rune.kidTip}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 3: SANCTUARY FAMILIAR */}
      {activeTab === "familiars" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          {familiarsData.map((fam) => (
            <Card
              key={fam.id}
              variant={fam.unlocked ? "elevated" : "default"}
              className={`flex flex-col justify-between ${
                fam.unlocked ? "" : "opacity-65 border-spell-purple-800/60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-3xl shadow-md border border-amber-300">
                    {fam.id === "pyx" ? "🐱" : fam.id === "lumina" ? "🦉" : "🐉"}
                  </div>
                  {fam.unlocked ? (
                    <Badge variant="emerald" size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      <span>{fam.status}</span>
                    </Badge>
                  ) : (
                    <Badge variant="coral" size="sm">
                      <Lock className="w-3 h-3 mr-1" />
                      <span>Terkunci</span>
                    </Badge>
                  )}
                </div>

                <h3 className="text-lg font-black text-white">{fam.name}</h3>
                <span className="text-xs text-spell-teal-300 font-semibold">{fam.species}</span>
                <p className="text-xs text-spell-purple-200 mt-3 leading-relaxed">{fam.bio}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-spell-purple-800/80">
                <span className="text-[11px] text-spell-purple-400 block font-semibold">Keistimewaan Khusus:</span>
                <span className="text-xs font-bold text-spell-gold-300">{fam.trait}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
