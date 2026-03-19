"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  href?: string;
}

export function BackButton({ href }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) router.push(href);
    else router.back();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed left-4 top-4 z-20 flex items-center gap-2 rounded-sm border border-border bg-bg-surface px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted transition-all hover:border-neon hover:text-text"
      style={{ boxShadow: "0 0 0 1px rgba(255,20,147,0)" }}
      aria-label="Go back"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}
