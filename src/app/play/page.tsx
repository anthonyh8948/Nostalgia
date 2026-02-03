"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameCanvas } from "@/components/GameCanvas";
import { HUD } from "@/components/HUD";

export default function PlayPage() {
  const router = useRouter();
  const [hasAccount, setHasAccount] = useState(false);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const userData = localStorage.getItem("nostalgia_user");
    if (!userData) {
      router.replace("/signup");
    } else {
      setHasAccount(true);
    }
  }, [router]);

  const handleWin = () => {
    router.push("/win");
  };

  const handleDeath = () => {
    setAttempts((a) => a + 1);
  };

  const handleProgress = (p: number) => {
    setProgress(p);
  };

  if (!hasAccount) return null;

  return (
    <div className="h-dvh w-dvw overflow-hidden bg-bg">
      <GameCanvas
        onWin={handleWin}
        onDeath={handleDeath}
        onProgress={handleProgress}
      />
      {/* HUD overlaid on top */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-10 p-4">
        <HUD progress={progress} attempts={attempts} />
      </div>
      <p className="pointer-events-none fixed bottom-4 left-0 right-0 z-10 text-center text-xs text-text-muted">
        Press SPACE or tap to jump
      </p>
    </div>
  );
}
