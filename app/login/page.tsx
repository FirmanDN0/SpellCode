"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { getGuestData } from "@/lib/storage/guestStorage";
import { syncGuestDataToOnline } from "@/lib/supabase/repository";

type AuthMode = "login" | "signup" | "magic_link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMagicLinkSent, setIsMagicLinkSent] = useState(false);

  const handlePostAuthSuccess = async (userId: string) => {
    // Sinkronkan progres lokal jika ada
    const guest = getGuestData();
    if (guest && Object.keys(guest.progress).length > 0) {
      try {
        await syncGuestDataToOnline(userId, guest);
      } catch (e) {
        console.warn("Sinkronisasi otomatis progres lokal dilewati:", e);
      }
    }
    router.push("/map");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === "magic_link") {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setIsMagicLinkSent(true);
      } else if (mode === "signup") {
        if (!password || password.length < 6) {
          throw new Error("Kata sandi harus minimal 6 karakter.");
        }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: username.trim() || undefined,
              display_name: displayName.trim() || "Penyihir Cilik",
            },
          },
        });
        if (error) throw error;
        if (data.user) {
          await handlePostAuthSuccess(data.user.id);
        } else {
          setIsMagicLinkSent(true);
        }
      } else {
        // Mode Login Password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            throw new Error("Email atau kata sandi tidak cocok. Periksa kembali!");
          }
          throw error;
        }
        if (data.user) {
          await handlePostAuthSuccess(data.user.id);
        }
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Terjadi kendala saat menghubungkan ke akademi.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-dialog bg-spell-purple-900 border-2 border-spell-purple-700/80 shadow-card-fantasy flex flex-col items-center text-center">
        {/* Ikon Gerbang Akademi */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-spell-purple-600 to-spell-purple-800 border-2 border-spell-purple-400/50 flex items-center justify-center text-spell-gold-300 shadow-rune-purple mb-4">
          <Sparkles className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {mode === "signup"
            ? "Daftar Akun Akademi"
            : mode === "magic_link"
            ? "Masuk Lewat Tautan Email"
            : "Masuk Akademi Sihir"}
        </h1>
        <p className="text-xs sm:text-sm text-spell-purple-200 mt-1 max-w-xs">
          Simpan progres petualanganmu dan lanjutkan dari perangkat mana saja.
        </p>

        {/* Tab Pemilihan Mode */}
        <div className="w-full flex rounded-xl bg-spell-purple-950/70 p-1 border border-spell-purple-800/80 mt-5 mb-3">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "login"
                ? "bg-spell-purple-600 text-white shadow-sm"
                : "text-spell-purple-300 hover:text-white"
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "signup"
                ? "bg-spell-purple-600 text-white shadow-sm"
                : "text-spell-purple-300 hover:text-white"
            }`}
          >
            Daftar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("magic_link");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "magic_link"
                ? "bg-spell-purple-600 text-white shadow-sm"
                : "text-spell-purple-300 hover:text-white"
            }`}
          >
            Magic Link
          </button>
        </div>

        {/* Notifikasi Error */}
        {errorMessage && (
          <div className="w-full my-2 p-3 rounded-card bg-spell-ruby-950/80 border border-spell-ruby-500/50 text-spell-ruby-200 text-xs text-left flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-spell-ruby-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* State Berhasil Kirim Magic Link */}
        {isMagicLinkSent ? (
          <div className="my-6 p-4 rounded-card bg-spell-emerald-950/60 border border-spell-emerald-500/40 text-spell-emerald-200 text-sm flex flex-col items-center animate-in fade-in">
            <CheckCircle className="w-8 h-8 text-spell-emerald-400 mb-2" />
            <p className="font-bold text-white">Tautan Akses Dikirim!</p>
            <p className="text-xs text-spell-emerald-300 mt-1">
              Periksa kotak masuk email <span className="font-mono text-white">{email}</span> untuk masuk secara instan ke akademi sihir.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMagicLinkSent(false)}
              className="mt-4 text-xs text-spell-purple-300"
            >
              Kirim Ulang atau Ganti Email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleAuthSubmit} className="w-full my-4 flex flex-col gap-3.5 text-left">
            {mode === "signup" && (
              <>
                <Input
                  id="displayName"
                  type="text"
                  label="Nama Panggilan Penyihir"
                  placeholder="Contoh: Aria Si Cerdik"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                />
                <Input
                  id="username"
                  type="text"
                  required
                  label="Username Akun"
                  placeholder="aria_magus"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  leftIcon={<User className="w-4 h-4" />}
                />
              </>
            )}

            <Input
              id="email"
              type="email"
              required
              label="Alamat Email Orang Tua / Siswa"
              placeholder="penyihir@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            {mode !== "magic_link" && (
              <Input
                id="password"
                type="password"
                required
                label="Kata Sandi Rahasia"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
              />
            )}

            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 font-bold shadow-button-primary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Gerbang...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === "signup"
                      ? "Daftar Akun Baru"
                      : mode === "magic_link"
                      ? "Kirim Tautan Akses Sihir"
                      : "Masuk ke Akademi"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        )}

        {/* Akses Cepat Mode Tamu */}
        <div className="pt-4 border-t border-spell-purple-800 w-full flex flex-col gap-3">
          <Link href="/map" className="w-full">
            <Button
              variant="ghost"
              size="md"
              className="w-full text-xs text-spell-teal-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tetap Main sebagai Tamu (Offline / Tanpa Akun)</span>
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-spell-purple-400">
            <ShieldCheck className="w-3.5 h-3.5 text-spell-teal-400" />
            <span>Semua data terlindungi enkripsi dan Row Level Security.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
