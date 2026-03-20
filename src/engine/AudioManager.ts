export class AudioManager {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private rawBytes: Uint8Array | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private playing = false;
  private startedAt = 0;
  private pauseOffset = 0;

  async load(url: string): Promise<void> {
    try {
      const response = await fetch(encodeURI(url));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      // Store raw bytes so we can decode after AudioContext is created
      this.rawBytes = new Uint8Array(await response.arrayBuffer());
    } catch (err) {
      console.warn("Audio failed to load:", err);
      this.rawBytes = null;
    }
  }

  async play(): Promise<void> {
    if (!this.rawBytes) return;

    // Create AudioContext during user gesture so it starts unlocked
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
    }

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    // Decode if not yet done (first play)
    if (!this.buffer) {
      try {
        // slice() clones the buffer so decodeAudioData doesn't detach it
        this.buffer = await this.ctx.decodeAudioData(this.rawBytes.buffer.slice(0) as ArrayBuffer);
      } catch (err) {
        console.warn("Audio decode failed:", err);
        return;
      }
    }

    this.stop();

    this.source = this.ctx.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;
    this.source.connect(this.gainNode!);
    this.source.start(0, this.pauseOffset);
    this.startedAt = this.ctx.currentTime - this.pauseOffset;
    this.pauseOffset = 0;
    this.playing = true;
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
    return this.rawBytes !== null;
  }

  destroy(): void {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.buffer = null;
  }
}
