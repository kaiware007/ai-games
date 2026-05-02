import { InputManager } from './input.js?v=1777707595';
import { Grid } from './grid.js?v=1777707595';
import { MoleManager, MOLE_TYPES } from './mole_manager.js?v=1777707595';
import { HitEffect } from './hit_effect.js?v=1777707595';
import { HUD } from './hud.js?v=1777707595';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = 600;
    this.canvas.height = 720;

    this.input = new InputManager(canvas);
    this.grid = new Grid(this.canvas.width, this.canvas.height);
    this.moleManager = new MoleManager(this.grid, 60, 2);
    this.hud = new HUD(this.canvas.height);

    this.state = 'title'; // title, playing, gameover
    this.score = 0;
    this.timeLeft = 60;
    this.totalHits = 0;
    this.effects = [];

    // クリックイベント
    canvas.addEventListener('pointerdown', (e) => {
      const pos = this.getClickPos(e.clientX, e.clientY);
      if (this.state === 'title') {
        this.startGame();
      } else if (this.state === 'playing') {
        this.handleClick(pos.x, pos.y);
      } else if (this.state === 'gameover') {
        // ゲームオーバー画面でクリックしたらリスタート
        this.startGame();
      }
    });
  }

  init() {
    this.setState('title');
  }

  setState(state) {
    this.state = state;
  }

  startGame() {
    this.score = 0;
    this.timeLeft = 60;
    this.totalHits = 0;
    this.effects = [];
    this.moleManager.reset();
    this.setState('playing');
  }

  getClickPos(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    // CSS表示サイズと内部サイズの違いを補正
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  update(dt) {
    if (this.state !== 'playing') return;

    // タイマー
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.setState('gameover');
      return;
    }

    // モグラ更新
    this.moleManager.update(dt);

    // エフェクト更新
    for (let i = this.effects.length - 1; i >= 0; i--) {
      this.effects[i].update(dt);
      if (!this.effects[i].isAlive()) {
        this.effects.splice(i, 1);
      }
    }
  }

  handleClick(x, y) {
    const row = this.grid.getRowAt(y);
    const col = this.grid.getColAt(x);
    const dims = this.grid.getDimensions();

    // グリッド外クリックは無視
    if (row < 0 || row >= dims.rows || col < 0 || col >= dims.cols) return;

    const mole = this.moleManager.getMoleAt(row, col);
    if (mole) {
      // モグラを叩いた
      const cell = this.grid.getCell(row, col);
      const cx = cell.x + cell.w / 2;
      const cy = cell.y + cell.h / 2;

      this.score += mole.type.points;
      this.totalHits++;
      this.effects.push(new HitEffect(cx, cy, mole.type.points));

      // モグラを削除
      const idx = this.moleManager.activeMoles.indexOf(mole);
      if (idx >= 0) this.moleManager.activeMoles.splice(idx, 1);
    } else {
      // ミス
      const missPoints = -5;
      this.score = Math.max(0, this.score + missPoints);
      const cell = this.grid.getCell(row, col);
      const cx = cell.x + cell.w / 2;
      const cy = cell.y + cell.h / 2;
      this.effects.push(new HitEffect(cx, cy, missPoints));
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 背景
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 地面
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, this.grid.paddingTop - 20, this.canvas.width, this.canvas.height - this.grid.paddingTop + 20);

    // グリッド描画
    this.drawGrid();

    // モグラ描画
    this.drawMoles();

    // エフェクト描画
    for (const effect of this.effects) {
      effect.draw(ctx);
    }

    // HUD
    if (this.state === 'playing') {
      this.hud.draw(ctx, this.score, this.timeLeft, 60);
    }

    // ゲームオーバー画面
    if (this.state === 'gameover') {
      this.drawGameOver();
    }

    // タイトル画面
    if (this.state === 'title') {
      this.drawTitle();
    }
  }

  drawGrid() {
    const ctx = this.ctx;
    const dims = this.grid.getDimensions();

    for (let row = 0; row < dims.rows; row++) {
      for (let col = 0; col < dims.cols; col++) {
        const cell = this.grid.getCell(row, col);

        // マスの背景（穴）
        ctx.fillStyle = '#654321';
        ctx.beginPath();
        ctx.ellipse(cell.x + cell.w / 2, cell.y + cell.h / 2, cell.w / 2, cell.h / 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 穴の縁
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  }

  drawMoles() {
    const ctx = this.ctx;
    const moles = this.moleManager.getActiveMoles();

    for (const mole of moles) {
      const cell = this.grid.getCell(mole.row, mole.col);
      const cx = cell.x + cell.w / 2;
      const cy = cell.y + cell.h / 2;

      // 出現アニメーション（フェードイン）
      const fadeIn = Math.min(1, (mole.maxTimer - mole.timer) / 0.2);
      const fadeOut = Math.min(1, mole.timer / 0.3);
      const alpha = Math.min(fadeIn, fadeOut);

      ctx.save();
      ctx.globalAlpha = alpha;

      // モグラの体
      const moleRadius = cell.w / 2.5;

      // 体の色
      let bodyColor = mole.type.color;
      if (mole.type.name === 'ultra_rare') {
        // 虹色
        const hue = (Date.now() / 10) % 360;
        bodyColor = `hsl(${hue}, 100%, 60%)`;
      }

      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(cx, cy + 5, moleRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 顔
      ctx.fillStyle = '#000';
      // 目
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 2, 3, 0, Math.PI * 2);
      ctx.arc(cx + 8, cy - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      // 鼻
      ctx.beginPath();
      ctx.ellipse(cx, cy + 5, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // 種類に応じた装飾
      if (mole.type.name === 'rare') {
        // 金色の帽子
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - moleRadius + 5);
        ctx.lineTo(cx, cy - moleRadius - 15);
        ctx.lineTo(cx + 12, cy - moleRadius + 5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#B8860B';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (mole.type.name === 'ultra_rare') {
        // 虹のオーラ
        const hue = (Date.now() / 50) % 360;
        ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, moleRadius + 8, 0, Math.PI * 2);
        ctx.stroke();

        // スター
        ctx.fillStyle = '#FFF';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⭐', cx + moleRadius + 5, cy - moleRadius);
      }

      ctx.restore();
    }
  }

  drawTitle() {
    const ctx = this.ctx;

    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // タイトル
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.strokeText('モグラ叩き！', this.canvas.width / 2, 250);
    ctx.fillText('モグラ叩き！', this.canvas.width / 2, 250);

    // サブタイトル
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeText('5×5グリッドでモグラを叩こう！', this.canvas.width / 2, 320);
    ctx.fillText('5×5グリッドでモグラを叩こう！', this.canvas.width / 2, 320);

    // 説明文
    ctx.font = '18px sans-serif';
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText('🐹 通常モグラ: 10点', this.canvas.width / 2, 380);
    ctx.fillText('👑 レアモグラ: 30点', this.canvas.width / 2, 410);
    ctx.fillText('✨ 激レアモグラ: 100点', this.canvas.width / 2, 440);
    ctx.fillText('ミス: -5点', this.canvas.width / 2, 480);

    // スタートボタン
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#4CAF50';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.strokeText('タップしてスタート！', this.canvas.width / 2, 550);
    ctx.fillText('タップしてスタート！', this.canvas.width / 2, 550);
  }

  drawGameOver() {
    const ctx = this.ctx;

    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // ゲームオーバーテキスト
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF4444';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.strokeText('ゲームオーバー！', this.canvas.width / 2, 250);
    ctx.fillText('ゲームオーバー！', this.canvas.width / 2, 250);

    // スコア表示
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.strokeText(`スコア: ${this.score}`, this.canvas.width / 2, 330);
    ctx.fillText(`スコア: ${this.score}`, this.canvas.width / 2, 330);

    // 撃破数
    ctx.font = '24px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.strokeText(`撃破数: ${this.totalHits}`, this.canvas.width / 2, 380);
    ctx.fillText(`撃破数: ${this.totalHits}`, this.canvas.width / 2, 380);

    // 評価
    let rank = '';
    if (this.score >= 500) rank = 'S - 超絶モグラハンター！';
    else if (this.score >= 300) rank = 'A - すごい！';
    else if (this.score >= 200) rank = 'B - えらい！';
    else if (this.score >= 100) rank = 'C - 頑張って！';
    else rank = 'D - もう一回！';

    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#90EE90';
    ctx.strokeText(rank, this.canvas.width / 2, 430);
    ctx.fillText(rank, this.canvas.width / 2, 430);

    // リスタートボタン
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#4CAF50';
    ctx.lineWidth = 4;
    ctx.strokeText('タップしてリスタート！', this.canvas.width / 2, 520);
    ctx.fillText('タップしてリスタート！', this.canvas.width / 2, 520);
  }
}
