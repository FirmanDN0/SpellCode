"use client";

import React from "react";
import { LevelGridState } from "@/lib/engine/types";
import { WizardCharacter } from "./WizardCharacter";
import { Flame, Sparkles } from "lucide-react";

interface ArenaGridProps {
  state: LevelGridState;
  isMoving?: boolean;
}

export function ArenaGrid({ state, isMoving = false }: ArenaGridProps) {
  const { width, height, player, obstacles, shards, torches, portal } = state;

  return (
    <div className="relative w-full aspect-square max-w-[540px] mx-auto p-3 sm:p-4 rounded-card bg-spell-purple-950 border-2 border-spell-purple-700/80 shadow-card-fantasy flex items-center justify-center overflow-hidden">
      {/* Background Ambience Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15)_0,rgba(15,6,34,0.95)_70%)] pointer-events-none" />

      {/* Grid Canvas Container */}
      <div
        className="relative w-full h-full grid gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-spell-purple-900/60 rounded-xl border border-spell-purple-800"
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${height}, minmax(0, 1fr))`,
        }}
      >
        {/* Render Tiles */}
        {Array.from({ length: height }).map((_, y) =>
          Array.from({ length: width }).map((_, x) => {
            const isAlternate = (x + y) % 2 === 1;
            const isObstacleTile = obstacles.some((o) => o.x === x && o.y === y);
            const shard = shards.find((s) => s.x === x && s.y === y);
            const isShardCollected = shard && player.collectedShards.includes(shard.id);
            const torch = torches.find((t) => t.x === x && t.y === y);
            const isTorchLit = torch && player.litTorches.includes(torch.id);
            const isPortalTile = portal.x === x && portal.y === y;
            const isPlayerHere = player.position.x === x && player.position.y === y;

            return (
              <div
                key={`tile_${x}_${y}`}
                className={`relative rounded-lg flex items-center justify-center transition-all overflow-hidden ${
                  isObstacleTile
                    ? "bg-spell-purple-950/90 border border-spell-coral-500/30 shadow-inner"
                    : isAlternate
                    ? "bg-spell-purple-800/40 border border-spell-purple-700/30"
                    : "bg-spell-purple-800/20 border border-spell-purple-700/20"
                }`}
              >
                {/* Etched Floor Rune Symbol on Empty Walkable Tiles */}
                {!isObstacleTile && !isPortalTile && !torch && (
                  <span className="text-[10px] sm:text-xs text-spell-purple-600/25 font-mono select-none pointer-events-none">
                    ᛟ
                  </span>
                )}

                {/* Obstacle: Enchanted Boulder / Bramble Bush */}
                {isObstacleTile && (
                  <div className="relative w-full h-full flex items-center justify-center p-1">
                    <svg viewBox="0 0 40 40" className="w-10/12 h-10/12 drop-shadow-md" fill="none">
                      <polygon
                        points="20,4 34,14 36,28 26,38 12,36 4,24 8,10"
                        fill="#3B1C72"
                        stroke="#7C3AED"
                        strokeWidth="1.5"
                      />
                      <polygon points="20,10 28,18 24,28 14,24 16,14" fill="#241049" />
                      <line x1="20" y1="4" x2="20" y2="10" stroke="#F43F5E" strokeWidth="1" />
                      <line x1="34" y1="14" x2="28" y2="18" stroke="#F43F5E" strokeWidth="1" />
                    </svg>
                  </div>
                )}

                {/* Portal Target */}
                {isPortalTile && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className={`relative w-10/12 h-10/12 rounded-full border-2 border-dashed flex items-center justify-center animate-spin ${
                        state.status === "VICTORY"
                          ? "border-spell-emerald-400 bg-spell-emerald-500/25 shadow-glow-teal"
                          : "border-spell-teal-400 bg-spell-teal-500/15"
                      }`}
                      style={{ animationDuration: "8s" }}
                    >
                      <Sparkles
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          state.status === "VICTORY"
                            ? "text-spell-emerald-300 animate-pulse"
                            : "text-spell-teal-300"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Torch / Sacred Lantern */}
                {torch && (
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    {isTorchLit ? (
                      <div className="relative flex items-center justify-center">
                        <div className="absolute -inset-2 bg-spell-gold-500/30 rounded-full blur-sm animate-pulse" />
                        <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-spell-gold-400 fill-spell-gold-400 animate-bounce" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center opacity-60">
                        <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-spell-purple-400" />
                      </div>
                    )}
                  </div>
                )}

                {/* Mana Shard / Crystal */}
                {shard && !isShardCollected && (
                  <div className="relative z-10 flex items-center justify-center animate-float-gentle">
                    <svg viewBox="0 0 32 32" className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-lg" fill="none">
                      <polygon
                        points="16,2 28,12 24,28 8,28 4,12"
                        fill="#06B6D4"
                        stroke="#67E8F9"
                        strokeWidth="1.5"
                      />
                      <polygon points="16,8 22,14 19,23 13,23 10,14" fill="#A5F3FC" opacity="0.8" />
                    </svg>
                  </div>
                )}

                {/* Player Character Avatar */}
                {isPlayerHere && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <WizardCharacter direction={player.direction} isMoving={isMoving} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
