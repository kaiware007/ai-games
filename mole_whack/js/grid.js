export class Grid {
  constructor(canvasWidth, canvasHeight) {
    this.cols = 5;
    this.rows = 5;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // グリッド開始位置とセルサイズ
    this.paddingTop = 120;
    this.paddingLeft = 30;
    this.cellSize = 100;
    this.gap = 10;
  }

  getCell(row, col) {
    const x = this.paddingLeft + col * (this.cellSize + this.gap);
    const y = this.paddingTop + row * (this.cellSize + this.gap);
    return { x, y, w: this.cellSize, h: this.cellSize };
  }

  getRowAt(y) {
    return Math.floor((y - this.paddingTop) / (this.cellSize + this.gap));
  }

  getColAt(x) {
    return Math.floor((x - this.paddingLeft) / (this.cellSize + this.gap));
  }

  getDimensions() {
    return { rows: this.rows, cols: this.cols };
  }
}