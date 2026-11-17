// User Input Controller
export class InputController {
  constructor(canvas) {
    this.keys = new Set();
    this.mouse = {
      x: canvas ? canvas.width / 2 : 400,
      y: canvas ? canvas.height / 2 : 300,
      down: false,
    };
    this.active = true;

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        this.keys.add(e.code);
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
          e.preventDefault();
        }
      });

      window.addEventListener('keyup', (e) => {
        this.keys.delete(e.code);
      });

      if (canvas) {
        canvas.addEventListener('mousemove', (e) => {
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          this.mouse.x = (e.clientX - rect.left) * scaleX;
          this.mouse.y = (e.clientY - rect.top) * scaleY;
        });

        canvas.addEventListener('mousedown', () => {
          this.mouse.down = true;
        });

        window.addEventListener('mouseup', () => {
          this.mouse.down = false;
        });
      }
    }
  }

  isDown(code) {
    return this.keys.has(code);
  }

  getMovement() {
    let dx = 0;
    let dy = 0;

    if (this.isDown('KeyW') || this.isDown('ArrowUp')) dy -= 1;
    if (this.isDown('KeyS') || this.isDown('ArrowDown')) dy += 1;
    if (this.isDown('KeyA') || this.isDown('ArrowLeft')) dx -= 1;
    if (this.isDown('KeyD') || this.isDown('ArrowRight')) dx += 1;

    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len;
      dy /= len;
    }
    return { dx, dy };
  }

  isFiring() {
    return this.isDown('Space') || this.mouse.down;
  }

  isEmpTriggered() {
    return this.isDown('KeyB') || this.isDown('KeyE');
  }

  isRestartTriggered() {
    return this.isDown('KeyR') || this.isDown('Enter');
  }
}
