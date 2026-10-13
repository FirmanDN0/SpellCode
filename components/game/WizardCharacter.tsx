"use client";

import React from "react";
import { Direction } from "@/lib/engine/types";
import { cn } from "@/lib/utils";

interface WizardCharacterProps {
  direction: Direction;
  isMoving?: boolean;
  className?: string;
}

export function WizardCharacter({ direction, isMoving = false, className }: WizardCharacterProps) {
  // Rotasi rotasional berdasarkan arah hadap
  const rotationDegrees = {
    UP: -90,
    RIGHT: 0,
    DOWN: 90,
    LEFT: 180,
  }[direction];

  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center transition-transform duration-250 ease-out select-none pointer-events-none",
        isMoving && "scale-105",
        className
      )}
      style={{
        transform: `rotate(${rotationDegrees}deg)`,
      }}
    >
      {/* Sprite Penyihir Magang SVG */}
      <svg
        viewBox="0 0 64 64"
        className="w-10/12 h-10/12 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Aura Sihir Halus di Bawah */}
        <circle cx="32" cy="32" r="26" fill="url(#wizardGlow)" opacity="0.35" />

        {/* Jubah Penyihir (Body) */}
        <ellipse cx="28" cy="32" rx="16" ry="14" fill="#5B21B6" />
        <ellipse cx="28" cy="32" rx="14" ry="12" fill="#7C3AED" />

        {/* Kerah Jubah Emas */}
        <path d="M22 24 C 28 27, 28 37, 22 40" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />

        {/* Kepala Penyihir */}
        <circle cx="34" cy="32" r="10" fill="#FED7AA" />

        {/* Mata Ramah */}
        <circle cx="37" cy="29" r="2" fill="#1E1B4B" />
        <circle cx="37" cy="35" r="2" fill="#1E1B4B" />
        <circle cx="38" cy="28.5" r="0.8" fill="#FFFFFF" />
        <circle cx="38" cy="34.5" r="0.8" fill="#FFFFFF" />

        {/* Pipi Merona Lucu */}
        <ellipse cx="35" cy="27" rx="1.5" ry="1" fill="#FB7185" opacity="0.7" />
        <ellipse cx="35" cy="37" rx="1.5" ry="1" fill="#FB7185" opacity="0.7" />

        {/* Topi Kerucut Penyihir Magang */}
        <path
          d="M26 20 L 46 32 L 26 44 Q 24 32 26 20 Z"
          fill="#4338CA"
        />
        <path
          d="M28 22 L 44 32 L 28 42 Z"
          fill="#6366F1"
        />

        {/* Pita Topi Emas & Bintang di Ujung Topi */}
        <path d="M27 22 L 27 42" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
        <polygon
          points="46,32 49,33.5 48,30.5 50.5,29 47.5,29 46,26 45,29 42,29 44.5,30.5 43.5,33.5"
          fill="#FDE68A"
        />

        {/* Tongkat Sihir di Tangan Kanan */}
        <line x1="30" y1="42" x2="48" y2="44" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
        {/* Permata Tongkat Berpijar */}
        <circle cx="48" cy="44" r="3.5" fill="#2DD4BF" className="animate-pulse" />
        <circle cx="48" cy="44" r="1.5" fill="#FFFFFF" />

        {/* Gradient Defs */}
        <defs>
          <radialGradient id="wizardGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#4C1D95" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}
