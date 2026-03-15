import { GameLoop } from "./GameLoop";
import { InputManager } from "./InputManager";
import { Physics } from "./Physics";
import { Camera } from "./Camera";
import { Renderer } from "./Renderer";
import { CollisionDetector } from "./CollisionDetector";
import { AudioManager } from "./AudioManager";
import { ParticleSystem } from "./ParticleSystem";
import { Player } from "@/entities/Player";
import { SCROLL_SPEED, PLAYER_SIZE, CANVAS_HEIGHT, GROUND_Y, setCanvasSize } from "@/lib/constants";
import type { GameState } from "@/lib/constants";
import level1 from "@/levels/level1.json";

export interface LevelEntity {
  type: string;
  x: number;
  y?: number;
  width?: number;
}

interface GameCallbacks {
  onWin: () => void;
  onDeath: () => void;
  onProgress: (progress: number) => void;
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private loop: GameLoop;
  private input: InputManager;
  private physics: Physics;
  private camera: Camera;
  private renderer: Renderer;
  private collision: CollisionDetector;
  private audio: AudioManager;
  private particles: ParticleSystem;
  private player: Player;
  private callbacks: GameCallbacks;

  private state: GameState = "playing";
  private entities: LevelEntity[] = [];
  private levelEnd = 0;
  private deathFlash = 0;
  private deathPauseTimer = 0;
  private lastReportedProgress = 0;

  // Pipe animation state
  private pipeAnimTimer = 0;
  private pipeAnimDuration = 90; // ~1.5 seconds at 60fps
  private pipeX = 0;
  private winFlash = 0;

  // Jump buffering — remembers press for several frames so it fires on landing
  private jumpBufferTimer = 0;
  private readonly JUMP_BUFFER_FRAMES = 6; // ~100ms at 60fps

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.callbacks = callbacks;

    // Set canvas dimensions before creating subsystems
    setCanvasSize(canvas.width, canvas.height);

    this.input = new InputManager(canvas);
    this.physics = new Physics();
    this.camera = new Camera();
    this.renderer = new Renderer(this.ctx);
    this.collision = new CollisionDetector();
    this.audio = new AudioManager();
    this.particles = new ParticleSystem();
    this.player = new Player();

