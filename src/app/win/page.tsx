"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COUPON_CODE } from "@/lib/constants";

export default function WinPage() {
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("nostalgia_user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserName(parsed.firstName || "");
    }
  }, []);

  const copyCode = async () => {
    await navigator.clipboard.writeText(COUPON_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 text-center">
        <div className="text-5xl">&#127881;</div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight text-text sm:text-5xl">
          {userName ? `${userName}, You Won!` : "You Won!"}
        </h1>
        <p className="mt-4 text-lg text-text-muted">
          Here&apos;s your exclusive discount code for concert tickets
        </p>

        <button
          onClick={copyCode}
          className="mt-10 inline-flex items-center gap-3 rounded-lg border border-neon bg-bg-surface px-8 py-4 font-mono text-2xl font-bold tracking-[0.15em] text-neon transition-all hover:bg-neon hover:text-bg"
        >
          {COUPON_CODE}
          <span className="text-sm font-normal">
            {copied ? "Copied!" : "Click to copy"}
          </span>
        </button>

        <p className="mt-6 text-sm text-text-muted">
          Use this code at checkout for discounted tickets
        </p>

        <Link
          href="/"
          className="mt-10 inline-block text-sm text-text-muted underline underline-offset-4 transition-colors hover:text-neon"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
