import React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center p-8 sm:p-10 text-center rounded-card bg-spell-purple-950/60 border border-spell-purple-800/80 shadow-inner",
        className
      )}
      {...props}
    >
      <div className="w-14 h-14 rounded-2xl bg-spell-purple-900 border border-spell-purple-700/80 flex items-center justify-center text-spell-teal-300 mb-3.5 shadow-sm">
        {icon || <Sparkles className="w-7 h-7 text-spell-gold-400" />}
      </div>
      <h3 className="text-base sm:text-lg font-black text-white">{title}</h3>
      <p className="text-xs sm:text-sm text-spell-purple-300 mt-1 max-w-sm leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
