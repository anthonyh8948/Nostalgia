export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  decay: number;
  color?: string;
}

export class ParticleSystem {
  particles: Particle[] = [];

  // Grid-dissolve: player breaks into tiles that fly apart
  dissolve(x: number, y: number, playerSize: number): void {
    const cols = 5;
    const rows = 5;
    const cellW = playerSize / cols;
    const cellH = playerSize / rows;
    const colors = ["#ffe600", "#ff1493", "#e040fb", "#ffffff", "#ff6ec7"];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const px = x + col * cellW;
        const py = y + row * cellH;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 5;
        this.particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: cellW - 1,
          life: 1,
          decay: 0.018 + Math.random() * 0.022,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    }
  }

  burst(x: number, y: number, count: number = 20): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 2 + Math.random() * 4,
        life: 1,
        decay: 0.02 + Math.random() * 0.03,
      });
    }
  }

  update(): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // mini gravity
      p.life -= p.decay;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  clear(): void {
    this.particles = [];
  }
}
