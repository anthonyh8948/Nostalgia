"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COUPON_CODE } from "@/lib/constants";
import { BackButton } from "@/components/BackButton";

export default function WinPage() {
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState("");
  const [show, setShow] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("nostalgia_user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserName(parsed.username || "");

      // Fire-and-forget winner log to Supabase
      fetch("/api/winner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: parsed.phone }),
      }).catch(() => {});
    }
    // Stagger the animations
    requestAnimationFrame(() => setShow(true));
    const timer = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const copyCode = async () => {
    await navigator.clipboard.writeText(COUPON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <BackButton href="/menu" />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 text-center">
        {/* Animated congratulations text */}
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
          className="mt-2 text-2xl font-semibold tracking-tight text-neon transition-all duration-700 delay-500"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(20px)",
          }}
        >
          You won!
        </p>

        {/* Content fades in after the title */}
        <div
          className="transition-all duration-700"
          style={{
            opacity: showContent ? 1 : 0,
            transform: showContent ? "translateY(0)" : "translateY(30px)",
          }}
        >
          <p className="mt-8 text-lg text-text-muted">
            Here&apos;s your exclusive discount code for concert tickets
          </p>

          <button
            onClick={copyCode}
            className="mt-8 inline-flex items-center gap-3 rounded-lg border border-neon bg-bg-surface px-8 py-4 font-mono text-2xl font-bold tracking-[0.15em] text-neon transition-all hover:bg-neon hover:text-bg hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]"
          >
            {COUPON_CODE}
            <span className="text-sm font-normal">
              {copied ? "Copied!" : "Click to copy"}
            </span>
          </button>

          <p className="mt-6 text-sm text-text-muted">
            Use this code at checkout for discounted tickets
          </p>

          <div className="mt-10 flex items-center justify-center gap-6">
            <Link
              href="/play"
              className="text-sm font-medium text-neon underline underline-offset-4 transition-colors hover:text-text"
            >
              Play again
            </Link>
            <Link
              href="/"
              className="text-sm text-text-muted underline underline-offset-4 transition-colors hover:text-neon"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
