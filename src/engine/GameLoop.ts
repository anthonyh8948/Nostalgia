export class GameLoop {
  private running = false;
  private rafId = 0;
  private lastTime = 0;
  private accumulator = 0;
  private readonly fixedDt = 1000 / 60; // 60fps fixed timestep

  private updateFn: (dt: number) => void;
  private renderFn: () => void;

  constructor(updateFn: (dt: number) => void, renderFn: () => void) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.tick(this.lastTime);
  }

  stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private tick = (currentTime: number): void => {
    if (!this.running) return;

    let elapsed = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Clamp large gaps (e.g. tab was in background)
    if (elapsed > 200) elapsed = this.fixedDt;

    this.accumulator += elapsed;

    // Fixed timestep updates
    while (this.accumulator >= this.fixedDt) {
      this.updateFn(this.fixedDt);
      this.accumulator -= this.fixedDt;
    }

    this.renderFn();

    this.rafId = requestAnimationFrame(this.tick);
  };
}
