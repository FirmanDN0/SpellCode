"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = "toast_" + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const Icon =
            toast.type === "success"
              ? CheckCircle2
              : toast.type === "error"
              ? AlertCircle
              : Info;

          const typeStyles = {
            success: "bg-spell-purple-900 border-spell-emerald-500/60 text-spell-emerald-300",
            error: "bg-spell-purple-900 border-spell-coral-500/60 text-spell-coral-300",
            info: "bg-spell-purple-900 border-spell-teal-500/60 text-spell-teal-300",
          };

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-rune border shadow-2xl animate-in slide-in-from-bottom-5 duration-200 text-xs sm:text-sm font-bold",
                typeStyles[toast.type]
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-white">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded text-spell-purple-400 hover:text-white"
                aria-label="Tutup Notifikasi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: (message: string) => {
        console.log("Toast:", message);
      },
    };
  }
  return ctx;
}
