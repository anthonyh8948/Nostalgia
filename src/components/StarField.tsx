"use client";

import { useEffect, useRef } from "react";

// Weighted color palette: mostly white, with scattered pink/purple/cyan/gold
const PALETTE = [
  { r: 255, g: 255, b: 255, w: 6 },  // white
  { r: 255, g: 30,  b: 155, w: 2 },  // pink
  { r: 180, g: 80,  b: 255, w: 2 },  // purple
  { r: 80,  g: 210, b: 255, w: 1 },  // cyan
  { r: 255, g: 215, b: 80,  w: 1 },  // gold
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
  nextFlash: number; flashDuration: number;
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
    nextFlash: Date.now() + Math.random() * 7000,
    flashDuration: 180 + Math.random() * 280,
  };
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const stars: Star[] = Array.from({ length: 200 }, () => makeStar(w, h));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const now = Date.now();
      const t = now / 1000;

      for (const s of stars) {
        // Drift + wrap
        s.x = (s.x + s.vx + w) % w;
        s.y = (s.y + s.vy + h) % h;

        // Twinkle: slow sine modulation
        const twinkle = 0.65 + 0.35 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset);

        // Flash: star briefly ignites brightly
        const elapsed = now - s.nextFlash;
        let flash = 0;
        if (elapsed >= 0) {
          const p = elapsed / s.flashDuration;
          if (p < 1) {
            flash = p < 0.25 ? p / 0.25 : 1 - (p - 0.25) / 0.75;
          } else {
            // Schedule next flash 4–12 seconds away
            s.nextFlash = now + 4000 + Math.random() * 8000;
          }
        }

        const { r, g, b } = s.color;
        const alpha = Math.min(1, s.baseAlpha * twinkle + flash * 0.95);
        const size = s.size * (1 + flash * 2.5);

        if (flash > 0.05) {
          ctx.shadowColor = `rgba(${r},${g},${b},${flash})`;
          ctx.shadowBlur = 10 + flash * 18;
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
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />;
}
