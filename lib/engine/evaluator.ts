import { LevelGridState } from "./types";

export interface EvaluationResult {
  isVictory: boolean;
  allShardsCollected: boolean;
  allTorchesLit: boolean;
  atPortal: boolean;
  stars: number;
  xpEarned: number;
  message: string;
}

export function evaluateLevelState(
  state: LevelGridState,
  parSteps: number,
  stepsTaken: number
): EvaluationResult {
  const allShardsCollected =
    state.shards.length === 0 ||
    state.shards.every((s) => state.player.collectedShards.includes(s.id));

  const allTorchesLit =
    state.torches.length === 0 ||
    state.torches.every((t) => state.player.litTorches.includes(t.id));

  const atPortal =
    state.player.position.x === state.portal.x &&
    state.player.position.y === state.portal.y;

  const isVictory = allShardsCollected && allTorchesLit && atPortal;

  let stars = 0;
  let xpEarned = 0;
  let message = "";

  if (isVictory) {
    if (stepsTaken <= parSteps) {
      stars = 3;
      xpEarned = 100;
      message = "Luar biasa! Mantramu sangat efisien dan sempurna!";
    } else if (stepsTaken <= parSteps + 2) {
      stars = 2;
      xpEarned = 75;
      message = "Kerja bagus! Sedikit lagi menuju mantra paling ringkas.";
    } else {
      stars = 1;
      xpEarned = 60;
      message = "Berhasil mencapai portal! Coba cari jalan lebih cepat untuk 3 bintang.";
    }
  } else {
    if (!atPortal) {
      message = "Kamu belum tiba di portal tujuan. Lanjutkan langkahmu!";
    } else if (!allTorchesLit) {
      message = "Masih ada lentera yang belum dinyalakan!";
    } else if (!allShardsCollected) {
      message = "Masih ada kristal mana yang tertinggal!";
    }
  }

  return {
    isVictory,
    allShardsCollected,
    allTorchesLit,
    atPortal,
    stars,
    xpEarned,
    message,
  };
}
