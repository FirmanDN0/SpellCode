"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = "md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full p-6 sm:p-7 rounded-dialog bg-gradient-to-b from-spell-purple-900 to-spell-purple-950 border-2 border-spell-purple-700 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-left flex flex-col",
          widthClasses[maxWidth],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-spell-purple-300 hover:text-white hover:bg-spell-purple-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spell-teal-400"
          aria-label="Tutup Dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {title && (
          <div className="mb-4 pr-8">
            <h2 id="modal-title" className="text-xl font-black text-white tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="text-xs sm:text-sm text-spell-purple-300 mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
