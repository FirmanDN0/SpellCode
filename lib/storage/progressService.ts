import { LevelDefinition } from "../levels/types";
import { world1Levels } from "../levels/world1";
import { world2Levels } from "../levels/world2";
import { world3Levels } from "../levels/world3";
import { allLevels, getLevelById } from "../levels";
import { GuestData, getGuestData } from "./guestStorage";

export type LevelStatus = "completed" | "in_progress" | "available" | "locked";

export interface LevelNodeState {
  level: LevelDefinition;
  status: LevelStatus;
  stars: number;
  prerequisiteText: string;
  rewardsText: string;
  canPlay: boolean;
}

export interface PlayerProgressSummary {
  currentLevel: LevelDefinition;
  completedCount: number;
  totalLevels: number;
  totalStars: number;
  maxStars: number;
  totalXp: number;
  rank: string;
  isWorld2Unlocked: boolean;
  isWorld3Unlocked: boolean;
  isPersistenceLocal: boolean;
}

/**
 * Menghitung status setiap node level pada sebuah world berdasarkan progres pemain.
 * Fungsi ini memisahkan data persistence dari layer presentasi UI.
 */
export function getLevelNodeStates(
  worldNumber: 1 | 2 | 3,
  guestData: GuestData | null
): LevelNodeState[] {
  const data = guestData || getGuestData();
  const levels =
    worldNumber === 1
      ? world1Levels
      : worldNumber === 2
      ? world2Levels
      : world3Levels;

  const world1Stars = world1Levels.reduce(
    (sum, lvl) => sum + (data.progress[lvl.id]?.stars || 0),
    0
  );
  const isWorld2Unlocked = world1Stars >= 8 || Boolean(data.progress["w2-l1"]);

  const world2Stars = world2Levels.reduce(
    (sum, lvl) => sum + (data.progress[lvl.id]?.stars || 0),
    0
  );
  const isWorld3Unlocked =
    world1Stars + world2Stars >= 16 || Boolean(data.progress["w3-l1"]);

  let foundCurrent = false;

  return levels.map((level, index) => {
    const record = data.progress[level.id];
    const isCompleted = record?.status === "completed";
    const stars = record?.stars || 0;

    let canPlay = false;
    let status: LevelStatus = "locked";
    let prerequisiteText = "";

    // Kalkulasi Prasyarat
    if (worldNumber === 2 && !isWorld2Unlocked) {
      prerequisiteText = "Kumpulkan minimal 8 Bintang di World 1 untuk membuka Realm ini";
    } else if (worldNumber === 3 && !isWorld3Unlocked) {
      prerequisiteText = "Kumpulkan minimal 16 Bintang di World 1 & 2 untuk membuka Realm ini";
    } else if (
      level.id === "w1-l1" ||
      (level.id === "w2-l1" && isWorld2Unlocked) ||
      (level.id === "w3-l1" && isWorld3Unlocked)
    ) {
      prerequisiteText = "Tersedia sejak awal untuk petualang cilik";
      canPlay = true;
    } else {
      const prevLevel = levels[index - 1];
      const prevCompleted = prevLevel && data.progress[prevLevel.id]?.status === "completed";
      prerequisiteText = `Selesaikan Level ${prevLevel?.levelNumber || 1}: ${prevLevel?.title || "Sebelumnya"}`;
      canPlay = Boolean(prevCompleted || (record && record.status === "unlocked"));
    }

    // Tentukan Status Node
    if (isCompleted) {
      status = "completed";
      canPlay = true;
    } else if (canPlay) {
      if (!foundCurrent) {
        status = "in_progress";
        foundCurrent = true;
      } else {
        status = "available";
      }
    } else {
      status = "locked";
      canPlay = false;
    }

    const rewardsText = `+${level.baseXp} XP & hingga 3 Bintang Sihir`;

    return {
      level,
      status,
      stars,
      prerequisiteText,
      rewardsText,
      canPlay,
    };
  });
}

/**
 * Mengambil ringkasan progres pemain untuk ditampilkan pada Home dan Dashboard
 */
export function getPlayerProgressSummary(guestData: GuestData | null): PlayerProgressSummary {
  const data = guestData || getGuestData();
  const totalLevels = allLevels.length;

  let completedCount = 0;
  let totalStars = 0;

  for (const lvl of allLevels) {
    const rec = data.progress[lvl.id];
    if (rec?.status === "completed") {
      completedCount++;
      totalStars += rec.stars || 0;
    }
  }

  const world1Stars = world1Levels.reduce(
    (sum, lvl) => sum + (data.progress[lvl.id]?.stars || 0),
    0
  );
  const isWorld2Unlocked = world1Stars >= 8 || Boolean(data.progress["w2-l1"]);

  const world2Stars = world2Levels.reduce(
    (sum, lvl) => sum + (data.progress[lvl.id]?.stars || 0),
    0
  );
  const isWorld3Unlocked =
    world1Stars + world2Stars >= 16 || Boolean(data.progress["w3-l1"]);

  // Cari level yang sedang aktif dikerjakan
  let currentLevel: LevelDefinition = allLevels[0];

  // Cari level pertama yang belum diselesaikan tapi sudah terbuka
  for (const lvl of allLevels) {
    const rec = data.progress[lvl.id];
    if (lvl.worldNumber === 2 && !isWorld2Unlocked) {
      break;
    }
    if (lvl.worldNumber === 3 && !isWorld3Unlocked) {
      break;
    }
    if (!rec || rec.status !== "completed") {
      currentLevel = lvl;
      break;
    }
  }

  // Jika semua level sudah selesai, gunakan level terakhir
  if (completedCount === totalLevels) {
    currentLevel = allLevels[allLevels.length - 1];
  }

  return {
    currentLevel,
    completedCount,
    totalLevels,
    totalStars,
    maxStars: totalLevels * 3,
    totalXp: data.profile.totalXp,
    rank: data.profile.wizardRank,
    isWorld2Unlocked,
    isWorld3Unlocked,
    isPersistenceLocal: true, // Saat ini disimpan di LocalStorage perangkat lokal
  };
}
