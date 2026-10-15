"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Map, BookOpen, User, Star, Zap, Menu, X } from "lucide-react";
import { getGuestData, GuestData } from "@/lib/storage/guestStorage";
import { useUserSession } from "@/lib/supabase/useUserSession";
import { SoundToggle } from "../ui/SoundToggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { profile, isOnline, progress: onlineProgress } = useUserSession();
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setGuestData(getGuestData());

    const handleStorage = () => {
      setGuestData(getGuestData());
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("spellcode_guest_reset", handleStorage);
    window.addEventListener("spellcode_progress_updated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("spellcode_guest_reset", handleStorage);
      window.removeEventListener("spellcode_progress_updated", handleStorage);
    };
  }, [pathname]);

  const effectiveProgress = React.useMemo(() => {
    const merged = { ...(guestData?.progress || {}) };
    if (isOnline && onlineProgress) {
      for (const [lvlId, record] of Object.entries(onlineProgress)) {
        merged[lvlId] = {
          status: record.status as "unlocked" | "completed",
          stars: Math.max(record.stars || 0, merged[lvlId]?.stars || 0),
          bestStepCount: record.best_step_count ?? merged[lvlId]?.bestStepCount ?? 0,
          attemptsCount: record.attempts_count ?? merged[lvlId]?.attemptsCount ?? 1,
        };
      }
    }
    return merged;
  }, [guestData, isOnline, onlineProgress]);

  const totalStars = Object.values(effectiveProgress).reduce(
    (acc, p) => acc + (p.stars || 0),
    0
  );

  const totalXp = profile?.total_xp ?? guestData?.profile.totalXp ?? 0;

  // Nama label profil: jika sudah login gunakan nama pemain / "Profil Akun", bukan "Profil Magang"
  const displayName = profile?.display_name || guestData?.profile.displayName;
  const profileLabel = isOnline
    ? (displayName ? (displayName.length > 14 ? `${displayName.slice(0, 12)}...` : displayName) : "Profil Akun")
    : "Profil Magang";

  const navLinks = [
    { href: "/map", label: "Peta Petualangan", icon: Map },
    { href: "/grimoire", label: "Buku Mantra", icon: BookOpen },
    { href: "/profile", label: profileLabel, icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-spell-purple-950/90 border-b border-spell-purple-800/80">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spell-teal-400 rounded-lg p-1"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-spell-purple-500 to-spell-purple-700 flex items-center justify-center shadow-rune-purple border border-spell-purple-400/40 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-5 h-5 text-spell-gold-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg sm:text-xl text-white tracking-wide group-hover:text-spell-gold-300 transition-colors">
              Spell<span className="text-spell-teal-400">Code</span>
            </span>
            <span className="hidden sm:inline text-[10px] text-spell-purple-300 font-semibold tracking-wider uppercase -mt-1">
              Akademi Sihir Pemrograman
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Navigasi Utama">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            const isProfile = link.href === "/profile";
            return (
              <Link
                key={link.href}
                href={link.href}
                title={isProfile && isOnline ? `Akun Cloud: ${displayName}` : undefined}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-rune text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spell-teal-400",
                  isActive
                    ? "bg-spell-purple-800 text-spell-gold-300 shadow-inner border border-spell-purple-600/60"
                    : "text-spell-purple-200 hover:text-white hover:bg-spell-purple-900/60"
                )}
              >
                <div className="relative flex items-center">
                  <Icon className={cn("w-4 h-4", isActive ? "text-spell-gold-400" : "text-spell-purple-400")} />
                  {isProfile && isOnline && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-spell-emerald-400 ring-2 ring-spell-purple-950"
                      title="Akun Cloud Aktif"
                    />
                  )}
                </div>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Player Stats & Utility Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Star Counter */}
          <div
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-spell-gold-500/15 border border-spell-gold-500/30 text-spell-gold-300 font-bold text-xs sm:text-sm shadow-sm"
            title="Total Bintang yang Diraih"
          >
            <Star className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-spell-gold-400 text-spell-gold-400 shrink-0" />
            <span>{totalStars}</span>
          </div>

          {/* Mana XP Counter - Ditampilkan di Desktop/Tablet */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-spell-teal-500/15 border border-spell-teal-500/30 text-spell-teal-300 font-bold text-sm shadow-sm"
            title="Total Mana XP"
          >
            <Zap className="w-4 h-4 fill-spell-teal-400 text-spell-teal-400 shrink-0" />
            <span>{totalXp} XP</span>
          </div>

          {/* Sound Toggle Button - Desktop/Tablet */}
          <div className="hidden sm:block">
            <SoundToggle />
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-rune bg-spell-purple-800 text-spell-purple-200 hover:text-white border border-spell-purple-700 min-w-[40px] min-h-[40px] flex items-center justify-center transition-colors"
            aria-label="Buka Menu Navigasi"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-3 pb-5 bg-spell-purple-900 border-b border-spell-purple-700 flex flex-col gap-2.5 shadow-xl animate-in fade-in duration-150">
          {/* Mobile Stats Banner */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-spell-purple-950/70 border border-spell-purple-800 mb-1 text-xs">
            <div className="flex items-center gap-2 text-spell-teal-300 font-bold">
              <Zap className="w-4 h-4 fill-spell-teal-400 text-spell-teal-400" />
              <span>{totalXp} Total Mana XP</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-spell-purple-400">Efek Suara:</span>
              <SoundToggle />
            </div>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            const isProfile = link.href === "/profile";
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-rune font-bold text-base transition-colors",
                  isActive
                    ? "bg-spell-purple-800 text-spell-gold-300 border border-spell-purple-600 shadow-sm"
                    : "text-spell-purple-200 hover:bg-spell-purple-950/60"
                )}
              >
                <div className="relative flex items-center">
                  <Icon className="w-5 h-5 text-spell-teal-400" />
                  {isProfile && isOnline && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-spell-emerald-400 ring-2 ring-spell-purple-900" />
                  )}
                </div>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
