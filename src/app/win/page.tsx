"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/BackButton";

// ← Drop your video file at public/video/teaser.mp4
const TEASER_SRC = "/video/teaser.mp4";

// How long to show the celebration before transitioning to video (ms)
const CELEBRATION_DURATION = 3000;
const FADE_DURATION = 600;

interface Particle {
  x: number; y: number; vx: number; vy: number;
  rot: number; rotSpeed: number; color: string; size: number; emoji?: string;
}

type Phase = "celebration" | "fading" | "video";

export default function WinPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("celebration");
  const [show, setShow] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [userName, setUserName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const animFrameRef = useRef<number>(0);

  // User info + win log
  useEffect(() => {
    const userData = localStorage.getItem("nostalgia_user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserName(parsed.username || "");
      fetch("/api/winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: parsed.phone }),
      }).catch(() => {});
    }
    requestAnimationFrame(() => setShow(true));
    setTimeout(() => setShowContent(true), 600);
  }, []);

  // Win fanfare (Web Audio API — no file needed)
  useEffect(() => {
    try {
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);

      const notes = [523, 659, 784, 1047, 1319]; // C5 arpeggio
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g);
        g.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + i * 0.13;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.3, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.55);
      });

      // Final chord
      [523, 659, 784].forEach((freq) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g);
        g.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        const t = ctx.currentTime + notes.length * 0.13 + 0.05;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.25, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        osc.start(t);
        osc.stop(t + 1.3);
      });
    } catch {
      // Audio not available — skip silently
    }
  }, []);

  // Auto-transition: celebration → fading → video
  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fading"), CELEBRATION_DURATION);
    const videoTimer = setTimeout(() => setPhase("video"), CELEBRATION_DURATION + FADE_DURATION);
    return () => { clearTimeout(fadeTimer); clearTimeout(videoTimer); };
  }, []);

  // Autoplay video when phase switches to "video"
  useEffect(() => {
    if (phase !== "video") return;
    const vid = videoRef.current;
    if (!vid) return;
    vid.play().catch(() => {});
  }, [phase]);

  // Confetti animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const COLORS = ["#ff1493", "#ffd700", "#ffffff", "#ff6b35", "#a855f7", "#00e676"];

    const particles: Particle[] = Array.from({ length: 140 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 400,
      vx: (Math.random() - 0.5) * 3.5,
      vy: 2.5 + Math.random() * 3,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.13,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 7 + Math.random() * 7,
      emoji: Math.random() < 0.28 ? "🍑" : undefined,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.vx += (Math.random() - 0.5) * 0.08;
        if (p.y > canvas.height + 30) { p.y = -20; p.x = Math.random() * canvas.width; }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.emoji) {
          ctx.font = `${p.size * 2.2}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.emoji, 0, 0);
        } else {
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(animFrameRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-bg">
      {/* Confetti — always rendered, fades with celebration */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700"
        style={{ opacity: phase === "celebration" ? 1 : 0 }}
      />

      {/* Grid bg */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Celebration screen */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center transition-opacity"
        style={{
          opacity: phase === "celebration" ? 1 : 0,
          transitionDuration: `${FADE_DURATION}ms`,
          pointerEvents: phase === "celebration" ? "auto" : "none",
        }}
      >
        <BackButton href="/menu" />

        <h1
          className="text-5xl font-bold tracking-tight text-text transition-all duration-1000 sm:text-7xl"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0) scale(1)" : "translateY(40px) scale(0.8)",
          }}
        >
          Congratulations{userName ? `, ${userName}` : ""}!
        </h1>

        <p
          className="mt-3 text-2xl font-semibold tracking-tight text-neon transition-all duration-700 delay-300"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(20px)",
          }}
        >
          You beat the level 🍑
        </p>

        <p
          className="mt-6 text-base text-text-muted transition-all duration-700 delay-700"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? "translateY(0)" : "translateY(16px)",
          }}
        >
          Get ready for something exclusive…
        </p>
      </div>

      {/* Video screen */}
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black transition-opacity"
        style={{
          opacity: phase === "fading" || phase === "video" ? 1 : 0,
          transitionDuration: `${FADE_DURATION}ms`,
          pointerEvents: phase === "video" ? "auto" : "none",
        }}
      >
        <video
          ref={videoRef}
          src={TEASER_SRC}
          playsInline
          style={{ width: "min(100vw, 177.78vh)", height: "min(100vh, 56.25vw)" }}
          onEnded={() => router.push("/menu")}
        />
        <button
          onClick={() => router.push("/menu")}
          className="mt-4 text-sm text-white/40 underline transition-colors hover:text-white/80"
        >
          Skip → Back to menu
        </button>
      </div>
    </div>
  );
}
