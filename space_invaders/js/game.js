// メインゲームクラス
import { InputManager } from './input.js';
import { Player } from './player.js';
import { EnemyManager } from './enemy.js';
import { BulletManager } from './bullet.js';
import { HUD } from './hud.js';

const CONFIG = {
    canvasWidth: 480,
    canvasHeight: 640,
    playerSpeed: 250,
    playerBulletSpeed: -400,
    startLives: 3,
    scorePerType: [10, 20, 30] // type 0, 1, 2 の得点
};

export class Game {
    constructor() {
        this.canvas = document.getElementById('c');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.canvasWidth;
        this.canvas.height = CONFIG.canvasHeight;

        this.input = new InputManager(this.canvas);
        this.player = new Player(CONFIG.canvasWidth, CONFIG.canvasHeight, CONFIG.playerSpeed, CONFIG.playerBulletSpeed);
        this.enemies = new EnemyManager(CONFIG.canvasWidth);
        this.bullets = new BulletManager();
        this.hud = new HUD(CONFIG.canvasHeight);

        this.state = 'title'; // title, playing, paused, gameover, clear
        this.score = 0;
        this.lives = CONFIG.startLives;
        this.level = 1;
        this.message = '';
        this.messageTimer = 0;

        this.lastTime = 0;
        this.bindEvents();
    }

    bindEvents() {
        // キーボード（リスタート）
        document.addEventListener('keydown', (e) => {
            if (this.state === 'title' && e.code === 'Space') {
                this.startGame();
            } else if ((this.state === 'gameover' || this.state === 'clear') && e.code === 'Space') {
                if (this.state === 'clear') {
                    this.level++;
                    this.startGame();
                } else {
                    this.resetGame();
                }
            } else if (this.state === 'playing' && e.code === 'KeyP') {
                this.state = 'paused';
            } else if (this.state === 'paused' && e.code === 'KeyP') {
                this.state = 'playing';
            }
        });

        // タッチ（リスタート）
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.state === 'title') {
                this.startGame();
            } else if (this.state === 'gameover' || this.state === 'clear') {
                if (this.state === 'clear') {
                    this.level++;
                    this.startGame();
                } else {
                    this.resetGame();
                }
            }
        }, { passive: false });
    }

    resetGame() {
        this.score = 0;
        this.lives = CONFIG.startLives;
        this.level = 1;
        this.startGame();
    }

    startGame() {
        this.state = 'playing';
        this.message = '';
        this.player.init();
        this.enemies.init();
        this.bullets.clear();
    }

    nextLevel() {
        this.state = 'playing';
        this.message = '';
        this.player.init();
        this.enemies.init();
        this.bullets.clear();
        // レベルアップで敵の発射間隔を短くする
        this.enemies.fireInterval = Math.max(0.5, 1.5 - (this.level - 1) * 0.1);
    }

    update(dt) {
        if (this.state !== 'playing') return;

        // メッセージタイマー
        if (this.messageTimer > 0) {
            this.messageTimer -= dt;
            if (this.messageTimer <= 0) {
                this.message = '';
            }
        }

        // プレイヤー更新
        const playerBullet = this.player.update(this.input);
        if (playerBullet) {
            this.bullets.add(playerBullet);
        }

        // 敵更新
        const enemyBullet = this.enemies.update(dt);
        if (enemyBullet) {
            this.bullets.add(enemyBullet);
        }

        // 弾更新
        this.bullets.update(dt);

        // 衝突判定: プレイヤーの弾 vs 敵
        const playerBullets = this.bullets.getPlayerBullets();
        for (let i = playerBullets.length - 1; i >= 0; i--) {
            const bullet = playerBullets[i];
            const hitType = this.enemies.hitEnemy(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
            if (hitType >= 0) {
                this.score += CONFIG.scorePerType[hitType];
                this.bullets.remove(bullet);
            }
        }

        // 衝突判定: 敵の弾 vs プレイヤー
        const enemyBullets = this.bullets.getEnemyBullets();
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
            const bullet = enemyBullets[i];
            if (this.player.isHit(bullet)) {
                this.bullets.remove(bullet);
                this.lives--;
                if (this.lives <= 0) {
                    this.state = 'gameover';
                    this.message = 'GAME OVER';
                }
            }
        }

        // 敵がプレイヤーに到達
        if (this.enemies.checkGameOver(this.player.y)) {
            this.state = 'gameover';
            this.message = 'GAME OVER';
        }

        // 全敵撃破
        if (this.enemies.getRemainingCount() === 0) {
            this.state = 'clear';
            this.message = `LEVEL ${this.level} CLEAR!`;
        }
    }

    draw() {
        // 背景
        this.ctx.fillStyle = '#000033';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.state === 'title') {
            this.drawTitle();
            return;
        }

        // ゲーム描画
        this.player.draw(this.ctx);
        this.enemies.draw(this.ctx);
        this.bullets.draw(this.ctx);
        this.hud.draw(this.ctx, this.score, this.lives, this.level, this.message);

        if (this.state === 'paused') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 32px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '16px monospace';
            this.ctx.fillText('Press P to resume', this.canvas.width / 2, this.canvas.height / 2 + 30);
        } else if (this.state === 'gameover') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 36px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '20px monospace';
            this.ctx.fillText(`SCORE: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.font = '16px monospace';
            this.ctx.fillText('Press SPACE or Tap to retry', this.canvas.width / 2, this.canvas.height / 2 + 50);
        } else if (this.state === 'clear') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 36px monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`LEVEL ${this.level} CLEAR!`, this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '20px monospace';
            this.ctx.fillText(`SCORE: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.font = '16px monospace';
            this.ctx.fillText('Press SPACE or Tap for next level', this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    }

    drawTitle() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = 'bold 36px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SPACE INVADERS', this.canvas.width / 2, this.canvas.height / 2 - 40);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px monospace';
        this.ctx.fillText('← → to move, SPACE to shoot', this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.fillText('Touch: Left/Right side to move, Tap to shoot', this.canvas.width / 2, this.canvas.height / 2 + 35);

        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = 'bold 20px monospace';
        this.ctx.fillText('Press SPACE or Tap to Start', this.canvas.width / 2, this.canvas.height / 2 + 80);
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // 最大50ms
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }
}

// ゲーム開始
window.addEventListener('load', () => {
    const game = new Game();
    game.start();
});
