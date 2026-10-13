"use client";

import React, { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Kesalahan antarmuka:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-spell-purple-900 border border-spell-coral-500/40 flex items-center justify-center text-spell-coral-400 mb-4 shadow-lg">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-white">Mantra Mengalami Gangguan!</h1>
      <p className="text-sm text-spell-purple-300 mt-2 max-w-sm">
        Ada sedikit getaran energi sihir yang tidak stabil. Tekan tombol di bawah untuk menyegarkan arena.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Button variant="primary" size="md" onClick={() => reset()}>
          <RotateCcw className="w-4 h-4" />
          <span>Mulai Ulang Arena</span>
        </Button>
      </div>
    </div>
  );
}
