import { GRAVITY, JUMP_VELOCITY, GROUND_Y, PLAYER_SIZE } from "@/lib/constants";
import type { LevelEntity } from "./Game";

export interface PhysicsBody {
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
  worldX: number;
}

export class Physics {
  // Coyote time — grace frames after walking off a ledge
  private coyoteTimer = 0;
  private readonly COYOTE_FRAMES = 5; // ~83ms at 60fps

  applyGravity(body: PhysicsBody, entities: LevelEntity[]): void {
    const wasOnGround = body.onGround;

    body.vy += GRAVITY;
    body.y += body.vy;

    const groundSurface = GROUND_Y - PLAYER_SIZE;
    const hasGround = this.isOverGround(body.worldX, entities);

    if (hasGround && body.y >= groundSurface && body.vy >= 0) {
      body.y = groundSurface;
      body.vy = 0;
      body.onGround = true;
      this.coyoteTimer = this.COYOTE_FRAMES;
    } else if (!hasGround || body.y < groundSurface) {
      body.onGround = false;
    }

    // Track coyote time — if player just left ground by falling (not jumping)
    if (wasOnGround && !body.onGround && body.vy > 0) {
      this.coyoteTimer = this.COYOTE_FRAMES;
    }
    if (this.coyoteTimer > 0 && !body.onGround) {
      this.coyoteTimer--;
    }
  }

  private isOverGround(worldX: number, entities: LevelEntity[]): boolean {
    const center = worldX + PLAYER_SIZE / 2;
    for (const entity of entities) {
      if (entity.type !== "ground") continue;
      const end = entity.x + (entity.width || 200);
      if (center >= entity.x && center <= end) {
        return true;
      }
    }
    return false;
  }

  jump(body: PhysicsBody): boolean {
    if (body.onGround || this.coyoteTimer > 0) {
      body.vy = JUMP_VELOCITY;
      body.onGround = false;
      this.coyoteTimer = 0;
      return true;
    }
    return false;
  }

  resetCoyote(): void {
    this.coyoteTimer = 0;
  }

  isOnPlatform(body: PhysicsBody, platX: number, platYOffset: number, platWidth: number, cameraX: number): boolean {
    const playerLeft = body.x;
    const playerRight = body.x + PLAYER_SIZE;
    const playerBottom = body.y + PLAYER_SIZE;
    const relPlatX = platX - cameraX;
    const platSurfaceY = GROUND_Y - platYOffset;

    if (
      playerRight > relPlatX &&
      playerLeft < relPlatX + platWidth &&
      playerBottom >= platSurfaceY &&
      playerBottom <= platSurfaceY + Math.abs(body.vy) + 15 &&
      body.vy >= 0
    ) {
      body.y = platSurfaceY - PLAYER_SIZE;
      body.vy = 0;
      body.onGround = true;
      return true;
    }
    return false;
  }
}
