import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "gold" | "purple" | "teal" | "coral" | "emerald";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "purple",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    gold: "bg-spell-gold-500/15 text-spell-gold-400 border-spell-gold-500/30",
    purple: "bg-spell-purple-700/25 text-spell-purple-200 border-spell-purple-500/30",
    teal: "bg-spell-teal-500/15 text-spell-teal-300 border-spell-teal-500/30",
    coral: "bg-spell-coral-500/15 text-spell-coral-400 border-spell-coral-500/30",
    emerald: "bg-spell-emerald-500/15 text-spell-emerald-400 border-spell-emerald-500/30",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs font-semibold",
    md: "px-3.5 py-1 text-sm font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border tracking-wide select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
