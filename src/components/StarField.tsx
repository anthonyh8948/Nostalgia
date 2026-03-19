"use client";

import { useEffect, useRef } from "react";

const PALETTE = [
  { r: 255, g: 255, b: 255, w: 6 },
  { r: 255, g: 30,  b: 155, w: 2 },
  { r: 180, g: 80,  b: 255, w: 2 },
  { r: 80,  g: 210, b: 255, w: 1 },
  { r: 255, g: 215, b: 80,  w: 1 },
];

function pickColor() {
  const total = PALETTE.reduce((s, c) => s + c.w, 0);
  let r = Math.random() * total;
  for (const c of PALETTE) { r -= c.w; if (r <= 0) return c; }
  return PALETTE[0];
}

interface Star {
  x: number; y: number;
  size: number;
  color: { r: number; g: number; b: number };
  baseAlpha: number;
  vx: number; vy: number;
  twinkleOffset: number; twinkleSpeed: number;
}

function makeStar(w: number, h: number): Star {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: Math.random() * 1.7 + 0.2,
    color: pickColor(),
    baseAlpha: Math.random() * 0.45 + 0.08,
    vx: (Math.random() - 0.5) * 0.14,
    vy: (Math.random() - 0.5) * 0.07,
    twinkleOffset: Math.random() * Math.PI * 2,
    twinkleSpeed: 0.3 + Math.random() * 1.6,
  };
}

// Organic waveform using a sum of sines — simulates a stock chart / signal
function wave(x: number, t: number, seed: number): number {
  return (
    Math.sin(x * 1.4 + t * 0.38 + seed) * 0.38 +
    Math.sin(x * 2.9 + t * 0.61 + seed * 1.7) * 0.22 +
    Math.sin(x * 5.1 + t * 0.97 + seed * 0.9) * 0.14 +
    Math.sin(x * 8.7 + t * 0.44 + seed * 2.3) * 0.08 +
    Math.sin(x * 13.3 + t * 1.21 + seed * 1.1) * 0.04 +
    Math.sin(x * 0.6 + t * 0.22 + seed * 0.5) * 0.14   // slow roll
  );
}

function drawWaveforms(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const N = Math.ceil(w / 2) + 1; // sample every 2px for smoothness
  const baseY = h * 0.68;
  const amp = h * 0.09;

  // ── Wave 1: pink filled area ──────────────────────────────────────────
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * w;
    const nx = (i / N) * Math.PI * 2;
    ctx.lineTo(x, baseY + amp * wave(nx, t, 0));
  }
  ctx.lineTo(w, h);
  ctx.closePath();

  const fillGrad = ctx.createLinearGradient(0, baseY - amp, 0, h);
  fillGrad.addColorStop(0, "rgba(255, 20, 147, 0.10)");
  fillGrad.addColorStop(0.6, "rgba(255, 20, 147, 0.04)");
  fillGrad.addColorStop(1, "rgba(255, 20, 147, 0)");
  ctx.fillStyle = fillGrad;
  ctx.fill();

  // line on top of fill
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * w;
    const nx = (i / N) * Math.PI * 2;
    const y = baseY + amp * wave(nx, t, 0);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgba(255, 20, 147, 0.55)";
  ctx.lineWidth = 1.5;
  ctx.shadowColor = "rgba(255, 20, 147, 0.7)";
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ── Wave 2: purple line, offset phase ────────────────────────────────
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * w;
    const nx = (i / N) * Math.PI * 2;
    const y = baseY + amp * 0.65 * wave(nx, t * 0.82, 2.4);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgba(160, 80, 255, 0.28)";
  ctx.lineWidth = 1;
  ctx.shadowColor = "rgba(160, 80, 255, 0.5)";
  ctx.shadowBlur = 6;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ── Wave 3: cyan line, higher frequency ──────────────────────────────
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * w;
    const nx = (i / N) * Math.PI * 2;
    const y = baseY + amp * 0.45 * wave(nx * 1.3, t * 1.1, 5.1);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = "rgba(80, 210, 255, 0.15)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // ── Horizontal ticker grid lines ─────────────────────────────────────
  ctx.lineWidth = 0.5;
  for (let i = 1; i <= 3; i++) {
    const gy = baseY - amp * (i / 3) * 1.4;
    const alpha = 0.06 - i * 0.015;
    ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
    ctx.beginPath();
    ctx.setLineDash([6, 18]);
    ctx.moveTo(0, gy);
    ctx.lineTo(w, gy);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

const MOUSE_RADIUS = 160;

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let w = 0, h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const onMouseLeave = () => { mouseRef.current = { x: -9999, y: -9999 }; };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    const stars: Star[] = Array.from({ length: 200 }, () => makeStar(w, h));
    const startTime = Date.now();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const t = (Date.now() - startTime) / 1000;
      const { x: mx, y: my } = mouseRef.current;

      // Waveform drawn first (behind stars)
      drawWaveforms(ctx, w, h, t);

      // Stars
      for (const s of stars) {
        s.x = (s.x + s.vx + w) % w;
        s.y = (s.y + s.vy + h) % h;

        const twinkle = 0.65 + 0.35 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset);

        const dist = Math.hypot(s.x - mx, s.y - my);
        const p = dist < MOUSE_RADIUS ? 1 - dist / MOUSE_RADIUS : 0;
        const prox = p * p * (3 - 2 * p); // smoothstep

        const { r, g, b } = s.color;
        const alpha = Math.min(1, s.baseAlpha * twinkle + prox * 0.85);
        const size = s.size * (1 + prox * 3.5);

        if (prox > 0.05) {
          ctx.shadowColor = `rgba(${r},${g},${b},${prox})`;
          ctx.shadowBlur = prox * 22;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />;
}
