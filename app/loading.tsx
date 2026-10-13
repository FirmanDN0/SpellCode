import React from "react";
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-4 border-spell-purple-800 border-t-spell-teal-400 animate-spin" />
        <Sparkles className="w-6 h-6 text-spell-gold-300 animate-pulse" />
      </div>
      <p className="mt-4 text-base font-bold text-white">Mempersiapkan Arena Sihir...</p>
      <p className="text-xs text-spell-purple-300 mt-1">
        Memanggil energi kristal dan menyusun petak tantangan.
      </p>
    </div>
  );
}
