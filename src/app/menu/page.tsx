"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackButton } from "@/components/BackButton";

const SONGS = [
  {
    id: 0,
    name: "Peach Vibe",
    label: "Track 01",
    unlocked: true,
    bg: "linear-gradient(160deg, #2d0018 0%, #1a000f 100%)",
    accent: "#ff1493",
  },
  {
    id: 1,
    name: "Kingda Ka",
    label: "Track 02",
    unlocked: false,
    bg: "linear-gradient(160deg, #001a00 0%, #000d00 100%)",
    accent: "#00e676",
  },
  {
    id: 2,
    name: "Suite Royale",
    label: "Track 03",
    unlocked: false,
    bg: "linear-gradient(160deg, #001a1f 0%, #000e12 100%)",
    accent: "#00c8e0",
  },
  {
    id: 3,
    name: "11 in Paris",
    label: "Track 04",
    unlocked: false,
    bg: "linear-gradient(160deg, #1f0e00 0%, #120800 100%)",
    accent: "#ff6b35",
  },
  {
    id: 4,
    name: "Self-Driven",
    label: "Track 05",
    unlocked: false,
    bg: "linear-gradient(160deg, #1a1200 0%, #0f0b00 100%)",
    accent: "#f5a623",
  },
  {
    id: 5,
    name: "Prevue",
    label: "Track 06",
    unlocked: false,
    bg: "linear-gradient(160deg, #0a0a0a 0%, #000000 100%)",
    accent: "#e0e0e0",
  },
  {
    id: 6,
    name: "72 Hours in Vegas",
    label: "Album",
    unlocked: false,
    bg: "linear-gradient(160deg, #1a0000 0%, #0d0000 100%)",
    accent: "#ff2020",
    sparkle: true,
  },
] as Array<{ id: number; name: string; label: string; unlocked: boolean; bg: string; accent: string; sparkle?: boolean }>;

