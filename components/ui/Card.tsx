import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive" | "dashed";
}

export function Card({
  className,
  variant = "default",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    default:
      "bg-spell-purple-900/80 border-spell-purple-700/80 shadow-card-fantasy",
    elevated:
      "bg-gradient-to-b from-spell-purple-900 to-spell-purple-950 border-spell-gold-400/60 shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(245,158,11,0.15)]",
    interactive:
      "bg-spell-purple-900/90 border-spell-purple-700 hover:border-spell-gold-400 hover:-translate-y-1 transition-all duration-200 cursor-pointer shadow-card-fantasy hover:shadow-glow-gold",
    dashed:
      "bg-spell-purple-950/40 border-2 border-dashed border-spell-purple-700/80",
  };

  return (
    <div
      className={cn(
        "rounded-card border text-spell-purple-100 p-5 sm:p-6 transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-1.5 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-xl font-black text-white tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs sm:text-sm text-spell-purple-300 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex-1", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-4 pt-3 border-t border-spell-purple-800/80 flex items-center justify-between", className)}
      {...props}
    >
      {children}
    </div>
  );
}
