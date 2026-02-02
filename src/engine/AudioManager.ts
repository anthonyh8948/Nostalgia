export class AudioManager {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private loaded = false;
  private playing = false;

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
    this.source.start(0);
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
