import Link from "next/link";

export default function LandingPage() {
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

      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold tracking-tight text-text sm:text-8xl">
          NOSTALGIA
        </h1>
        <p className="mt-4 text-lg text-text-muted sm:text-xl">
          Play the beat. Hear the music first.
        </p>

        <Link
          href="/signup"
          className="mt-12 inline-flex items-center gap-2 rounded-full border border-neon bg-transparent px-10 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-neon transition-all hover:bg-neon hover:text-bg hover:shadow-[0_0_30px_rgba(0,229,255,0.3)]"
        >
          Play Now
        </Link>

        <p className="mt-6 text-xs text-text-muted">
          First 500 winners get discounted concert tickets
        </p>
      </div>
    </div>
  );
}