export default function MenuPage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  useEffect(() => {
    if (!localStorage.getItem("nostalgia_user")) router.replace("/signup");
  }, [router]);

  const onDragStart = (x: number) => {
    startX.current = x;
    setDragging(true);
  };

  const onDragMove = (x: number) => {
    if (!dragging) return;
    setDragOffset(x - startX.current);
  };

  const onDragEnd = () => {
    setDragging(false);
    if (dragOffset < -60 && activeIndex < SONGS.length - 1) setActiveIndex((i) => i + 1);
    else if (dragOffset > 60 && activeIndex > 0) setActiveIndex((i) => i - 1);
    setDragOffset(0);
  };

  return (
    <>
      <BackButton href="/" />
      {/* Lock pulse animation */}
      <style>{`
        @keyframes lockPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.05); transform: scale(1); }
          50% { box-shadow: 0 0 20px 4px rgba(255,255,255,0.1); transform: scale(1.06); }
        }
        @keyframes lockFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes sparkleFloat {
          0%, 100% { opacity: 0; transform: translateY(0px) scale(0.5); }
          50% { opacity: 1; transform: translateY(-12px) scale(1); }
        }
      `}</style>

      <div
        className="flex min-h-dvh select-none flex-col items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0e0018 0%, #080010 55%, #0a0a0a 100%)" }}
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <h1
            className="text-4xl font-bold uppercase tracking-[0.15em] text-neon"
            style={{ textShadow: "0 0 24px rgba(255,20,147,0.7), 0 0 60px rgba(255,20,147,0.3)" }}
          >
            Tony&apos;s Vault
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.35em] text-text-muted">
            Choose Your Level
          </p>
        </div>

        {/* Carousel */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: "100%", height: "400px", cursor: dragging ? "grabbing" : "grab" }}
          onMouseDown={(e) => onDragStart(e.clientX)}
          onMouseMove={(e) => onDragMove(e.clientX)}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
          onTouchEnd={onDragEnd}
        >
          {SONGS.map((song, i) => {
            const offset = (i - activeIndex) * 300 + dragOffset;
            const isActive = i === activeIndex;
            const dist = Math.abs(i - activeIndex);
            const scale = isActive ? 1 : 0.82;
            const opacity = dist > 1 ? 0 : isActive ? 1 : 0.45;
            const zIndex = SONGS.length - dist;

            return (
              <div
                key={song.id}
                onClick={() => {
                  if (isActive && song.unlocked) router.push("/play");
                  else if (!isActive) setActiveIndex(i);
                }}
                style={{
                  position: "absolute",
                  width: "270px",
                  height: "360px",
                  borderRadius: "20px",
                  background: song.bg,
                  border: `1px solid ${song.accent}30`,
                  boxShadow: isActive
                    ? `0 0 50px ${song.accent}28, 0 24px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.05)`
                    : "0 10px 30px rgba(0,0,0,0.5)",
                  transform: `translateX(${offset}px) scale(${scale})`,
                  transition: dragging
                    ? "opacity 0.2s, box-shadow 0.2s"
                    : "transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s, box-shadow 0.3s",
                  opacity,
                  zIndex,
                  overflow: "hidden",
                  cursor: isActive && song.unlocked ? "pointer" : dist === 0 ? "default" : "pointer",
                }}
              >
                {/* Shimmer on locked cards */}
                {!song.unlocked && isActive && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      overflow: "hidden",
                      borderRadius: "20px",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        width: "40%",
                        background: `linear-gradient(90deg, transparent, ${song.accent}12, transparent)`,
                        animation: "shimmer 3s ease-in-out infinite",
                      }}
                    />
                  </div>
                )}

                {/* Extra sparkles for album card */}
                {song.sparkle && isActive && (
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", borderRadius: "20px" }}>
                    {[...Array(8)].map((_, si) => (
                      <div key={si} style={{
                        position: "absolute",
                        left: `${10 + si * 11}%`,
                        top: `${15 + (si % 3) * 25}%`,
                        width: si % 2 === 0 ? "3px" : "2px",
                        height: si % 2 === 0 ? "3px" : "2px",
                        borderRadius: "50%",
                        background: si % 3 === 0 ? "#fff" : si % 3 === 1 ? "#ff6060" : "#ffaaaa",
                        boxShadow: `0 0 6px 2px ${si % 3 === 0 ? "#fff8" : "#ff404060"}`,
                        animation: `sparkleFloat ${1.8 + si * 0.3}s ease-in-out infinite`,
                        animationDelay: `${si * 0.25}s`,
                      }} />
                    ))}
                  </div>
                )}

                {/* Active card accent top bar */}
                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "2px",
                      background: `linear-gradient(90deg, transparent, ${song.accent}, transparent)`,
                    }}
                  />
                )}

                <div style={{ padding: "28px 26px", height: "100%", display: "flex", flexDirection: "column" }}>
                  {/* Track label */}
                  <span
                    style={{
                      fontSize: "10px",
                      letterSpacing: "0.3em",
                      color: song.accent,
                      textTransform: "uppercase",
                      opacity: 0.65,
                    }}
                  >
                    {song.label}
                  </span>

                  {/* Song name */}
                  <h2
                    style={{
                      fontSize: "26px",
                      fontWeight: "bold",
                      color: "#fff",
                      marginTop: "10px",
                      lineHeight: 1.2,
                      textShadow: isActive ? `0 0 24px ${song.accent}50` : "none",
                    }}
                  >
                    {song.name}
                  </h2>

                  <div style={{ flex: 1 }} />

                  {song.unlocked ? (
                    <div>
                      <div
                        style={{
                          height: "1px",
                          marginBottom: "18px",
                          background: `linear-gradient(90deg, ${song.accent}, transparent)`,
                        }}
                      />
                      <button
                        style={{
                          width: "100%",
                          padding: "13px",
                          background: song.accent,
                          border: "none",
                          borderRadius: "12px",
                          color: "#000",
                          fontWeight: "bold",
                          fontSize: "12px",
                          letterSpacing: "0.2em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          boxShadow: `0 0 24px ${song.accent}55`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push("/play");
                        }}
                      >
                        Play Now
                      </button>
                    </div>
                  ) : (
                    <LockedSection accent={song.accent} active={isActive} />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation dots */}
        <div style={{ display: "flex", gap: "8px", marginTop: "28px" }}>
          {SONGS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              style={{
                width: i === activeIndex ? "26px" : "8px",
                height: "8px",
                borderRadius: "4px",
                background:
                  i === activeIndex ? "#ff1493" : "rgba(255,20,147,0.2)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)",
                boxShadow: i === activeIndex ? "0 0 10px rgba(255,20,147,0.6)" : "none",
              }}
            />
          ))}
        </div>

        <p
          style={{
            marginTop: "18px",
            fontSize: "10px",
            letterSpacing: "0.3em",
            color: "rgba(255,255,255,0.25)",
            textTransform: "uppercase",
          }}
        >
          swipe to explore
        </p>
      </div>
    </>
  );
}

function LockedSection({ accent, active }: { accent: string; active: boolean }) {
  return (
    <div style={{ textAlign: "center", paddingBottom: "8px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: `${accent}12`,
            border: `1px solid ${accent}35`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: active ? "lockFloat 2.8s ease-in-out infinite" : "none",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: `${accent}18`,
              border: `1px solid ${accent}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: active ? "lockPulse 2.8s ease-in-out infinite" : "none",
            }}
          >
            <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
              <rect x="3" y="10" width="14" height="10" rx="2.5" fill={accent} opacity="0.85" />
              <path
                d="M6 10V7a4 4 0 0 1 8 0v3"
                stroke={accent}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="10" cy="15" r="1.5" fill="#000" opacity="0.5" />
            </svg>
          </div>
        </div>
      </div>

      <p
        style={{
          fontSize: "10px",
          letterSpacing: "0.3em",
          color: accent,
          textTransform: "uppercase",
          opacity: 0.6,
        }}
      >
        Coming Soon
      </p>
    </div>
  );
}
