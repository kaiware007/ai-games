import { InputManager } from './input.js?v=1777724670';
import { Grid } from './grid.js?v=1777724670';
import { HUD } from './hud.js?v=1777724670';

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

        // ゲーム状態
        this.state = 'title'; // title, countdown, playing, gameover
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.timeLeft = 30;
        this.countdownValue = 3;
        this.countdownTimer = 0;
        this.gameOverWait = 0; // ゲームオーバー後のタップ無視時間

        // モグラ出現タイマー
        this.spawnTimer = 0;
        this.spawnInterval = 1.0; // 初期出現間隔

        // グリッド（画像読み込み後に作成）
        this.grid = null;

        // ゲームループ開始
        this.lastTime = performance.now();
        this.gameLoop();

        // 画像読み込み完了後にグリッド作成
        this.moleImage.onload = () => {
            this.grid = new Grid(this.canvasWidth, this.canvasHeight, this.moleImage);
        };
        // 画像読み込み失敗時はフォールバックでグリッド作成
        this.moleImage.onerror = () => {
            this.grid = new Grid(this.canvasWidth, this.canvasHeight, null);
        };
    }

    resize() {
        this.canvasWidth = window.innerWidth;
        this.canvasHeight = window.innerHeight;
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;

        // HUDサイズ更新
        if (this.hud) {
            this.hud.canvasWidth = this.canvasWidth;
            this.hud.canvasHeight = this.canvasHeight;
        }

        // グリッド再作成
        if (this.grid) {
            this.grid = new Grid(this.canvasWidth, this.canvasHeight, this.moleImage);
        }
    }

    gameLoop() {
        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.1); // 秒単位
        this.lastTime = now;

        this.update(dt);
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    update(dt) {
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

        // グリッドがまだない場合は作成
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
                // カウントダウン完了→ゲーム開始
                this.state = 'playing';
            }
        }
    }

    updatePlaying(dt) {
        // 残り時間
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.state = 'gameover';
            this.gameOverWait = 2; // 2秒間タップ無視
            return;
        }

        // グリッド更新
        if (this.grid) {
            this.grid.update(dt);
        }

        // モグラ出現
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            // 後半（15秒切ったら）出現頻度を上げる
            if (this.timeLeft <= 15) {
                this.spawnInterval = 0.5;
            } else {
                this.spawnInterval = 1.0;
            }
            this.spawnTimer = this.spawnInterval;

            if (this.grid) {
                // 1〜2体出現
                const count = Math.random() < 0.3 ? 2 : 1;
                for (let i = 0; i < count; i++) {
                    this.grid.spawnMole(1.5 + Math.random());
                }
            }
        }

        // クリック処理
        if (this.input.hasClick()) {
            const click = this.input.consumeClick();
            if (this.grid) {
                const hitHole = this.grid.checkClick(click.x, click.y);
                if (hitHole) {
                    const mole = hitHole.mole;
                    if (mole.hit()) {
                        // 叩かった！
                        this.combo++;
                        if (this.combo > this.maxCombo) {
                            this.maxCombo = this.combo;
                        }
                        // コンボボーナス付きスコア
                        const bonus = Math.min(this.combo, 10);
                        this.score += 10 * bonus;
                    } else {
                        // 外したor既に叩かれた→コンボリセット
                        this.combo = 0;
                    }
                } else {
                    // 穴の外をクリック→コンボリセット
                    this.combo = 0;
                }
            }
        }
    }

    updateGameOver(dt) {
        // 2秒間タップ無視
        if (this.gameOverWait > 0) {
            this.gameOverWait -= dt;
            // この間タップを消費する
            if (this.input.hasClick()) {
                this.input.consumeClick();
            }
            return;
        }

        // タップでタイトルに戻る
        if (this.input.hasClick()) {
            this.input.consumeClick();
            this.state = 'title';
        }
    }
}

// ゲーム開始
new Game();
