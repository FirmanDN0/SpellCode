import { EvaluationResult, LevelGridState, Objective } from "./types";
export type { EvaluationResult };

export function evaluateLevelState(
  state: LevelGridState,
  parSteps: number,
  stepsTaken: number,
  customObjectives?: Objective[]
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

  // Evaluasi daftar objektif eksplisit
  const objectives: Objective[] = customObjectives
    ? customObjectives.map((obj) => {
        if (obj.type === "REACH_PORTAL") {
          return { ...obj, isCompleted: atPortal };
        }
        if (obj.type === "LIGHT_ALL_TORCHES") {
          return {
            ...obj,
            currentCount: state.player.litTorches.length,
            isCompleted: allTorchesLit,
          };
        }
        if (obj.type === "COLLECT_ALL_SHARDS") {
          return {
            ...obj,
            currentCount: state.player.collectedShards.length,
            isCompleted: allShardsCollected,
          };
        }
        return obj;
      })
    : [
        {
          id: "obj-portal",
          type: "REACH_PORTAL",
          description: "Tiba di gerbang portal kemenangan",
          isCompleted: atPortal,
        },
        ...(state.torches.length > 0
          ? [
              {
                id: "obj-torches",
                type: "LIGHT_ALL_TORCHES" as const,
                description: `Nyalakan seluruh lentera (${state.player.litTorches.length}/${state.torches.length})`,
                requiredCount: state.torches.length,
                currentCount: state.player.litTorches.length,
                isCompleted: allTorchesLit,
              },
            ]
          : []),
        ...(state.shards.length > 0
          ? [
              {
                id: "obj-shards",
                type: "COLLECT_ALL_SHARDS" as const,
                description: `Petik seluruh kristal mana (${state.player.collectedShards.length}/${state.shards.length})`,
                requiredCount: state.shards.length,
                currentCount: state.player.collectedShards.length,
                isCompleted: allShardsCollected,
              },
            ]
          : []),
      ];

  return {
    isVictory,
    allShardsCollected,
    allTorchesLit,
    atPortal,
    objectives,
    stars,
    xpEarned,
    message,
  };
}
