import { createClient } from "./client";
import { Database, ProfileRow, PlayerProgressRow } from "./types";
import { GuestData } from "../storage/guestStorage";

export async function fetchPlayerProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Gagal mengambil profil pemain:", error);
    return null;
  }
  return data;
}

export async function fetchPlayerProgress(
  userId: string
): Promise<Record<string, PlayerProgressRow>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("player_progress")
    .select("*")
    .eq("user_id", userId);

  if (error || !data) {
    console.error("Gagal mengambil progres pemain:", error);
    return {};
  }

  const map: Record<string, PlayerProgressRow> = {};
  data.forEach((row) => {
    map[row.level_id] = row;
  });
  return map;
}

export async function fetchPlayerAchievements(
  userId: string
): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("player_achievements")
    .select("achievement_id")
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }
  return data.map((a) => a.achievement_id);
}

export async function fetchPlayerFamiliars(
  userId: string
): Promise<string[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("player_familiars")
    .select("familiar_id")
    .eq("user_id", userId);

  if (error || !data) {
    return [];
  }
  return data.map((f) => f.familiar_id);
}

export async function updateProfileAppearance(
  userId: string,
  updates: {
    displayName?: string;
    avatarId?: string;
    activeFamiliarId?: string;
  }
): Promise<boolean> {
  const supabase = createClient();
  const payload: Partial<Database["public"]["Tables"]["profiles"]["Update"]> = {};

  if (updates.displayName !== undefined) payload.display_name = updates.displayName;
  if (updates.avatarId !== undefined) payload.avatar_id = updates.avatarId;
  if (updates.activeFamiliarId !== undefined)
    payload.active_familiar_id = updates.activeFamiliarId;

  payload.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId);

  if (error) {
    console.error("Gagal memperbarui profil pemain:", error);
    return false;
  }
  return true;
}

/**
 * Sinkronisasi progres guest (LocalStorage) ke akun Supabase saat pertama kali login.
 */
export async function syncGuestDataToOnline(
  userId: string,
  guestData: GuestData
): Promise<boolean> {
  try {
    const response = await fetch("/api/progress/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, guestData }),
    });
    return response.ok;
  } catch (err) {
    console.error("Gagal sinkronisasi data guest ke Supabase:", err);
    return false;
  }
}
