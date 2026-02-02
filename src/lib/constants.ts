// Physics
export const GRAVITY = 0.8;
export const JUMP_VELOCITY = -12;
export const SCROLL_SPEED = 8;
export const PLAYER_SIZE = 40;
export const GROUND_Y = 360; // ground surface Y position (from top)

// Canvas
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

// Colors
export const COLORS = {
  bg: "#0a0a0a",
  ground: "#1a1a1a",
  groundLine: "#222222",
  player: "#00e5ff",
  playerGlow: "rgba(0, 229, 255, 0.4)",
  spike: "#f5f5f5",
  platform: "#333333",
  portal: "#00ff88",
  portalGlow: "rgba(0, 255, 136, 0.4)",
  particle: "#00e5ff",
  trail: "rgba(0, 229, 255, 0.15)",
  gridLine: "rgba(255, 255, 255, 0.03)",
  progressBg: "#1a1a1a",
  progressFill: "#00e5ff",
  text: "#f5f5f5",
  textMuted: "#888888",
} as const;

// Game states
export type GameState = "idle" | "playing" | "dead" | "won";

// Coupon code (placeholder)
export const COUPON_CODE = "NOSTALGIA500";
