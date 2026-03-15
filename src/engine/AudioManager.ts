export class AudioManager {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private loaded = false;
  private playing = false;
  private startedAt = 0;
  private pauseOffset = 0;

  async load(url: string): Promise<void> {
    try {
      this.ctx = new AudioContext();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      this.buffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.loaded = true;
    } catch (err) {
      console.warn("Audio failed to load:", err);
      this.loaded = false;
    }
  }

  play(): void {
    if (!this.ctx || !this.buffer || !this.gainNode) return;

    // Resume context if suspended (autoplay policy)
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.stop();

    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect(this.gainNode);
    this.source.start(0, this.pauseOffset);
    this.startedAt = this.ctx.currentTime - this.pauseOffset;
    this.pauseOffset = 0;
    this.playing = true;

    this.source.onended = () => {
      this.playing = false;
    };
  }

  stop(): void {
    if (this.source && this.playing) {
      try {
        this.source.stop();
      } catch {
        // Already stopped
      }
      this.source.disconnect();
      this.source = null;
      this.playing = false;
    }
    this.pauseOffset = 0;
    this.startedAt = 0;
  }

  pausePlayback(): void {
    if (!this.playing || !this.ctx) return;
    const savedOffset = this.ctx.currentTime - this.startedAt;
    if (this.source) {
      try { this.source.stop(); } catch { /* already stopped */ }
      this.source.disconnect();
      this.source = null;
    }
    this.playing = false;
    this.pauseOffset = savedOffset;
  }

  resumePlayback(): void {
    // play() will consume this.pauseOffset
    this.play();
  }

  playCollectSound(): void {
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const now = this.ctx.currentTime;
    // Ascending major arpeggio: C5 → E5 → G5
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

    // Main descending buzz
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

    // High sharp accent
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
    return this.loaded;
  }

  destroy(): void {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
