import { PLAYER_SIZE, GROUND_Y, CANVAS_WIDTH } from "@/lib/constants";
import type { PhysicsBody } from "@/engine/Physics";

export class Player implements PhysicsBody {
  x: number;
  y: number;
  vy = 0;
  onGround = true;
  worldX = 0; // actual position in world space

  // Trail history
  trail: { x: number; y: number; alpha: number }[] = [];

  constructor() {
    this.x = Math.round(CANVAS_WIDTH * 0.25);
    this.y = GROUND_Y - PLAYER_SIZE;
    this.worldX = 0;
  }

  updateTrail(): void {
    this.trail.unshift({ x: this.x, y: this.y, alpha: 0.3 });
    if (this.trail.length > 8) {
      this.trail.pop();
    }
    // Fade trail
    for (let i = 0; i < this.trail.length; i++) {
      this.trail[i].alpha = 0.3 * (1 - i / this.trail.length);
    }
  }

  reset(): void {
    this.x = Math.round(CANVAS_WIDTH * 0.25);
    this.y = GROUND_Y - PLAYER_SIZE;
    this.vy = 0;
    this.onGround = true;
    this.worldX = 0;
    this.trail = [];
  }
}
