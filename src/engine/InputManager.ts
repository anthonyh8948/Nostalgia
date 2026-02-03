export class InputManager {
  private justPressed = false;
  private held = false;
  private canvas: HTMLCanvasElement;

  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;
  private onMouseDown: () => void;
  private onMouseUp: () => void;
  private onTouchStart: (e: TouchEvent) => void;
  private onTouchEnd: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!e.repeat && !this.held) {
          this.justPressed = true;
        }
        this.held = true;
      }
    };

    this.onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        this.held = false;
      }
    };

    this.onMouseDown = () => {
      if (!this.held) {
        this.justPressed = true;
      }
      this.held = true;
    };

    this.onMouseUp = () => {
      this.held = false;
    };

    this.onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      if (!this.held) {
        this.justPressed = true;
      }
      this.held = true;
    };

    this.onTouchEnd = () => {
      this.held = false;
    };
  }

  init() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    this.canvas.addEventListener("mousedown", this.onMouseDown);
    this.canvas.addEventListener("mouseup", this.onMouseUp);
    this.canvas.addEventListener("touchstart", this.onTouchStart, { passive: false });
    this.canvas.addEventListener("touchend", this.onTouchEnd);
  }

  consumePress(): boolean {
    if (this.justPressed) {
      this.justPressed = false;
      return true;
    }
    return false;
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.removeEventListener("mousedown", this.onMouseDown);
    this.canvas.removeEventListener("mouseup", this.onMouseUp);
    this.canvas.removeEventListener("touchstart", this.onTouchStart);
    this.canvas.removeEventListener("touchend", this.onTouchEnd);
  }
}
