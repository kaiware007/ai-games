export class InputManager {
  constructor(canvas) {
    this.click = null;
    this.canvas = canvas;

    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      this.click = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    });
  }

  getClick() {
    return this.click;
  }

  clearClick() {
    this.click = null;
  }

  contains(x, y) {
    if (!this.click) return false;
    const dx = this.click.x - x;
    const dy = this.click.y - y;
    return dx * dx + dy * dy < 25; // 5px radius
  }
}