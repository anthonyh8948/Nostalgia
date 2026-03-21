// Physics
export const GRAVITY = 0.8;
export const JUMP_VELOCITY = -12;
export const PLAYER_SIZE = 40;
// Canvas — mutable, set by Game from actual canvas size
export let CANVAS_WIDTH = 1120;
export let CANVAS_HEIGHT = 630;
export let GROUND_Y = 504;

export function setCanvasSize(w: number, h: number) {
  CANVAS_WIDTH = w;
  CANVAS_HEIGHT = h;
  GROUND_Y = Math.floor(h * 0.8);
}

// Colors — hot pink / purple / magenta with yellow player
export const COLORS = {
  bg: "#0a0a0a",
  ground: "#1a0a1a",
  groundLine: "#ff1493",
  player: "#ffe600",
  playerGlow: "rgba(255, 230, 0, 0.5)",
  spike: "#e040fb",
  platform: "#2a0a2a",
  portal: "#ff1493",
  portalGlow: "rgba(255, 20, 147, 0.5)",
  particle: "#ffe600",
  trail: "rgba(255, 230, 0, 0.15)",
  gridLine: "rgba(180, 0, 180, 0.06)",
  progressBg: "#1a0a1a",
  progressFill: "#ff1493",
  text: "#f5f5f5",
  textMuted: "#888888",
} as const;

// Game states
export type GameState = "idle" | "playing" | "dead" | "entering_pipe" | "entering_box" | "won";

// Coupon code (placeholder)
export const COUPON_CODE = "NOSTALGIA500";
