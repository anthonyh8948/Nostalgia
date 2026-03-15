"use client";

import { SignupForm } from "@/components/SignupForm";
import { ParticleBackground } from "@/components/ParticleBackground";
import { GamePreview } from "@/components/GamePreview";
import { useEffect, useState } from "react";

export default function SignupPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating particles */}
      <ParticleBackground />

      {/* Neon radial glow behind card */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(255,20,147,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Game title */}
        <div
          className="mb-8 text-center transition-all duration-700"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(-16px)",
          }}
        >
          <h1
            className="text-4xl font-bold tracking-[0.15em] text-neon uppercase"
            style={{
              textShadow:
                "0 0 20px rgba(255,20,147,0.8), 0 0 60px rgba(255,20,147,0.4)",
            }}
          >
            Tony Haas&apos; Vault
          </h1>
          <div
            className="mx-auto mt-3 h-px w-16 bg-neon"
            style={{ boxShadow: "0 0 8px rgba(255,20,147,0.8)" }}
          />
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-border bg-bg-surface p-10 transition-all duration-700 delay-150"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? "translateY(0)" : "translateY(16px)",
            boxShadow:
              "0 0 0 1px rgba(255,20,147,0.1), 0 24px 48px rgba(0,0,0,0.4)",
          }}
        >
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold tracking-tight text-text">
              Create Your Account
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Sign up to play and unlock exclusive rewards
            </p>
          </div>

          <SignupForm />
        </div>

        {/* Footer hint */}
        <p
          className="mt-6 text-center text-xs text-text-muted transition-all duration-700 delay-300"
          style={{
            opacity: show ? 1 : 0,
          }}
        >
          First 500 winners get discounted concert tickets
        </p>

        {/* Game preview */}
        <div
          className="mt-6 transition-all duration-700 delay-500"
          style={{ opacity: show ? 1 : 0 }}
        >
          <p className="mb-3 text-center text-xs uppercase tracking-[0.2em] text-text-muted">
            Preview
          </p>
          <GamePreview />
        </div>
      </div>
    </div>
  );
}
