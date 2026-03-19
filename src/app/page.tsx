import Link from "next/link";
import { StarField } from "@/components/StarField";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6">

      {/* Sky gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: "linear-gradient(180deg, #0e0018 0%, #080010 55%, #0a0a0a 100%)" }}
      />

      {/* Stars */}
      <StarField />

      {/* Grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating geometry */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div style={{ position: "absolute", top: "8%", right: "7%", width: 200, height: 200, border: "1px solid rgba(255,20,147,0.08)", "--r": "45deg", animation: "floatGeo 13s ease-in-out infinite" } as React.CSSProperties} />
        <div style={{ position: "absolute", top: "calc(8% + 30px)", right: "calc(7% + 30px)", width: 140, height: 140, border: "1px solid rgba(255,20,147,0.04)", "--r": "45deg", animation: "floatGeo 13s ease-in-out infinite 0.4s" } as React.CSSProperties} />
        <div style={{ position: "absolute", bottom: "12%", left: "5%", width: 150, height: 150, border: "1px solid rgba(255,20,147,0.07)", "--r": "45deg", animation: "floatGeoCCW 10s ease-in-out infinite 1.5s" } as React.CSSProperties} />
        <div style={{ position: "absolute", top: "18%", left: "10%", width: 70, height: 70, border: "1px solid rgba(255,255,255,0.05)", "--r": "22deg", animation: "floatGeo 8s ease-in-out infinite 3s" } as React.CSSProperties} />
        <div style={{ position: "absolute", bottom: "22%", right: "12%", width: 90, height: 90, border: "1px solid rgba(255,20,147,0.06)", "--r": "45deg", animation: "floatGeoCCW 9s ease-in-out infinite 0.8s" } as React.CSSProperties} />
        <div style={{ position: "absolute", top: "55%", left: "3%", width: 40, height: 40, border: "1px solid rgba(255,255,255,0.04)", "--r": "15deg", animation: "floatGeo 7s ease-in-out infinite 2s" } as React.CSSProperties} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <h1
          className="text-[80px] font-bold leading-[0.9] tracking-[-0.03em] text-white sm:text-[120px]"
          style={{ textShadow: "0 0 120px rgba(255,20,147,0.18)" }}
        >
          Tony&apos;s<br />Vault
        </h1>

        <div className="mt-14">
          <Link
            href="/signup"
            className="btn-vault inline-flex items-center gap-4 rounded-sm px-14 py-5 text-[11px] font-bold uppercase tracking-[0.28em]"
          >
            Enter the Vault
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="btn-vault-arrow">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}
