import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, PLAYER_SIZE, COLORS } from "@/lib/constants";
import type { Camera } from "./Camera";
import type { Player } from "@/entities/Player";
import type { LevelEntity } from "./Game";
import type { Particle } from "./ParticleSystem";

export class Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  clear(): void {
    this.ctx.fillStyle = COLORS.bg;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawGrid(camera: Camera): void {
    const spacing = 60;
    const offsetX = camera.x % spacing;

    this.ctx.strokeStyle = COLORS.gridLine;
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let x = -offsetX; x < CANVAS_WIDTH; x += spacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, CANVAS_HEIGHT);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < CANVAS_HEIGHT; y += spacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(CANVAS_WIDTH, y);
      this.ctx.stroke();
    }
  }

  drawGround(camera: Camera, entities: LevelEntity[]): void {
    for (const entity of entities) {
      if (entity.type !== "ground") continue;

      const screenX = camera.worldToScreen(entity.x);
      const width = entity.width || 200;

      // Skip if off screen
      if (screenX + width < 0 || screenX > CANVAS_WIDTH) continue;

      // Ground body
      this.ctx.fillStyle = COLORS.ground;
      this.ctx.fillRect(screenX, GROUND_Y, width, CANVAS_HEIGHT - GROUND_Y);

      // Ground top line
      this.ctx.strokeStyle = COLORS.groundLine;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, GROUND_Y);
      this.ctx.lineTo(screenX + width, GROUND_Y);
      this.ctx.stroke();
    }
  }

  drawPlayer(player: Player): void {
    const { x, y } = player;

    // Glow
    this.ctx.shadowColor = COLORS.playerGlow;
    this.ctx.shadowBlur = 15;

    // Player square
    this.ctx.fillStyle = COLORS.player;
    this.ctx.fillRect(x, y, PLAYER_SIZE, PLAYER_SIZE);

    // Reset shadow
    this.ctx.shadowBlur = 0;

    // Inner highlight
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    this.ctx.fillRect(x + 4, y + 4, PLAYER_SIZE - 8, PLAYER_SIZE - 8);
  }

  drawSpike(screenX: number, groundY: number): void {
    const size = 30;
    this.ctx.fillStyle = COLORS.spike;
    this.ctx.beginPath();
    this.ctx.moveTo(screenX, groundY);
    this.ctx.lineTo(screenX + size / 2, groundY - size);
    this.ctx.lineTo(screenX + size, groundY);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawPlatform(screenX: number, y: number, width: number): void {
    this.ctx.fillStyle = COLORS.platform;
    this.ctx.fillRect(screenX, y, width, 15);

    // Top edge
    this.ctx.strokeStyle = COLORS.groundLine;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(screenX, y);
    this.ctx.lineTo(screenX + width, y);
    this.ctx.stroke();
  }

  drawPortal(screenX: number, groundY: number): void {
    const width = 20;
    const height = 60;
    const portalY = groundY - height;

    // Glow
    this.ctx.shadowColor = COLORS.portalGlow;
    this.ctx.shadowBlur = 20;

    this.ctx.fillStyle = COLORS.portal;
    this.ctx.fillRect(screenX, portalY, width, height);

    this.ctx.shadowBlur = 0;

    // Inner pulse
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    this.ctx.fillRect(screenX + 4, portalY + 4, width - 8, height - 8);
  }

  drawEntities(camera: Camera, entities: LevelEntity[]): void {
    for (const entity of entities) {
      const screenX = camera.worldToScreen(entity.x);

      // Cull off-screen
      const maxWidth = entity.width || 200;
      if (screenX + maxWidth < -50 || screenX > CANVAS_WIDTH + 50) continue;

      switch (entity.type) {
        case "spike":
          this.drawSpike(screenX, GROUND_Y);
          break;
        case "platform":
          this.drawPlatform(screenX, entity.y || 280, entity.width || 100);
          break;
        case "portal":
          this.drawPortal(screenX, GROUND_Y);
          break;
      }
    }
  }

  drawParticles(particles: Particle[]): void {
    for (const p of particles) {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = COLORS.particle;
      this.ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    this.ctx.globalAlpha = 1;
  }

  drawTrail(trail: { x: number; y: number; alpha: number }[]): void {
    for (const t of trail) {
      this.ctx.globalAlpha = t.alpha;
      this.ctx.fillStyle = COLORS.trail;
      this.ctx.fillRect(t.x, t.y, PLAYER_SIZE, PLAYER_SIZE);
    }
    this.ctx.globalAlpha = 1;
  }

  drawDeathFlash(alpha: number): void {
    if (alpha <= 0) return;
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = "#ff3366";
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.globalAlpha = 1;
  }

  drawStartMessage(): void {
    this.ctx.fillStyle = COLORS.text;
    this.ctx.font = "bold 24px var(--font-geist), system-ui, sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.fillText("TAP or SPACE to start", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.ctx.textAlign = "left";
  }
}
