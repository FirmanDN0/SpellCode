"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, ArrowRight, ShieldCheck, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Mock Magic Link Auth untuk demonstrasi sebelum Supabase server role key disematkan
    setIsSent(true);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-dialog bg-spell-purple-900 border-2 border-spell-purple-700/80 shadow-card-fantasy flex flex-col items-center text-center">
        {/* Ikon Gerbang Akademi */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-spell-purple-600 to-spell-purple-800 border-2 border-spell-purple-400/50 flex items-center justify-center text-spell-gold-300 shadow-rune-purple mb-4">
          <Sparkles className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white">Masuk Akademi Sihir</h1>
        <p className="text-xs sm:text-sm text-spell-purple-200 mt-1 max-w-xs">
          Simpan progres petualanganmu dan lanjutkan dari perangkat mana saja.
        </p>

        {isSent ? (
          <div className="my-6 p-4 rounded-card bg-spell-emerald-950/60 border border-spell-emerald-500/40 text-spell-emerald-200 text-sm flex flex-col items-center animate-in fade-in">
            <CheckCircle className="w-8 h-8 text-spell-emerald-400 mb-2" />
            <p className="font-bold text-white">Tautan Akses Dikirim!</p>
            <p className="text-xs text-spell-emerald-300 mt-1">
              Periksa kotak masuk email <span className="font-mono text-white">{email}</span> untuk masuk secara instan tanpa kata sandi.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSent(false)}
              className="mt-4 text-xs text-spell-purple-300"
            >
              Kirim Ulang Email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full my-6 flex flex-col gap-3">
            <div className="relative text-left">
              <label htmlFor="email" className="block text-xs font-bold text-spell-purple-300 mb-1">
                Alamat Email Orang Tua / Guru
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-spell-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="orangtua@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-rune bg-spell-purple-950 border border-spell-purple-700 text-white placeholder-spell-purple-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-spell-teal-400 transition-all"
                />
              </div>
            </div>

            <Button variant="primary" size="lg" type="submit" className="w-full mt-2 font-bold">
              <span>Kirim Tautan Akses Sihir</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        )}

        {/* Akses Cepat Mode Tamu */}
        <div className="pt-4 border-t border-spell-purple-800 w-full flex flex-col gap-3">
          <Link href="/map" className="w-full">
            <Button variant="ghost" size="md" className="w-full text-xs text-spell-teal-300 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
              <span>Tetap Main sebagai Tamu (Tanpa Akun)</span>
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-spell-purple-400">
            <ShieldCheck className="w-3.5 h-3.5 text-spell-teal-400" />
            <span>Tidak ada password rumit yang harus dihafal anak.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
