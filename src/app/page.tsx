import Link from "next/link";
import { ParticleBackground } from "@/components/ParticleBackground";
import { GamePreview } from "@/components/GamePreview";

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating particles */}
      <ParticleBackground />

      {/* Neon radial glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255,20,147,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-xl text-center">
        {/* Title */}
        <h1
          className="text-6xl font-bold tracking-tight text-text sm:text-8xl"
          style={{
            textShadow: "0 0 40px rgba(255,20,147,0.3)",
          }}
        >
          Tony&apos;s Vault
        </h1>
        <Link
          href="/signup"
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-neon bg-transparent px-10 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-neon transition-all hover:bg-neon hover:text-bg hover:shadow-[0_0_30px_rgba(255,20,147,0.4)]"
          style={{ boxShadow: "0 0 12px rgba(255,20,147,0.2)" }}
        >
          Play Now
        </Link>

        {/* Game preview */}
        <div className="mt-12">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-text-muted">
            Preview
          </p>
          <GamePreview />
        </div>
      </div>
    </div>
  );
}
