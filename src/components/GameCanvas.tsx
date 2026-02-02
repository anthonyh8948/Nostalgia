"use client";

import { useRef, useEffect, useCallback } from "react";
import { Game } from "@/engine/Game";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/lib/constants";

interface GameCanvasProps {
  onWin: () => void;
  onDeath: () => void;
  onProgress: (progress: number) => void;
}

export function GameCanvas({ onWin, onDeath, onProgress }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  const handleWin = useCallback(() => onWin(), [onWin]);
  const handleDeath = useCallback(() => onDeath(), [onDeath]);
  const handleProgress = useCallback((p: number) => onProgress(p), [onProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new Game(canvas, {
      onWin: handleWin,
      onDeath: handleDeath,
      onProgress: handleProgress,
    });

    gameRef.current = game;
    game.init();

    return () => {
      game.destroy();
    };
  }, [handleWin, handleDeath, handleProgress]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="max-w-full rounded-lg border border-border"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
