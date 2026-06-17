import { InputManager } from './input.js?v=1781692668';
import { PathManager } from './path.js?v=1781692668';
import { EnemyManager } from './enemy_manager.js?v=1781692668';
import { TowerManager } from './tower_manager.js?v=1781692668';
import { WaveManager } from './wave.js?v=1781692668';
import { HUD } from './hud.js?v=1781692668';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = 'title'; // title, playing, gameover, win
        this.gold = 500;
        this.lives = 20;
        this.selectedTower = null;

        // 経路のウェイポイント
        const w = canvas.width;
        const h = canvas.height;
        const waypoints = [
            { x: -20, y: h * 0.3 },
            { x: w * 0.15, y: h * 0.3 },
            { x: w * 0.25, y: h * 0.55 },
            { x: w * 0.4, y: h * 0.35 },
            { x: w * 0.55, y: h * 0.6 },
            { x: w * 0.7, y: h * 0.4 },
            { x: w * 0.85, y: h * 0.5 },
            { x: w + 20, y: h * 0.5 }
        ];

        this.pathManager = new PathManager(waypoints);
        this.enemyManager = new EnemyManager(this.pathManager);
        this.towerManager = new TowerManager();
        this.waveManager = new WaveManager(this.enemyManager);
        this.hud = new HUD(w, h);
        this.input = new InputManager(canvas);

        this.lastTime = 0;
        this.firstWaveStarted = false;

        // クリックイベント
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (canvas.height / rect.height);
            this.handleClick(x, y);
        });
        canvas.addEventListener('touchend', (e) => {
            if (e.changedTouches.length > 0) {
                const rect = canvas.getBoundingClientRect();
                const touch = e.changedTouches[0];
                const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
                const y = (touch.clientY - rect.top) * (canvas.height / rect.height);
                this.handleClick(x, y);
            }
        });
    }

    init() {
        this.gold = 500;
        this.lives = 20;
        this.selectedTower = null;
        this.state = 'title';
        this.enemyManager.clear();
        this.towerManager.clear();
        this.waveManager = new WaveManager(this.enemyManager);
        this.firstWaveStarted = false;
    }

    start() {
        this.lastTime = performance.now();
        this.gameLoop();
    }

    gameLoop = () => {
        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;

        if (this.state === 'playing') {
            this.update(dt);
        }
        this.draw();
        requestAnimationFrame(this.gameLoop);
    };

    update(dt) {
        // ウェーブ管理
        if (!this.firstWaveStarted) {
            this.firstWaveStarted = true;
            this.waveManager.betweenWaves = true;
            this.waveManager.waveDelay = 2.0;
        }
        this.waveManager.update(dt);

        // 敵の更新
        this.enemyManager.update(dt);

        // ゴール到達した敵の処理
        const reachedEnd = [];
        for (const enemy of this.enemyManager.enemies) {
            if (enemy.isReachedEnd()) {
                reachedEnd.push(enemy);
                this.lives--;
            }
        }
        this.enemyManager.enemies = this.enemyManager.enemies.filter(e => !reachedEnd.includes(e));

        // タワーの更新
        this.towerManager.update(dt, this.enemyManager.enemies);

        // 死亡した敵からゴールド獲得
        for (const enemy of this.enemyManager.enemies) {
            if (enemy.isDead()) {
                this.gold += enemy.reward;
            }
        }

        // ゲームオーバー判定
        if (this.lives <= 0) {
            this.lives = 0;
            this.gameOver();
        }

        // 勝利判定
        if (this.waveManager.isAllWavesDone()) {
            this.gameWin();
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // 背景
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(0, 0, w, h);

        // グラスのテクスチャ
        ctx.fillStyle = '#388E3C';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137.5) % w;
            const y = (i * 97.3) % h;
            ctx.fillRect(x, y, 2, 6);
        }

        if (this.state === 'title') {
            this.drawTitle(ctx);
            return;
        }

        // 経路
        this.pathManager.draw(ctx);

        // タワー
        this.towerManager.draw(ctx);

        // 敵
        this.enemyManager.draw(ctx);

        // HUD
        this.hud.draw(ctx, {
            gold: this.gold,
            lives: this.lives,
            wave: this.waveManager.getCurrentWave(),
            totalWaves: this.waveManager.getTotalWaves()
        });
        this.hud.drawTowerPanel(ctx, this.selectedTower);

        // 選択中のタワーの範囲表示
        if (this.selectedTower && this.state === 'playing') {
            const pos = this.input.getPointerPos();
            const config = Tower.CONFIGS[this.selectedTower];
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, config.range, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        }

        // ゲームオーバー・勝利画面
        if (this.state === 'gameover') {
            this.drawOverlay(ctx, 'ゲームオーバー', '#F44336');
        }
        if (this.state === 'win') {
            this.drawOverlay(ctx, 'クリア！おめでとう！', '#4CAF50');
        }
    }

    drawTitle(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        ctx.font = 'bold 36px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('🏰 Fantasy Tower Defense', w / 2, h / 2 - 60);

        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#FFF';
        ctx.fillText('タワーを配置して敵を防ごう！', w / 2, h / 2);

        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#4CAF50';
        ctx.fillText('👆 タップしてスタート', w / 2, h / 2 + 60);
    }

    drawOverlay(ctx, text, color) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, w, h);

        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        ctx.fillText(text, w / 2, h / 2 - 40);

        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#FFF';
        ctx.fillText(`ゴールド: ${this.gold} | ウェーブ: ${this.waveManager.getCurrentWave()}/${this.waveManager.getTotalWaves()}`, w / 2, h / 2 + 10);

        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#4CAF50';
        ctx.fillText('👆 タップしてリスタート', w / 2, h / 2 + 50);
    }

    handleClick(x, y) {
        if (this.state === 'title') {
            this.state = 'playing';
            return;
        }

        if (this.state === 'gameover' || this.state === 'win') {
            this.restart();
            return;
        }

        if (this.state !== 'playing') return;

        // タワーパネルのタップ
        const towerType = this.hud.getTowerAtPos(x, y);
        if (towerType) {
            this.selectedTower = (this.selectedTower === towerType) ? null : towerType;
            this.hud.handleTowerSelect(this.selectedTower);
            return;
        }

        // タワー配置
        if (this.selectedTower) {
            const config = Tower.CONFIGS[this.selectedTower];
            if (this.gold >= config.cost) {
                if (this.towerManager.canPlaceAt(x, y)) {
                    // パス上には置けないチェック
                    if (!this.isOnPath(x, y)) {
                        this.towerManager.addTower(x, y, this.selectedTower);
                        this.gold -= config.cost;
                    }
                }
            }
        }
    }

    isOnPath(x, y) {
        // パスの近くにないかチェック（パス幅40の半分+マージン）
        for (let d = 0; d < this.pathManager.getTotalLength(); d += 5) {
            const pos = this.pathManager.getPointAtDistance(d);
            const dx = pos.x - x;
            const dy = pos.y - y;
            if (Math.sqrt(dx * dx + dy * dy) < 30) {
                return true;
            }
        }
        return false;
    }

    gameOver() {
        this.state = 'gameover';
    }

    gameWin() {
        this.state = 'win';
    }

    restart() {
        this.init();
        this.state = 'playing';
        this.firstWaveStarted = false;
    }
}

// Towerはgame.jsからも参照するのでimport
import { Tower } from './tower.js?v=1781692668';
