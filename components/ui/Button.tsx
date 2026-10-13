"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { soundManager } from "@/lib/audio/soundManager";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "success" | "secondary" | "teal" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  disableSound?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disableSound = false,
      onClick,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !disableSound) {
        soundManager.playClick();
      }
      onClick?.(e);
    };

    const baseStyles =
      "relative inline-flex items-center justify-center font-bold transition-all duration-150 select-none rounded-rune focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-spell-teal-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none active:translate-y-1";

    const variantStyles = {
      primary:
        "bg-spell-gold-500 hover:bg-spell-gold-400 text-spell-purple-950 shadow-rune-gold border-t border-spell-gold-200",
      success:
        "bg-spell-emerald-500 hover:bg-spell-emerald-400 text-white shadow-[0_4px_0_#059669,0_8px_16px_rgba(16,185,129,0.3)] border-t border-spell-emerald-300",
      secondary:
        "bg-spell-purple-700 hover:bg-spell-purple-600 text-spell-purple-50 shadow-rune-purple border-t border-spell-purple-400",
      teal:
        "bg-spell-teal-600 hover:bg-spell-teal-500 text-white shadow-rune-teal border-t border-spell-teal-300",
      danger:
        "bg-spell-coral-500 hover:bg-spell-coral-400 text-white shadow-rune-coral border-t border-spell-coral-300",
      ghost:
        "bg-transparent hover:bg-spell-purple-800/60 text-spell-purple-200 hover:text-white shadow-none active:translate-y-0",
    };

    const sizeStyles = {
      sm: "min-h-[40px] px-3.5 py-1.5 text-sm gap-1.5",
      md: "min-h-[48px] px-5 py-2.5 text-base gap-2",
      lg: "min-h-[56px] px-7 py-3 text-lg gap-2.5",
      icon: "min-w-[48px] min-h-[48px] p-2 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
