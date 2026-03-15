"use client";

import { useRef, useEffect, useState } from "react";
import { Game } from "@/engine/Game";

interface GameCanvasProps {
  onWin: () => void;
  onDeath: () => void;
  onProgress: (progress: number) => void;
  isPaused: boolean;
}

export function GameCanvas({ onWin, onDeath, onProgress, isPaused }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [size, setSize] = useState({ w: 1120, h: 630 });

  const callbacksRef = useRef({ onWin, onDeath, onProgress });
  callbacksRef.current = { onWin, onDeath, onProgress };

  // Resize canvas to fill window
  useEffect(() => {
    const updateSize = () => {
      setSize({ w: window.innerWidth, h: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Pause / resume
  useEffect(() => {
    if (!gameRef.current) return;
    if (isPaused) gameRef.current.pause();
    else gameRef.current.resume();
  }, [isPaused]);

  // Init game once, and reinit when size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update the canvas resolution
    canvas.width = size.w;
    canvas.height = size.h;

    // Destroy previous game if exists
    if (gameRef.current) {
      gameRef.current.destroy();
    }

    const game = new Game(canvas, {
      onWin: () => callbacksRef.current.onWin(),
      onDeath: () => callbacksRef.current.onDeath(),
      onProgress: (p) => callbacksRef.current.onProgress(p),
    });

    gameRef.current = game;
    game.init();

    return () => {
      game.destroy();
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      width={size.w}
      height={size.h}
      className="fixed inset-0"
    />
  );
}
