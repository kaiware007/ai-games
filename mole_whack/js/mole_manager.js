// モグラの種類と設定
export const MOLE_TYPES = {
  NORMAL: { name: 'normal', points: 10, duration: 2.0, emoji: '🐹', color: '#8B4513' },
  RARE: { name: 'rare', points: 30, duration: 1.5, emoji: '👑', color: '#FFD700' },
  ULTRA_RARE: { name: 'ultra_rare', points: 100, duration: 2.0, emoji: '✨', color: '#FF69B4' }
};

export class MoleManager {
  constructor(grid, gameDuration, ultraRareCount) {
    this.grid = grid;
    this.gameDuration = gameDuration;
    this.ultraRareCount = ultraRareCount;
    this.activeMoles = []; // { row, col, type, timer, maxTimer }
    this.spawnTimer = 0;
    this.spawnInterval = 0.8;
    this.lastSpawnCell = -1;
    this.ultraRareSlots = []; // 激レアの出現タイミング（秒単位）
    this.ultraRareUsed = 0;
    this.gameTime = 0;
  }

  reset() {
    this.activeMoles = [];
    this.spawnTimer = 0;
    this.lastSpawnCell = -1;
    this.gameTime = 0;
    this.ultraRareUsed = 0;

    // 激レアの出現タイミングをランダムに決定（ゲーム開始後5秒〜終了5秒前）
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
      this.spawnNormalMole();
      this.spawnTimer = 0.8 + Math.random() * 0.7; // 0.8〜1.5秒
    }
  }

  spawnUltraRare() {
    const { rows, cols } = this.grid.getDimensions();
    let cellIndex;
    do {
      cellIndex = Math.floor(Math.random() * rows * cols);
    } while (this.isCellOccupied(cellIndex, rows));

    const row = Math.floor(cellIndex / cols);
    const col = cellIndex % cols;
    this.lastSpawnCell = cellIndex;

    this.activeMoles.push({
      row, col,
      type: MOLE_TYPES.ULTRA_RARE,
      timer: MOLE_TYPES.ULTRA_RARE.duration,
      maxTimer: MOLE_TYPES.ULTRA_RARE.duration
    });
  }

  spawnNormalMole() {
    const { rows, cols } = this.grid.getDimensions();
    let cellIndex;
    let attempts = 0;
    do {
      cellIndex = Math.floor(Math.random() * rows * cols);
      attempts++;
    } while (attempts < 50 && (this.isCellOccupied(cellIndex, rows) || cellIndex === this.lastSpawnCell));

    const row = Math.floor(cellIndex / cols);
    const col = cellIndex % cols;
    this.lastSpawnCell = cellIndex;

    // 種類決定
    const rand = Math.random();
    let moleType;
    if (rand < 0.15 && this.ultraRareUsed >= this.ultraRareSlots.length) {
      // 激レアスロットを使い切った後は通常プロセスでも少し出る
      moleType = MOLE_TYPES.ULTRA_RARE;
    } else if (rand < 0.40) {
      moleType = MOLE_TYPES.RARE;
    } else {
      moleType = MOLE_TYPES.NORMAL;
    }

    this.activeMoles.push({
      row, col,
      type: moleType,
      timer: moleType.duration,
      maxTimer: moleType.duration
    });
  }

  isCellOccupied(cellIndex, cols) {
    return this.activeMoles.some(m => {
      const mIndex = m.row * cols + m.col;
      return mIndex === cellIndex;
    });
  }

  getActiveMoles() {
    return this.activeMoles;
  }

  getMoleAt(row, col) {
    return this.activeMoles.find(m => m.row === row && m.col === col) || null;
  }
}