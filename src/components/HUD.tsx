"use client";

interface HUDProps {
  progress: number;
  attempts: number;
  peachCount: number;
  totalPeaches: number;
}

export function HUD({ progress, attempts, peachCount, totalPeaches }: HUDProps) {
  return (
    <div className="flex w-full items-center gap-4">
      {/* Progress bar */}
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-surface">
        <div
          className="h-full rounded-full bg-neon transition-all duration-150"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>

      {/* Peach collectibles */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: totalPeaches }).map((_, i) => (
          <span
            key={i}
            style={{
              fontSize: "14px",
              opacity: i < peachCount ? 1 : 0.2,
              filter: i < peachCount ? "drop-shadow(0 0 4px rgba(255,160,60,0.8))" : "none",
              transition: "opacity 0.2s, filter 0.2s",
            }}
          >
            🍑
          </span>
        ))}
      </div>

      {/* Attempt counter */}
      <span className="font-mono text-xs text-text-muted">
        Attempt {attempts + 1}
      </span>
    </div>
  );
}
