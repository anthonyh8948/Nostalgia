import { CANVAS_WIDTH } from "@/lib/constants";

export class Camera {
  x = 0;

  update(playerWorldX: number): void {
    // Camera follows so player is at ~25% of screen width
    this.x = playerWorldX - CANVAS_WIDTH * 0.25;
    if (this.x < 0) this.x = 0;
  }

  reset(): void {
    this.x = 0;
  }

  worldToScreen(worldX: number): number {
    return worldX - this.x;
  }
}
