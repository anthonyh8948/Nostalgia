"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GameCanvas, type GameHandle } from "@/components/GameCanvas";
import { HUD } from "@/components/HUD";
import { BackButton } from "@/components/BackButton";

export default function PlayPage() {
  const router = useRouter();
  const gameRef = useRef<GameHandle>(null);
  const [hasAccount, setHasAccount] = useState(false);
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [collectedPeaches, setCollectedPeaches] = useState<number[]>([]);
  const [totalPeaches, setTotalPeaches] = useState(5);
  const [isIdle, setIsIdle] = useState(false);
  const [levelId, setLevelId] = useState<number | null>(null);

  const handlePeachCollect = (collected: number[], total: number) => {
    setCollectedPeaches(collected);
    setTotalPeaches(total);
  };

  useEffect(() => {
    const userData = localStorage.getItem("nostalgia_user");
    if (!userData) {
      router.replace("/signup");
    } else {
      setHasAccount(true);
    }
    const savedLevel = localStorage.getItem("nostalgia_selected_level");
    setLevelId(savedLevel ? parseInt(savedLevel) : 0);
  }, [router]);

  const handleWin = () => {
    if (levelId === 0) {
      localStorage.setItem("nostalgia_peach_vibe_completed", "1");
      localStorage.setItem("nostalgia_peach_vibe_peaches", String(collectedPeaches.length));
      if (collectedPeaches.length >= 3) {
        localStorage.setItem("nostalgia_track1_unlocked", "1");
      }
    }
    router.push("/win");
  };
  const handleDeath = () => setAttempts((a) => a + 1);
  const handleProgress = (p: number) => setProgress(p);
  const handleIdle = () => setIsIdle(true);
  const handleIdleEnd = () => setIsIdle(false);

  const handleDontShowAgain = () => {
    localStorage.setItem("nostalgia_skip_prompt", "1");
    handleIdleEnd();
    gameRef.current?.start();
  };

  if (!hasAccount || levelId === null) return null;

  return (
    <div className="h-dvh w-dvw overflow-hidden bg-bg">
      <BackButton href="/menu" />
      <GameCanvas
        ref={gameRef}
        levelId={levelId}
        onWin={handleWin}
        onDeath={handleDeath}
        onProgress={handleProgress}
        onPeachCollect={handlePeachCollect}
        onIdle={handleIdle}
        isPaused={isPaused}
      />

      {/* HUD */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-10 p-4">
        <HUD progress={progress} attempts={attempts} collectedPeaches={collectedPeaches} totalPeaches={totalPeaches} />
      </div>

      {/* "Don't show again" button — shown when game is in idle/prompt state */}
      {isIdle && (
        <button
          onClick={handleDontShowAgain}
          className="fixed left-1/2 z-10 -translate-x-1/2 text-xs text-text-muted transition-colors hover:text-text"
          style={{ top: "calc(50% + 56px)" }}
        >
          Don&apos;t show me again
        </button>
      )}

      {/* Pause button */}
      <button
        onClick={() => setIsPaused(true)}
        className="fixed right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-bg-surface transition-all hover:border-neon hover:shadow-[0_0_12px_rgba(255,20,147,0.4)]"
        aria-label="Pause"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <rect x="2" y="1" width="3.5" height="12" rx="1" />
          <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
        </svg>
      </button>

      {/* Pause overlay */}
      {isPaused && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="flex w-72 flex-col items-center gap-4 rounded-2xl border border-border p-10 text-center"
            style={{
              background: "#0e0018",
              boxShadow: "0 0 60px rgba(255,20,147,0.12), 0 24px 60px rgba(0,0,0,0.6)",
            }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Paused</p>
            <h2
              className="text-3xl font-bold text-neon"
              style={{ textShadow: "0 0 20px rgba(255,20,147,0.6)" }}
            >
              ⏸
            </h2>

            <button
              onClick={() => setIsPaused(false)}
              className="mt-2 w-full rounded-xl bg-neon py-3.5 text-sm font-bold uppercase tracking-[0.15em] text-bg transition-all hover:shadow-[0_0_24px_rgba(255,20,147,0.5)]"
              style={{ boxShadow: "0 0 12px rgba(255,20,147,0.3)" }}
            >
              Resume
            </button>

            <button
              onClick={() => router.push("/menu")}
              className="w-full rounded-xl border border-border py-3.5 text-sm font-semibold uppercase tracking-[0.15em] text-text-muted transition-all hover:border-neon hover:text-text"
            >
              Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
