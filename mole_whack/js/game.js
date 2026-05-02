import { InputManager } from './input.js?v=1777728669';
import { Grid } from './grid.js?v=1777728669';
import { HUD } from './hud.js?v=1777728669';
import { ParticleSystem } from './particle.js?v=1777728669';
import { ScorePopupManager } from './score_popup.js?v=1777728669';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // キャンバスサイズ設定
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // 画像読み込み
        this.moleImage = new Image();
        this.moleImage.src = 'assets/mole.png';

        // コンポーネント
        this.input = new InputManager(this.canvas);
        this.hud = new HUD(this.canvasWidth, this.canvasHeight);
        this.particles = new ParticleSystem();
        this.popups = new ScorePopupManager();

        // ゲーム状態
        this.state = 'title'; // title, countdown, playing, gameover
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.timeLeft = 30;
        this.countdownValue = 3;
        this.countdownTimer = 0;
        this.gameOverWait = 0;

        // モグラ出現タイマー
        this.spawnTimer = 0;
        this.spawnInterval = 1.0;

        // グリッド（画像読み込み後に作成）
        this.grid = null;

        // ゲームループ開始
        this.lastTime = performance.now();
        this.gameLoop();

        // 画像読み込み完了後にグリッド作成
        this.moleImage.onload = () => {
            this.grid = new Grid(this.canvasWidth, this.canvasHeight, this.moleImage);
        };
        this.moleImage.onerror = () => {
            this.grid = new Grid(this.canvasWidth, this.canvasHeight, null);
        };
    }

    resize() {
        this.canvasWidth = window.innerWidth;
        this.canvasHeight = window.innerHeight;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;

        if (this.hud) {
            this.hud.canvasWidth = this.canvasWidth;
            this.hud.canvasHeight = this.canvasHeight;
        }

        if (this.grid) {
            this.grid = new Grid(this.canvasWidth, this.canvasHeight, this.moleImage);
        }
    }

    gameLoop() {
        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;

        this.update(dt);
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    update(dt) {
        // パーティクルとポップアップは全状態で更新
        this.particles.update(dt);
        this.popups.update(dt);

        switch (this.state) {
            case 'title':
                this.handleTitleClick();
                break;
            case 'countdown':
                this.updateCountdown(dt);
                break;
            case 'playing':
                this.updatePlaying(dt);
                break;
            case 'gameover':
                this.updateGameOver(dt);
                break;
        }
    }

    draw() {
        // 背景
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // 地面
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(0, this.canvasHeight * 0.5, this.canvasWidth, this.canvasHeight * 0.5);

        switch (this.state) {
            case 'title':
                this.hud.drawTitle(this.ctx);
                break;
            case 'countdown':
                if (this.grid) this.grid.draw(this.ctx);
                this.hud.drawCountdown(this.ctx, this.countdownValue);
                break;
            case 'playing':
                if (this.grid) this.grid.draw(this.ctx);
                this.hud.drawScore(this.ctx, this.score);
                this.hud.drawCombo(this.ctx, this.combo);
                this.hud.drawTimer(this.ctx, this.timeLeft);
                break;
            case 'gameover':
                if (this.grid) this.grid.draw(this.ctx);
                this.hud.drawGameOver(this.ctx, this.score, this.maxCombo);
                break;
        }

        // パーティクルとスコアポップアップは常に最前面に描画
        this.particles.draw(this.ctx);
        this.popups.draw(this.ctx);
    }

    handleTitleClick() {
        if (this.input.hasClick()) {
            this.input.consumeClick();
            this.startCountdown();
        }
    }

    startCountdown() {
        this.state = 'countdown';
        this.countdownValue = 3;
        this.countdownTimer = 0;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.timeLeft = 30;
        this.spawnTimer = 0;
        this.spawnInterval = 1.0;

        this.particles.clear();
        this.popups.clear();

        if (!this.grid) {
            this.grid = new Grid(this.canvasWidth, this.canvasHeight, this.moleImage);
        }
    }

    updateCountdown(dt) {
        this.countdownTimer += dt;

        if (this.countdownTimer >= 1) {
            this.countdownTimer -= 1;
            this.countdownValue--;

            if (this.countdownValue < 0) {
                this.state = 'playing';
            }
        }
    }

    updatePlaying(dt) {
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.state = 'gameover';
            this.gameOverWait = 2;
            return;
        }

        if (this.grid) {
            this.grid.update(dt);
        }

        // モグラ出現（5×5グリッドに合わせて調整）
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            const activeCount = this.grid ? this.grid.getActiveMoleCount() : 0;

            // 残り時間による難易度調整
            let interval, maxActive;
            if (this.timeLeft > 20) {
                // 前半: ゆったり
                interval = 0.8 + Math.random() * 0.5;
                maxActive = 3;
            } else if (this.timeLeft > 10) {
                // 中盤: 普通
                interval = 0.5 + Math.random() * 0.4;
                maxActive = 4;
            } else {
                // 後半: 激しい
                interval = 0.3 + Math.random() * 0.3;
                maxActive = 6;
            }

            this.spawnTimer = interval;

            if (this.grid && activeCount < maxActive) {
                const count = (this.timeLeft <= 10 && Math.random() < 0.4) ? 2 : 1;
                for (let i = 0; i < count; i++) {
                    this.grid.spawnMole(1.5 + Math.random());
                }
            }
        }

        // クリック処理
        if (this.input.hasClick()) {
            const click = this.input.consumeClick();
            if (this.grid) {
                const hitMole = this.grid.checkClick(click.x, click.y, this.particles, this.popups);
                if (hitMole) {
                    // 叩かった！
                    this.combo++;
                    if (this.combo > this.maxCombo) {
                        this.maxCombo = this.combo;
                    }
                    const bonus = Math.min(this.combo, 10);
                    this.score += 10 * bonus;
                } else {
                    // 外した→コンボリセット
                    this.combo = 0;
                }
            }
        }
    }

    updateGameOver(dt) {
        if (this.gameOverWait > 0) {
            this.gameOverWait -= dt;
            if (this.input.hasClick()) {
                this.input.consumeClick();
            }
            return;
        }

        if (this.input.hasClick()) {
            this.input.consumeClick();
            this.state = 'title';
        }
    }
}

new Game();