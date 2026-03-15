"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
}

function randomParticle(w: number, h: number, anywhere = false): Particle {
  return {
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : h + Math.random() * 100,
    size: 0.8 + Math.random() * 2,
    speed: 0.3 + Math.random() * 0.7,
    opacity: 0.2 + Math.random() * 0.6,
    drift: (Math.random() - 0.5) * 0.3,
  };
}

export function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = Array.from({ length: 70 }, () =>
      randomParticle(canvas.width, canvas.height, true)
    );

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        p.opacity -= 0.0015;

        if (p.y < -10 || p.opacity <= 0) {
          Object.assign(p, randomParticle(canvas.width, canvas.height));
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.shadowBlur = p.size * 6;
        ctx.shadowColor = "rgba(255, 20, 147, 0.9)";
        ctx.fillStyle = "rgba(255, 20, 147, 0.9)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
