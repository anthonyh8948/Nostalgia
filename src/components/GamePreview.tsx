"use client";

import { useEffect, useRef } from "react";

const NEON = "rgba(255, 20, 147, 1)";
const NEON_DIM = "rgba(255, 20, 147, 0.35)";
const GROUND_COLOR = "rgba(255, 20, 147, 0.15)";

interface Spike {
  x: number;
}

export function GamePreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const W = canvas.width;
    const H = canvas.height;
    const GROUND_Y = H - 36;
    const PLAYER_SIZE = 22;
    const PLAYER_X = 110;
    const SPEED = 2.8;
    const GRAVITY = 0.65;
    const JUMP_VY = -11;
    const SPIKE_W = 18;
    const SPIKE_H = 22;

    let playerY = GROUND_Y - PLAYER_SIZE;
    let vy = 0;
    let onGround = true;
    const spikes: Spike[] = [{ x: W + 100 }, { x: W + 500 }];
    let frameCount = 0;
    let nextSpike = 280 + Math.random() * 200;
    let raf: number;

    const jump = () => {
      if (onGround) {
        vy = JUMP_VY;
        onGround = false;
      }
    };

    const drawGrid = () => {
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    };

    const drawGround = () => {
      ctx.fillStyle = GROUND_COLOR;
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.strokeStyle = NEON;
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = NEON;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawPlayer = () => {
      ctx.save();
      ctx.shadowBlur = 16;
      ctx.shadowColor = NEON;
      ctx.strokeStyle = NEON;
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(255,20,147,0.15)";

      // Tilt when in the air
      if (!onGround) {
        ctx.translate(PLAYER_X + PLAYER_SIZE / 2, playerY + PLAYER_SIZE / 2);
        ctx.rotate(0.4);
        ctx.fillRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
        ctx.strokeRect(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);
      } else {
        ctx.fillRect(PLAYER_X, playerY, PLAYER_SIZE, PLAYER_SIZE);
        ctx.strokeRect(PLAYER_X, playerY, PLAYER_SIZE, PLAYER_SIZE);
      }
      ctx.restore();
    };

    const drawSpike = (x: number) => {
      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = NEON;
      ctx.fillStyle = NEON_DIM;
      ctx.strokeStyle = NEON;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x + SPIKE_W / 2, GROUND_Y - SPIKE_H);
      ctx.lineTo(x + SPIKE_W, GROUND_Y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };

    const drawEdgeFade = () => {
      const fadeW = 80;
      const left = ctx.createLinearGradient(0, 0, fadeW, 0);
      left.addColorStop(0, "#0a0a0a");
      left.addColorStop(1, "transparent");
      ctx.fillStyle = left;
      ctx.fillRect(0, 0, fadeW, H);

      const right = ctx.createLinearGradient(W - fadeW, 0, W, 0);
      right.addColorStop(0, "transparent");
      right.addColorStop(1, "#0a0a0a");
      ctx.fillStyle = right;
      ctx.fillRect(W - fadeW, 0, fadeW, H);
    };

    const loop = () => {
      frameCount++;

      // Physics
      vy += GRAVITY;
      playerY += vy;
      if (playerY >= GROUND_Y - PLAYER_SIZE) {
        playerY = GROUND_Y - PLAYER_SIZE;
        vy = 0;
        onGround = true;
      }

      // Move spikes
      for (const s of spikes) s.x -= SPEED;

      // Spawn new spike
      nextSpike -= SPEED;
      if (nextSpike <= 0) {
        spikes.push({ x: W + 40 });
        nextSpike = 260 + Math.random() * 220;
      }

      // Remove off-screen spikes
      while (spikes.length && spikes[0].x < -SPIKE_W) spikes.shift();

      // Auto-jump: look ahead for nearest spike
      const nearest = spikes.find((s) => s.x > PLAYER_X - 10);
      if (nearest && onGround) {
        const dist = nearest.x - (PLAYER_X + PLAYER_SIZE);
        if (dist < 90 && dist > 0) jump();
      }

      // Draw
      ctx.clearRect(0, 0, W, H);
      drawGrid();
      drawGround();
      for (const s of spikes) drawSpike(s.x);
      drawPlayer();
      drawEdgeFade();

      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border"
      style={{ boxShadow: "0 0 0 1px rgba(255,20,147,0.1), 0 8px 32px rgba(0,0,0,0.4)" }}
    >
      <canvas ref={canvasRef} width={640} height={140} className="w-full" />
    </div>
  );
}
