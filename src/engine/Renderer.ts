import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, PLAYER_SIZE, COLORS } from "@/lib/constants";
import type { Camera } from "./Camera";
import type { Player } from "@/entities/Player";
import type { LevelEntity } from "./Game";
import type { Particle } from "./ParticleSystem";

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private stars: { x: number; y: number; size: number; alpha: number }[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    for (let i = 0; i < 90; i++) {
      this.stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT * 0.75,
        size: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.55 + 0.15,
      });
    }
  }

  clear(): void {
    const grad = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    grad.addColorStop(0, "#0e0018");
    grad.addColorStop(0.55, "#080010");
    grad.addColorStop(1, "#0a0a0a");
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawStars(camera: Camera): void {
    for (const s of this.stars) {
      // Slow parallax — stars drift at 20% of camera speed
      const sx = ((s.x - camera.x * 0.2) % CANVAS_WIDTH + CANVAS_WIDTH) % CANVAS_WIDTH;
      this.ctx.globalAlpha = s.alpha;
      this.ctx.fillStyle = "#ffffff";
      this.ctx.beginPath();
      this.ctx.arc(sx, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
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

      // Ground body with gradient
      const groundGrad = this.ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
      groundGrad.addColorStop(0, "#2a0a2a");
      groundGrad.addColorStop(1, "#120512");
      this.ctx.fillStyle = groundGrad;
      this.ctx.fillRect(screenX, GROUND_Y, width, CANVAS_HEIGHT - GROUND_Y);

      // Ground top glow line
      this.ctx.shadowColor = COLORS.groundLine;
      this.ctx.shadowBlur = 10;
      this.ctx.strokeStyle = COLORS.groundLine;
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.moveTo(screenX, GROUND_Y);
      this.ctx.lineTo(screenX + width, GROUND_Y);
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }
  }

  drawPlayer(player: Player): void {
    const { x, y } = player;
    const cx = x + PLAYER_SIZE / 2;
    const cy = y + PLAYER_SIZE / 2;
    const d = PLAYER_SIZE / 4;

    // Outer glow
    this.ctx.shadowColor = COLORS.playerGlow;
    this.ctx.shadowBlur = 24;

    // Player square
    this.ctx.fillStyle = COLORS.player;
    this.ctx.fillRect(x, y, PLAYER_SIZE, PLAYER_SIZE);

    this.ctx.shadowBlur = 0;

    // White border inset
    this.ctx.strokeStyle = "rgba(255,255,255,0.45)";
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(x + 4, y + 4, PLAYER_SIZE - 8, PLAYER_SIZE - 8);

    // Inner diamond (GD-style)
    this.ctx.fillStyle = "rgba(0,0,0,0.35)";
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - d);
    this.ctx.lineTo(cx + d, cy);
    this.ctx.lineTo(cx, cy + d);
    this.ctx.lineTo(cx - d, cy);
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawSpike(screenX: number, groundY: number): void {
    const size = 30;

    // Glow
    this.ctx.shadowColor = COLORS.spike;
    this.ctx.shadowBlur = 18;

    this.ctx.fillStyle = COLORS.spike;
    this.ctx.beginPath();
    this.ctx.moveTo(screenX, groundY);
    this.ctx.lineTo(screenX + size / 2, groundY - size);
    this.ctx.lineTo(screenX + size, groundY);
    this.ctx.closePath();
    this.ctx.fill();

    // Bright tip highlight
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = "rgba(255,255,255,0.8)";
    this.ctx.beginPath();
    this.ctx.moveTo(screenX + size / 2 - 2, groundY - size + 6);
    this.ctx.lineTo(screenX + size / 2, groundY - size);
    this.ctx.lineTo(screenX + size / 2 + 2, groundY - size + 6);
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

  drawPipe(screenX: number, groundY: number): void {
    const pipeWidth = 80;
    const pipeHeight = 120;
    const pipeY = groundY - pipeHeight;
    const centerX = screenX + pipeWidth / 2;
    const centerY = pipeY + pipeHeight / 2;
    const outerR = pipeWidth / 2 - 8;

    // Outer glow
    this.ctx.shadowColor = COLORS.portalGlow;
    this.ctx.shadowBlur = 30;

    // Pipe body
    this.ctx.fillStyle = "#1a0a1a";
    this.ctx.beginPath();
    this.ctx.roundRect(screenX, pipeY, pipeWidth, pipeHeight, 12);
    this.ctx.fill();

    // Pipe rim
    this.ctx.strokeStyle = COLORS.portal;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.roundRect(screenX, pipeY, pipeWidth, pipeHeight, 12);
    this.ctx.stroke();

    this.ctx.shadowBlur = 0;

    // Inner circular opening
    this.ctx.fillStyle = "#050505";
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY, outerR, outerR, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Inner glow ring
    this.ctx.strokeStyle = "rgba(255, 20, 147, 0.6)";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY, outerR, outerR, 0, 0, Math.PI * 2);
    this.ctx.stroke();
  }

  drawPipeAnimation(player: Player, pipeScreenX: number, progress: number): void {
    const pipeWidth = 80;
    const pipeHeight = 120;
    const pipeCenterX = pipeScreenX + pipeWidth / 2;
    const pipeCenterY = (GROUND_Y - pipeHeight) + pipeHeight / 2;

    // Player shrinks and slides toward pipe center
    const scale = 1 - progress * 0.9;
    const px = player.x + (pipeCenterX - player.x) * progress;
    const py = player.y + (pipeCenterY - player.y) * progress;
    const size = PLAYER_SIZE * scale;

    this.ctx.globalAlpha = 1 - progress * 0.6;
    this.ctx.shadowColor = COLORS.playerGlow;
    this.ctx.shadowBlur = 20 * (1 - progress);
    this.ctx.fillStyle = COLORS.player;
    this.ctx.fillRect(px - size / 2, py - size / 2, size, size);
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1;
  }

  drawWinFlash(progress: number): void {
    if (progress <= 0) return;
    this.ctx.globalAlpha = progress;
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    this.ctx.globalAlpha = 1;
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
          this.drawPlatform(screenX, GROUND_Y - (entity.y || 80), entity.width || 100);
          break;
        case "portal":
          this.drawPortal(screenX, GROUND_Y);
          break;
        case "pipe":
          this.drawPipe(screenX, GROUND_Y);
          break;
      }
    }
  }

  drawParticles(particles: Particle[]): void {
    for (const p of particles) {
      this.ctx.globalAlpha = p.life;
      this.ctx.fillStyle = p.color ?? COLORS.particle;
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
    this.ctx.fillStyle = "#e040fb";
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
