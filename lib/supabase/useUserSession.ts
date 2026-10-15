"use client";

import { useEffect, useState, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "./client";
import { ProfileRow, PlayerProgressRow } from "./types";
import { fetchPlayerProfile, fetchPlayerProgress } from "./repository";
import { getGuestData, saveGuestData, resetGuestDataToDefault } from "../storage/guestStorage";

export interface UserSessionState {
  user: User | null;
  profile: ProfileRow | null;
  progress: Record<string, PlayerProgressRow>;
  isLoading: boolean;
  isOnline: boolean;
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useUserSession(): UserSessionState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [progress, setProgress] = useState<Record<string, PlayerProgressRow>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = createClient();

  const loadUserData = useCallback(async (currentUser: User) => {
    try {
      const [prof, prog] = await Promise.all([
        fetchPlayerProfile(currentUser.id),
        fetchPlayerProgress(currentUser.id),
      ]);
      setProfile(prof);
      setProgress(prog);

      // Sinkronisasi data lokal jika ada progres online yang lebih mutakhir
      if (prof) {
        const local = getGuestData();
        saveGuestData({
          ...local,
          profile: {
            ...local.profile,
            displayName: prof.display_name,
            avatarId: prof.avatar_id,
            totalXp: prof.total_xp,
            wizardRank: prof.wizard_rank,
            activeFamiliarId: prof.active_familiar_id,
            syncedCloudUserId: currentUser.id,
            syncedCloudEmail: currentUser.email || undefined,
          },
        });
      }
    } catch (err) {
      console.error("Gagal memuat data akun:", err);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        setProfile(null);
        setProgress({});
        // Jika tidak ada akun online yang aktif, pastikan residu akun email dibersihkan
        const local = getGuestData();
        if (local.profile.syncedCloudUserId || local.profile.displayName === "FirmanDN") {
          resetGuestDataToDefault();
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase, loadUserData]);

  useEffect(() => {
    refreshSession();

    // Listen auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        await loadUserData(currentUser);
      } else {
        if (event === "SIGNED_OUT") {
          resetGuestDataToDefault();
        }
        setProfile(null);
        setProgress({});
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, refreshSession, loadUserData]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      // Panggil server route untuk membersihkan cookie sesi di HTTP response headers
      await fetch("/auth/signout", { method: "POST" });
    } catch (e) {
      console.warn("Sign out server call warning:", e);
    } finally {
      // PENTING: Bersihkan data tamu lokal kembali ke akun tamu baru (fresh guest).
      // Data akun online pengguna tetap tersimpan aman di cloud Supabase.
      resetGuestDataToDefault();
      setUser(null);
      setProfile(null);
      setProgress({});
      setIsLoading(false);
      window.location.href = "/login?message=logged_out";
    }
  }, [supabase]);

  return {
    user,
    profile,
    progress,
    isLoading,
    isOnline: !!user,
    refreshSession,
    signOut,
  };
}
