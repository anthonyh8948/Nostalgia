export class AudioManager {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private playing = false;
  private startedAt = 0;
  private pauseOffset = 0;

  async load(url: string): Promise<void> {
    try {
      this.ctx = new AudioContext();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);

      // Unlock AudioContext on first user gesture (needed for desktop Chrome autoplay policy)
      const unlock = () => this.ctx?.resume();
      document.addEventListener("keydown", unlock, { once: true, capture: true });
      document.addEventListener("pointerdown", unlock, { once: true, capture: true });
      document.addEventListener("touchstart", unlock, { once: true, capture: true });

      const response = await fetch(encodeURI(url));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.warn("Audio failed to load:", err);
    }
  }

  play(): void {
    if (!this.ctx || !this.buffer || !this.gainNode) return;

    this.stopSource();

    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = false;
    this.source.connect(this.gainNode);

    const offset = this.pauseOffset;
    this.pauseOffset = 0;
    this.playing = true;

    const doStart = () => {
      if (!this.source || !this.ctx) return;
      this.source.start(0, offset);
      this.startedAt = this.ctx.currentTime - offset;
    };

    if (this.ctx.state === "suspended") {
      this.ctx.resume().then(doStart);
    } else {
      doStart();
    }
  }

  private stopSource(): void {
    if (this.source) {
      try { this.source.stop(); } catch { /* already stopped */ }
      this.source.disconnect();
      this.source = null;
      this.playing = false;
    }
  }

  stop(): void {
    this.stopSource();
    this.pauseOffset = 0;
    this.startedAt = 0;
  }

  pausePlayback(): void {
    if (!this.playing || !this.ctx) return;
    const savedOffset = this.ctx.currentTime - this.startedAt;
    this.stopSource();
    this.pauseOffset = savedOffset;
  }

  resumePlayback(): void {
    this.play();
  }

  playCollectSound(): void {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;
    ([523, 659, 784] as number[]).forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = now + i * 0.07;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  playDeathSound(): void {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.28);
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.type = "square";
    osc2.frequency.setValueAtTime(900, now);
    osc2.frequency.exponentialRampToValueAtTime(250, now + 0.12);
    gain2.gain.setValueAtTime(0.25, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc2.start(now);
    osc2.stop(now + 0.14);
  }

  isLoaded(): boolean {
    return this.buffer !== null;
  }

  destroy(): void {
    this.stopSource();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.buffer = null;
  }
}
