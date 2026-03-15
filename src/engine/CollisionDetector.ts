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
    // Slightly shrink hitbox for fairness
    const margin = 4;
    return {
      x: playerX + margin,
      y: playerY + margin,
      width: PLAYER_SIZE - margin * 2,
      height: PLAYER_SIZE - margin * 2,
    };
  }

  getSpikeAABB(worldX: number): AABB {
    const size = 30;
    // Triangle approximated as a narrower box
    return {
      x: worldX + 6,
      y: GROUND_Y - size + 6,
      width: size - 12,
      height: size - 6,
    };
  }

  getPortalAABB(worldX: number): AABB {
    return {
      x: worldX,
      y: GROUND_Y - 60,
      width: 20,
      height: 60,
    };
  }

  getPlatformAABB(worldX: number, y: number, width: number): AABB {
    return {
      x: worldX,
      y: y,
      width: width,
      height: 15,
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

  // Check if player fell into a gap (no ground beneath)
  isInGap(playerWorldX: number, entities: { type: string; x: number; width?: number }[]): boolean {
    const playerCenter = playerWorldX + PLAYER_SIZE / 2;

    for (const entity of entities) {
      if (entity.type !== "ground") continue;
      const groundEnd = entity.x + (entity.width || 200);
      if (playerCenter >= entity.x && playerCenter <= groundEnd) {
        return false; // Player is over ground
      }
    }
    return true; // No ground found under player
  }
}
