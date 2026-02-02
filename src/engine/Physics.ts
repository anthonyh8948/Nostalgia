import { GRAVITY, JUMP_VELOCITY, GROUND_Y, PLAYER_SIZE } from "@/lib/constants";

export interface PhysicsBody {
  x: number;
  y: number;
  vy: number;
  onGround: boolean;
}

export class Physics {
  applyGravity(body: PhysicsBody): void {
    body.vy += GRAVITY;
    body.y += body.vy;

    // Ground collision
    const groundSurface = GROUND_Y - PLAYER_SIZE;
    if (body.y >= groundSurface) {
      body.y = groundSurface;
      body.vy = 0;
      body.onGround = true;
    } else {
      body.onGround = false;
    }
  }

  jump(body: PhysicsBody): boolean {
    if (body.onGround) {
      body.vy = JUMP_VELOCITY;
      body.onGround = false;
      return true;
    }
    return false;
  }

  isOnPlatform(body: PhysicsBody, platX: number, platY: number, platWidth: number, cameraX: number): boolean {
    const playerLeft = body.x;
    const playerRight = body.x + PLAYER_SIZE;
    const playerBottom = body.y + PLAYER_SIZE;
    const relPlatX = platX - cameraX;

    // Player is above the platform and falling onto it
    if (
      playerRight > relPlatX &&
      playerLeft < relPlatX + platWidth &&
      playerBottom >= platY &&
      playerBottom <= platY + 10 &&
      body.vy >= 0
    ) {
      body.y = platY - PLAYER_SIZE;
      body.vy = 0;
      body.onGround = true;
      return true;
    }
    return false;
  }
}
