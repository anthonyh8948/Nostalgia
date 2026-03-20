"use client";

import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react";
import { Game } from "@/engine/Game";

export interface GameHandle {
  start: () => void;
}

interface GameCanvasProps {
  levelId?: number;
  onWin: () => void;
  onDeath: () => void;
  onProgress: (progress: number) => void;
  onPeachCollect: (collected: number[], total: number) => void;
  onIdle?: () => void;
  isPaused: boolean;
}

export const GameCanvas = forwardRef<GameHandle, GameCanvasProps>(
  function GameCanvas({ levelId, onWin, onDeath, onProgress, onPeachCollect, onIdle, isPaused }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameRef = useRef<Game | null>(null);
    const [size, setSize] = useState({ w: 1120, h: 630 });

    const callbacksRef = useRef({ onWin, onDeath, onProgress, onPeachCollect, onIdle });
    callbacksRef.current = { onWin, onDeath, onProgress, onPeachCollect, onIdle };

    useImperativeHandle(ref, () => ({
      start: () => gameRef.current?.start(),
    }));

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

      canvas.width = size.w;
      canvas.height = size.h;

      if (gameRef.current) {
        gameRef.current.destroy();
      }

      const game = new Game(canvas, {
        onWin: () => callbacksRef.current.onWin(),
        onDeath: () => callbacksRef.current.onDeath(),
        onProgress: (p) => callbacksRef.current.onProgress(p),
        onPeachCollect: (collected, total) => callbacksRef.current.onPeachCollect(collected, total),
        onIdle: () => callbacksRef.current.onIdle?.(),
      }, levelId ?? 0);

      gameRef.current = game;
      game.init();

      return () => {
        game.destroy();
      };
    }, [size, levelId]);

    return (
      <canvas
        ref={canvasRef}
        width={size.w}
        height={size.h}
        className="fixed inset-0"
      />
    );
  }
);
