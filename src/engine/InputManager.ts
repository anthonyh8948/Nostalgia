export class InputManager {
  private pressed = false;
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
        this.pressed = true;
      }
    };

    this.onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        this.pressed = false;
      }
    };

    this.onMouseDown = () => {
      this.pressed = true;
    };

    this.onMouseUp = () => {
      this.pressed = false;
    };

    this.onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      this.pressed = true;
    };

    this.onTouchEnd = () => {
      this.pressed = false;
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

  isPressed(): boolean {
    return this.pressed;
  }

  consumePress(): boolean {
    if (this.pressed) {
      this.pressed = false;
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
