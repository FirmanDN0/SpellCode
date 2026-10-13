import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  showValueText?: boolean;
  variant?: "teal" | "gold" | "emerald";
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  className,
  value,
  max = 100,
  label,
  showValueText = false,
  variant = "teal",
  size = "md",
  ...props
}: ProgressBarProps) {
  const safePercent = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  const variantGradients = {
    teal: "from-spell-teal-500 to-spell-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.4)]",
    gold: "from-spell-gold-600 via-spell-gold-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]",
    emerald: "from-spell-emerald-600 to-spell-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]",
  };

  const heightClasses = {
    sm: "h-2",
    md: "h-3.5",
    lg: "h-5",
  };

  return (
    <div className={cn("w-full flex flex-col gap-1.5", className)} {...props}>
      {(label || showValueText) && (
        <div className="flex items-center justify-between text-xs font-bold text-spell-purple-200">
          {label && <span>{label}</span>}
          {showValueText && (
            <span className="font-mono text-spell-teal-300">
              {value} / {max} ({safePercent}%)
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || "Progres"}
        className={cn(
          "w-full rounded-full bg-spell-purple-950 border border-spell-purple-800 p-0.5 overflow-hidden shadow-inner",
          heightClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-300 ease-out",
            variantGradients[variant]
          )}
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}
