import { GameLoop } from "./GameLoop";
import { InputManager } from "./InputManager";
import { Physics } from "./Physics";
import { Camera } from "./Camera";
import { Renderer } from "./Renderer";
import { CollisionDetector } from "./CollisionDetector";
import { AudioManager } from "./AudioManager";
import { ParticleSystem } from "./ParticleSystem";
import { Player } from "@/entities/Player";
import { SCROLL_SPEED, GROUND_Y, PLAYER_SIZE, CANVAS_HEIGHT } from "@/lib/constants";
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

  private state: GameState = "idle";
  private entities: LevelEntity[] = [];
  private levelEnd = 0;
  private deathFlash = 0;
  private deathPauseTimer = 0;

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.callbacks = callbacks;

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
  }

  private loadLevel(): void {
    this.entities = level1.entities as LevelEntity[];

    // Find level end (portal position)
    const portal = this.entities.find((e) => e.type === "portal");
    this.levelEnd = portal ? portal.x : 3000;
  }

  private update(_dt: number): void {
    // Death pause
    if (this.deathPauseTimer > 0) {
      this.deathPauseTimer--;
      this.deathFlash = Math.max(0, this.deathFlash - 0.05);
      this.particles.update();
      return;
    }

    // Idle state — waiting for first input
    if (this.state === "idle") {
      if (this.input.consumePress()) {
        this.state = "playing";
        this.audio.play();
        this.physics.jump(this.player);
      }
      return;
    }

    if (this.state !== "playing") return;

    // Handle jump input
    if (this.input.consumePress()) {
      this.physics.jump(this.player);
    }

    // Move player forward in world space
    this.player.worldX += SCROLL_SPEED;

    // Apply gravity
    this.physics.applyGravity(this.player);

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
          this.win();
          return;
        }
      }
    }

    // Check if player fell into gap
    if (this.collision.isInGap(this.player.worldX, this.entities)) {
      // Player falls if no ground beneath them
      if (this.player.y + PLAYER_SIZE > CANVAS_HEIGHT + 50) {
        this.die();
        return;
      }
      // Allow falling by not clamping to ground
      this.player.onGround = false;
    }

    // Update particles
    this.particles.update();

    // Report progress
    const progress = this.player.worldX / this.levelEnd;
    this.callbacks.onProgress(progress);
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.drawGrid(this.camera);
    this.renderer.drawGround(this.camera, this.entities);
    this.renderer.drawEntities(this.camera, this.entities);

    if (this.state !== "idle") {
      this.renderer.drawTrail(this.player.trail);
      this.renderer.drawPlayer(this.player);
    }

    this.renderer.drawParticles(this.particles.particles);
    this.renderer.drawDeathFlash(this.deathFlash);

    if (this.state === "idle") {
      this.renderer.drawStartMessage();
    }
  }

  private die(): void {
    this.state = "dead";
    this.deathFlash = 0.4;
    this.deathPauseTimer = 40; // ~0.66 seconds pause

    // Burst particles at player position
    this.particles.burst(
      this.player.x + PLAYER_SIZE / 2,
      this.player.y + PLAYER_SIZE / 2,
      25
    );

    this.audio.stop();
    this.callbacks.onDeath();

    // Reset after pause
    setTimeout(() => {
      this.player.reset();
      this.camera.reset();
      this.particles.clear();
      this.state = "idle";
    }, 700);
  }

  private win(): void {
    this.state = "won";
    this.audio.stop();
    this.loop.stop();
    this.callbacks.onWin();
  }

  destroy(): void {
    this.loop.stop();
    this.input.destroy();
    this.audio.destroy();
  }
}
