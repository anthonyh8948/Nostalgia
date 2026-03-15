import { PLAYER_SIZE, GROUND_Y } from "@/lib/constants";

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class CollisionDetector {
  checkAABB(a: AABB, b: AABB): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  getPlayerAABB(playerX: number, playerY: number): AABB {
    const margin = 4;
    return {
      x: playerX + margin,
      y: playerY + margin,
      width: PLAYER_SIZE - margin * 2,
      height: PLAYER_SIZE - margin * 2,
    };
  }

  getSpikeAABB(screenX: number): AABB {
    const size = 30;
    return {
      x: screenX + 6,
      y: GROUND_Y - size + 6,
      width: size - 12,
      height: size - 6,
    };
  }

  getPortalAABB(screenX: number): AABB {
    return {
      x: screenX,
      y: GROUND_Y - 60,
      width: 20,
      height: 60,
    };
  }

  getPeachAABB(screenX: number, heightAboveGround: number): AABB {
    const size = 28;
    return {
      x: screenX - size / 2,
      y: GROUND_Y - heightAboveGround - size / 2,
      width: size,
      height: size,
    };
  }
}
