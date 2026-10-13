import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  className,
  title = "Terjadi Getaran Sihir Tak Terduga",
  message = "Mantra mengalami sedikit hambatan. Coba ulangi kembali.",
  onRetry,
  retryLabel = "Coba Lagi",
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-card bg-spell-purple-950/80 border border-spell-coral-500/40 shadow-inner",
        className
      )}
      {...props}
    >
      <div className="w-12 h-12 rounded-2xl bg-spell-purple-900 border border-spell-coral-500/50 flex items-center justify-center text-spell-coral-400 mb-3 shadow-sm">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-extrabold text-white">{title}</h3>
      <p className="text-xs sm:text-sm text-spell-purple-300 mt-1 max-w-sm leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="secondary" size="sm" onClick={onRetry} className="border-spell-coral-500/40 text-spell-coral-300">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            <span>{retryLabel}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
