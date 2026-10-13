import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-spell-purple-950 border-t border-spell-purple-900/80 py-8 text-spell-purple-300 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-spell-purple-800 flex items-center justify-center text-spell-gold-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white">SpellCode: Cast Spells with Code</p>
            <p className="text-xs text-spell-purple-400">
              Media Belajar Berpikir Komputasional untuk Anak Usia 7-12 Tahun
            </p>
          </div>
        </div>

        {/* Child Safety Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-spell-purple-900 border border-spell-purple-800 text-xs text-spell-teal-300">
          <ShieldCheck className="w-4 h-4 text-spell-teal-400" />
          <span>Lingkungan Ramah Anak: Bebas Iklan & Aman Privasi</span>
        </div>

        {/* Right copyright */}
        <div className="flex items-center gap-1 text-xs text-spell-purple-400">
          <span>Dibuat dengan</span>
          <Heart className="w-3.5 h-3.5 text-spell-coral-400 fill-spell-coral-400" />
          <span>untuk Generasi Penyihir Kode Indonesia</span>
        </div>
      </div>
    </footer>
  );
}
