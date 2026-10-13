"use client";

import React, { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { soundManager } from "@/lib/audio/soundManager";
import { Button } from "./Button";

export function SoundToggle({ className }: { className?: string }) {
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMuted(soundManager.getMuted());
  }, []);

  const handleToggle = () => {
    const newState = soundManager.toggleMute();
    setIsMuted(newState);
  };

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        size="icon"
        className={className}
        aria-label="Pengaturan Suara"
      >
        <Volume2 className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={handleToggle}
      className={className}
      aria-label={isMuted ? "Nyalakan Suara" : "Matikan Suara"}
      title={isMuted ? "Nyalakan Suara" : "Matikan Suara"}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-spell-coral-400" />
      ) : (
        <Volume2 className="w-5 h-5 text-spell-teal-300" />
      )}
    </Button>
  );
}
