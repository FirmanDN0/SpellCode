import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  subMessage?: string;
}

export function LoadingState({
  className,
  message = "Memuat Energi Sihir...",
  subMessage = "Sedang mempersiapkan data akademi untukmu.",
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center p-8 sm:p-12 text-center",
        className
      )}
      {...props}
    >
      <div className="relative w-14 h-14 flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-spell-purple-800 border-t-spell-teal-400 animate-spin" />
        <Sparkles className="w-6 h-6 text-spell-gold-300 animate-pulse" />
      </div>
      <p className="text-base font-bold text-white">{message}</p>
      {subMessage && (
        <p className="text-xs text-spell-purple-300 mt-1 max-w-xs">{subMessage}</p>
      )}
    </div>
  );
}
