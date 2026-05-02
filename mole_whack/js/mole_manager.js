import { Mole, MOLE_TYPES } from './mole.js?v=1777717899';

export class MoleManager {
  constructor(grid, gameDuration, ultraRareCount) {
    this.grid = grid;
    this.gameDuration = gameDuration;
    this.ultraRareCount = ultraRareCount;
    this.activeMoles = []; // { row, col, mole(Mole), timer, maxTimer }
    this.spawnTimer = 0;
    this.lastSpawnCell = -1;
    this.ultraRareSlots = [];
    this.ultraRareUsed = 0;
    this.gameTime = 0;
  }

  reset() {
    this.activeMoles = [];
    this.spawnTimer = 0;
    this.lastSpawnCell = -1;
    this.gameTime = 0;
    this.ultraRareUsed = 0;

    // 激レアの出現タイミングをランダムに決定
    this.ultraRareSlots = [];
    const minTime = 5;
    const maxTime = this.gameDuration - 5;
    for (let i = 0; i < this.ultraRareCount; i++) {
      let slot;
      let attempts = 0;
      do {
        slot = minTime + Math.random() * (maxTime - minTime);
        attempts++;
      } while (attempts < 100 && this.ultraRareSlots.some(s => Math.abs(s - slot) < 3));
      this.ultraRareSlots.push(slot);
    }
    this.ultraRareSlots.sort((a, b) => a - b);
  }

  getSpawnInterval() {
    const gt = this.gameTime;
    if (gt < 20) {
      return 1.2 + Math.random() * 0.6;
    } else if (gt < 40) {
      return 0.8 + Math.random() * 0.6;
    } else {
      return 0.5 + Math.random() * 0.5;
    }
  }

  getMaxActiveMoles() {
    const gt = this.gameTime;
    if (gt < 20) {
      return 2;
    } else if (gt < 40) {
      return 3;
    } else {
      return 5;
    }
  }

  update(dt) {
    this.gameTime += dt;

    // モグラのタイマー更新
    for (let i = this.activeMoles.length - 1; i >= 0; i--) {
      const mole = this.activeMoles[i];
      mole.timer -= dt;
      if (mole.timer <= 0) {
        this.activeMoles.splice(i, 1);
      }
    }

    // 激レアモグラの出現チェック
    if (this.ultraRareUsed < this.ultraRareSlots.length) {
      if (this.gameTime >= this.ultraRareSlots[this.ultraRareUsed]) {
        this.spawnUltraRare();
        this.ultraRareUsed++;
      }
    }

    // 通常モグラの出現
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.getSpawnInterval();
      const maxActive = this.getMaxActiveMoles();
      if (this.activeMoles.length < maxActive) {
        if (!this.trySpawnNormalMole()) {
          this.spawnTimer = 0.2;
        }
      } else {
        this.spawnTimer = 0.3;
      }
    }
  }

  trySpawnNormalMole() {
    const { rows, cols } = this.grid.getDimensions();
    const totalCells = rows * cols;

    const occupiedCells = new Set();
    for (const mole of this.activeMoles) {
      occupiedCells.add(mole.row * cols + mole.col);
    }

    const emptyCells = [];
    for (let i = 0; i < totalCells; i++) {
      if (!occupiedCells.has(i)) {
        emptyCells.push(i);
      }
    }

    if (emptyCells.length === 0) {
      return false;
    }

    let candidates = emptyCells;
    if (this.lastSpawnCell >= 0 && emptyCells.length > 1) {
      candidates = emptyCells.filter(i => i !== this.lastSpawnCell);
    }
    if (candidates.length === 0) {
      candidates = emptyCells;
    }

    const cellIndex = candidates[Math.floor(Math.random() * candidates.length)];
    const row = Math.floor(cellIndex / cols);
    const col = cellIndex % cols;
    this.lastSpawnCell = cellIndex;

    // 種類決定
    const rand = Math.random();
    let moleType;
    if (rand < 0.15 && this.ultraRareUsed >= this.ultraRareSlots.length) {
      moleType = MOLE_TYPES.ULTRA_RARE;
    } else if (rand < 0.40) {
      moleType = MOLE_TYPES.RARE;
    } else {
      moleType = MOLE_TYPES.NORMAL;
    }

    const mole = new Mole(moleType);

    this.activeMoles.push({
      row, col,
      mole,
      timer: mole.getDuration(),
      maxTimer: mole.getDuration()
    });

    return true;
  }

  spawnUltraRare() {
    const { rows, cols } = this.grid.getDimensions();
    const totalCells = rows * cols;

    const occupiedCells = new Set();
    for (const mole of this.activeMoles) {
      occupiedCells.add(mole.row * cols + mole.col);
    }

    const emptyCells = [];
    for (let i = 0; i < totalCells; i++) {
      if (!occupiedCells.has(i)) {
        emptyCells.push(i);
      }
    }

    if (emptyCells.length === 0) {
      return;
    }

    const cellIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const row = Math.floor(cellIndex / cols);
    const col = cellIndex % cols;
    this.lastSpawnCell = cellIndex;

    const mole = new Mole(MOLE_TYPES.ULTRA_RARE);

    this.activeMoles.push({
      row, col,
      mole,
      timer: mole.getDuration(),
      maxTimer: mole.getDuration()
    });
  }

  getActiveMoles() {
    return this.activeMoles;
  }

  getMoleAt(row, col) {
    return this.activeMoles.find(m => m.row === row && m.col === col) || null;
  }
}