    this.loop = new GameLoop(
      (dt) => this.update(dt),
      () => this.render()
    );
  }

  async init(): Promise<void> {
    this.input.init();
    this.loadLevel();

    // Try to load audio (will silently fail if no file)
    await this.audio.load(level1.audioSrc);

    this.loop.start();

    // Auto-start the game immediately
    this.state = "playing";
    this.audio.play();
  }

  private loadLevel(): void {
    this.entities = level1.entities as LevelEntity[];

    // Find level end (pipe or portal position)
    const pipe = this.entities.find((e) => e.type === "pipe");
    const portal = this.entities.find((e) => e.type === "portal");
    this.levelEnd = pipe ? pipe.x : portal ? portal.x : 3000;
  }

  private update(_dt: number): void {
    // Pipe entrance animation
    if (this.state === "entering_pipe") {
      this.pipeAnimTimer++;
      const progress = this.pipeAnimTimer / this.pipeAnimDuration;

      // Start fading to white in the last 30%
      if (progress > 0.7) {
        this.winFlash = (progress - 0.7) / 0.3;
      }

      if (this.pipeAnimTimer >= this.pipeAnimDuration) {
        this.win();
      }
      return;
    }

    // Death pause — count down, then reset to idle
    if (this.deathPauseTimer > 0) {
      this.deathPauseTimer--;
      this.deathFlash = Math.max(0, this.deathFlash - 0.05);
      this.particles.update();
      if (this.deathPauseTimer === 0) {
        this.player.reset();
        this.camera.reset();
        this.particles.clear();
        this.physics.resetCoyote();
        this.jumpBufferTimer = 0;
        this.state = "playing";
        this.audio.play();
      }
      return;
    }


    if (this.state !== "playing") return;

    // Handle jump input with buffering
    if (this.input.consumePress()) {
      this.jumpBufferTimer = this.JUMP_BUFFER_FRAMES;
    }

    if (this.jumpBufferTimer > 0) {
      if (this.physics.jump(this.player)) {
        this.jumpBufferTimer = 0; // Jump succeeded, clear buffer
      } else {
        this.jumpBufferTimer--; // Try again next frame
      }
    }

    // Move player forward in world space
    this.player.worldX += SCROLL_SPEED;

    // Apply gravity (gap-aware)
    this.physics.applyGravity(this.player, this.entities);

    // Check platform landings
    for (const entity of this.entities) {
      if (entity.type === "platform" && entity.y !== undefined && entity.width) {
        this.physics.isOnPlatform(
          this.player,
          entity.x,
          entity.y,
          entity.width,
          this.camera.x
        );
      }
    }

    // Update camera
    this.camera.update(this.player.worldX);

    // Update player trail
    this.player.updateTrail();

    // Check collisions
    const playerAABB = this.collision.getPlayerAABB(this.player.x, this.player.y);

    for (const entity of this.entities) {
      const worldX = entity.x;
      const screenX = this.camera.worldToScreen(worldX);

      // Only check nearby entities
      if (Math.abs(screenX - this.player.x) > 200) continue;

      if (entity.type === "spike") {
        const spikeAABB = this.collision.getSpikeAABB(screenX);
        if (this.collision.checkAABB(playerAABB, spikeAABB)) {
          this.die();
          return;
        }
      }

      if (entity.type === "portal") {
        const portalAABB = this.collision.getPortalAABB(screenX);
        if (this.collision.checkAABB(playerAABB, portalAABB)) {
          this.enterPipe(entity.x);
          return;
        }
      }

      if (entity.type === "pipe") {
        // Pipe hitbox — wider and taller than portal
        const pipeAABB = { x: screenX, y: GROUND_Y - 120, width: 80, height: 120 };
        if (this.collision.checkAABB(playerAABB, pipeAABB)) {
          this.enterPipe(entity.x);
          return;
        }
      }
    }

    // Check if player fell off screen
    if (this.player.y + PLAYER_SIZE > CANVAS_HEIGHT + 50) {
      this.die();
      return;
    }

    // Update particles
    this.particles.update();

    // Report progress (throttled)
    const progress = this.player.worldX / this.levelEnd;
    if (Math.abs(progress - this.lastReportedProgress) > 0.01) {
      this.lastReportedProgress = progress;
      this.callbacks.onProgress(progress);
    }
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.drawStars(this.camera);
    this.renderer.drawGrid(this.camera);
    this.renderer.drawGround(this.camera, this.entities);
    this.renderer.drawEntities(this.camera, this.entities);

    if (this.state === "entering_pipe") {
      // Draw the pipe animation — player shrinking into pipe
      const progress = this.pipeAnimTimer / this.pipeAnimDuration;
      const pipeScreenX = this.camera.worldToScreen(this.pipeX);
      this.renderer.drawPipeAnimation(this.player, pipeScreenX, progress);
      this.renderer.drawWinFlash(this.winFlash);
    } else if (this.state !== "idle") {
      this.renderer.drawTrail(this.player.trail);
      this.renderer.drawPlayer(this.player);
    }

    this.renderer.drawParticles(this.particles.particles);
    this.renderer.drawDeathFlash(this.deathFlash);
  }

  private enterPipe(pipeWorldX: number): void {
    this.state = "entering_pipe";
    this.pipeX = pipeWorldX;
    this.pipeAnimTimer = 0;
    this.winFlash = 0;
  }

  private die(): void {
    this.state = "dead";
    this.deathFlash = 0.4;
    this.deathPauseTimer = 55;

    // Dissolve player into colored tiles
    this.particles.dissolve(this.player.x, this.player.y, PLAYER_SIZE);

    this.audio.stop();
    this.audio.playDeathSound();
    this.callbacks.onDeath();
  }

  private win(): void {
    this.state = "won";
    this.audio.stop();
    this.loop.stop();
    this.callbacks.onWin();
  }

  pause(): void {
    if (this.state !== "playing") return;
    this.loop.stop();
    this.audio.pausePlayback();
  }

  resume(): void {
    if (this.state !== "playing") return;
    this.loop.start();
    this.audio.resumePlayback();
  }

  destroy(): void {
    this.loop.stop();
    this.input.destroy();
    this.audio.destroy();
  }
}
