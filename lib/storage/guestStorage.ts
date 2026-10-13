import { SpellProgram } from "../engine/types";
import { getNextLevel } from "../levels";

export interface GuestProfile {
  username: string;
  displayName: string;
  avatarId: string;
  totalXp: number;
  wizardRank: string;
  activeFamiliarId: string;
}

export interface LevelProgressRecord {
  status: "unlocked" | "completed";
  stars: number;
  bestStepCount: number;
  bestSolutionAst?: SpellProgram;
  attemptsCount: number;
  firstCompletedAt?: string;
}

export interface GuestData {
  profile: GuestProfile;
  progress: Record<string, LevelProgressRecord>;
  drafts: Record<string, SpellProgram>;
  familiars: string[];
  achievements: string[];
}

const STORAGE_KEY = "spellcode_guest_v1";

export function getRankByXp(xp: number): string {
  if (xp >= 1000) return "Master Spellcoder";
  if (xp >= 500) return "Rune Weaver";
  if (xp >= 200) return "Apprentice Elementalist";
  return "Novice Conjurer";
}

export const defaultInitialGuestData: GuestData = {
  profile: {
    username: "apprentice_01",
    displayName: "Penyihir Cilik",
    avatarId: "apprentice_default",
    totalXp: 0,
    wizardRank: "Novice Conjurer",
    activeFamiliarId: "pyx_fire_cat",
  },
  progress: {
    "w1-l1": {
      status: "unlocked",
      stars: 0,
      bestStepCount: 0,
      attemptsCount: 0,
    },
  },
  drafts: {},
  familiars: ["pyx_fire_cat"],
  achievements: ["welcome_apprentice"],
};

export function getGuestData(): GuestData {
  if (typeof window === "undefined") {
    return defaultInitialGuestData;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultInitialGuestData));
      return defaultInitialGuestData;
    }
    const parsed = JSON.parse(raw);
    return {
      ...defaultInitialGuestData,
      ...parsed,
      profile: {
        ...defaultInitialGuestData.profile,
        ...(parsed.profile || {}),
      },
      progress: {
        ...defaultInitialGuestData.progress,
        ...(parsed.progress || {}),
      },
    };
  } catch {
    return defaultInitialGuestData;
  }
}

export function saveGuestData(data: GuestData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Gagal menyimpan ke LocalStorage:", e);
  }
}

export function saveLevelResult(
  levelId: string,
  stars: number,
  stepsTaken: number,
  solution: SpellProgram,
  xpEarned: number
): { data: GuestData; isNewRank: boolean; newRank: string } {
  const current = getGuestData();
  const existingRecord = current.progress[levelId];
  const oldStars = existingRecord ? existingRecord.stars : 0;
  const isFirstClear = !existingRecord || existingRecord.status !== "completed";

  // Hitung penambahan XP (jika replay, hanya beri selisih)
  let xpDiff = 0;
  if (isFirstClear) {
    xpDiff = xpEarned;
  } else if (stars > oldStars) {
    // Selisih bintang: misal dari 1 bintang (60 XP) ke 3 bintang (100 XP) = +40 XP
    const oldXp = oldStars === 1 ? 60 : oldStars === 2 ? 75 : 100;
    xpDiff = Math.max(0, xpEarned - oldXp);
  }

  const newTotalXp = current.profile.totalXp + xpDiff;
  const oldRank = current.profile.wizardRank;
  const newRank = getRankByXp(newTotalXp);
  const isNewRank = oldRank !== newRank;

  const updatedProgress = { ...current.progress };
  updatedProgress[levelId] = {
    status: "completed",
    stars: Math.max(oldStars, stars),
    bestStepCount:
      existingRecord && existingRecord.bestStepCount > 0
        ? Math.min(existingRecord.bestStepCount, stepsTaken)
        : stepsTaken,
    bestSolutionAst: solution,
    attemptsCount: (existingRecord?.attemptsCount || 0) + 1,
    firstCompletedAt: existingRecord?.firstCompletedAt || new Date().toISOString(),
  };

  // Buka level berikutnya secara otomatis
  const nextLevel = getNextLevel(levelId);
  if (nextLevel && !updatedProgress[nextLevel.id]) {
    updatedProgress[nextLevel.id] = {
      status: "unlocked",
      stars: 0,
      bestStepCount: 0,
      attemptsCount: 0,
    };
  }

  // Buka achievement jika ada
  const updatedAchievements = [...current.achievements];
  if (!updatedAchievements.includes("first_spell") && stars >= 1) {
    updatedAchievements.push("first_spell");
  }
  if (!updatedAchievements.includes("three_stars_perfection") && stars === 3) {
    updatedAchievements.push("three_stars_perfection");
  }

  const updatedData: GuestData = {
    ...current,
    profile: {
      ...current.profile,
      totalXp: newTotalXp,
      wizardRank: newRank,
    },
    progress: updatedProgress,
    achievements: updatedAchievements,
  };

  saveGuestData(updatedData);
  return { data: updatedData, isNewRank, newRank };
}

export function saveDraftAst(levelId: string, ast: SpellProgram): void {
  const current = getGuestData();
  const drafts = { ...current.drafts, [levelId]: ast };
  saveGuestData({ ...current, drafts });
}

export function getDraftAst(levelId: string): SpellProgram | null {
  const current = getGuestData();
  return current.drafts[levelId] || null;
}

export function updateDisplayName(name: string): GuestData {
  const current = getGuestData();
  const updated: GuestData = {
    ...current,
    profile: {
      ...current.profile,
      displayName: name.trim() || "Penyihir Cilik",
    },
  };
  saveGuestData(updated);
  return updated;
}
