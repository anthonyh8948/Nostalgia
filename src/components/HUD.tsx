"use client";

interface HUDProps {
  progress: number;
  attempts: number;
}

export function HUD({ progress, attempts }: HUDProps) {
  return (
    <div className="mb-4 flex w-full max-w-[800px] items-center gap-4 px-4">
      {/* Progress bar */}
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-surface">
        <div
          className="h-full rounded-full bg-neon transition-all duration-150"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>

      {/* Attempt counter */}
      <span className="font-mono text-xs text-text-muted">
        Attempt {attempts + 1}
      </span>
    </div>
  );
}
