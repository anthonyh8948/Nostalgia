"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/BackButton";

// ← Swap in your YouTube video ID when ready (the part after ?v= in the URL)
const TEASER_VIDEO_ID = "YOUR_YOUTUBE_VIDEO_ID";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  color: string;
  size: number;
  emoji?: string;
}

export default function WinPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [userName, setUserName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const playerRef = useRef<{ destroy?: () => void } | null>(null);

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
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Confetti
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

    const COLORS = ["#ff1493", "#ffd700", "#ffffff", "#ff6b35", "#a855f7", "#00e676"];

    const particles: Particle[] = Array.from({ length: 130 }, () => ({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * 300,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.12,
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

        if (p.y > canvas.height + 30) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

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

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // YouTube player — loads when user clicks Watch
  useEffect(() => {
    if (!showVideo) return;

    const existing = document.getElementById("yt-api-script");
    if (!existing) {
      const tag = document.createElement("script");
      tag.id = "yt-api-script";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }

    const setup = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      playerRef.current = new (window as unknown as { YT: { Player: new (id: string, opts: unknown) => { destroy?: () => void } } }).YT.Player("yt-player", {
        videoId: TEASER_VIDEO_ID,
        playerVars: { autoplay: 1, controls: 1, rel: 0 },
        events: {
          onStateChange: (event: { data: number }) => {
            // 0 = ended
            if (event.data === 0) router.push("/menu");
          },
        },
      });
    };

    if ((window as unknown as { YT?: unknown }).YT) {
      setup();
    } else {
      (window as unknown as { onYouTubeIframeAPIReady?: () => void }).onYouTubeIframeAPIReady = setup;
    }

    return () => {
      playerRef.current?.destroy?.();
    };
  }, [showVideo, router]);

  if (showVideo) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-black">
        <div
          id="yt-player"
          style={{
            width: "min(100vw, 177.78vh)",
            height: "min(100vh, 56.25vw)",
          }}
        />
        <button
          onClick={() => router.push("/menu")}
          className="mt-4 text-sm text-white/40 underline transition-colors hover:text-white/80"
        >
          Skip → Back to menu
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <BackButton href="/menu" />

      {/* Confetti */}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" />

      {/* Grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 text-center">
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
          className="mt-3 text-2xl font-semibold tracking-tight text-neon transition-all duration-700 delay-500"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(20px)",
          }}
        >
          You beat the level 🍑
        </p>

        <div
          className="transition-all duration-700"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <p className="mt-8 text-lg text-text-muted">
            You unlocked something exclusive 👀
          </p>

          <button
            onClick={() => setShowVideo(true)}
            className="mt-8 inline-flex items-center gap-3 rounded-xl bg-neon px-10 py-5 text-base font-bold uppercase tracking-[0.2em] text-bg transition-all hover:scale-105"
            style={{ boxShadow: "0 0 32px rgba(255,20,147,0.5)" }}
          >
            ▶&nbsp; Watch the Teaser
          </button>

          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              onClick={() => router.push("/play")}
              className="text-sm font-medium text-neon underline underline-offset-4 transition-colors hover:text-text"
            >
              Play again
            </button>
            <button
              onClick={() => router.push("/")}
              className="text-sm text-text-muted underline underline-offset-4 transition-colors hover:text-neon"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
