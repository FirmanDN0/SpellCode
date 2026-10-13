import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leftIcon,
      rightAction,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? "input_" + label.toLowerCase().replace(/\s+/g, "_") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs sm:text-sm font-bold text-spell-purple-200 select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center justify-center text-spell-purple-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              "w-full min-h-[48px] px-4 py-2.5 rounded-rune bg-spell-purple-950 border text-white placeholder-spell-purple-500 text-sm font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-spell-teal-400 disabled:opacity-40 disabled:cursor-not-allowed",
              leftIcon && "pl-11",
              rightAction && "pr-12",
              error
                ? "border-spell-coral-500 focus:ring-spell-coral-400"
                : "border-spell-purple-700/80 hover:border-spell-purple-600 focus:border-spell-teal-400",
              className
            )}
            {...props}
          />

          {rightAction && (
            <div className="absolute right-2 flex items-center">
              {rightAction}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs font-semibold text-spell-coral-400 mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-spell-purple-400 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
