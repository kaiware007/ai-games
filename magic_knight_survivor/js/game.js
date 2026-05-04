import { InputManager } from './input.js?v=1777865252';
import { Player } from './player.js?v=1777865252';
import { EnemyManager } from './enemy.js?v=1777865252';
import { WeaponSystem } from './weapons.js?v=1777865252';
import { BulletManager } from './bullet.js?v=1777865252';
import { XPCrystal } from './xp_crystal.js?v=1777865252';
import { LevelUpUI } from './levelup.js?v=1777865252';
import { HUD } from './hud.js?v=1777865252';

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 2000;

const ALL_WEAPON_IDS = [
    'magic_bowl', 'spinning_sword', 'holy_aura', 'thunder',
    'poison_cloud', 'shower_of_arrows', 'guardian', 'holy_cross'
];

const ALL_BUFF_IDS = [
    'max_hp_up', 'attack_speed_up', 'attack_range_up'
];

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.state = 'title'; // title, playing, paused, levelup, gameover
        this.gameTime = 0;
        this.lastTime = 0;

        // コンポーネント
        this.input = new InputManager(canvas);
        this.player = new Player(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
        this.enemies = new EnemyManager(WORLD_WIDTH, WORLD_HEIGHT);
        this.bullets = new BulletManager();
        this.weapons = new WeaponSystem(this.player, this.bullets, this.enemies);
        this.xpCrystals = new XPCrystal();
        this.levelUpUI = new LevelUpUI(canvas);
        this.hud = new HUD(canvas);

        // プレイヤーにinputをセット（毒雲用）
        this.player.input = this.input;
    }

    init() {
        this.state = 'title';
        this.gameTime = 0;
        this.reset();
    }

    start() {
        this.reset();
        this.state = 'playing';
        this.lastTime = performance.now();
    }

    pause() {
        if (this.state === 'playing') {
            this.state = 'paused';
        }
    }

    resume() {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.lastTime = performance.now();
        }
    }

    gameOver() {
        this.state = 'gameover';
    }

    reset() {
        this.gameTime = 0;
        this.player.init();
        this.player.x = WORLD_WIDTH / 2;
        this.player.y = WORLD_HEIGHT / 2;
        this.enemies.init();
        this.bullets.clear();
        this.weapons.init();
        this.xpCrystals.clear();
        this.levelUpUI.init();
        
        // 初期武器としてマジックボウルを付与
        this.player.addWeapon('magic_bowl');
    }

    update(dt) {
        if (this.state !== 'playing') return;

        this.gameTime += dt;
        this.input.update();

        // プレイヤー更新
        this.player.update(dt, this.input, this.enemies);

        // 敵更新
        this.enemies.update(dt, this.player, this.bullets, this.gameTime);

        // 武器更新
        this.weapons.update(dt, this.player, this.enemies);

        // 弾更新
        this.bullets.update(dt, this.enemies, this.player);

        // 経験値クリスタル更新
        this.xpCrystals.update(dt, this.player);

        // 敵死亡時にクリスタルをドロップ
        // （enemies.update内で処理済み）

        // ゲームオーバー判定
        if (this.player.isDead()) {
            this.gameOver();
        }

        // レベルUP判定
        if (this.player.checkLevelUp()) {
            this.handleLevelUp();
        }
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // 背景クリア
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);

        if (this.state === 'title') {
            this.drawTitle(ctx);
            return;
        }

        if (this.state === 'gameover') {
            this.drawGameOver(ctx);
            return;
        }

        // カメラ位置
        const cameraX = this.enemies.cameraX;
        const cameraY = this.enemies.cameraY;

        // グリッド描画（世界感）
        this.drawGrid(ctx, cameraX, cameraY);

        // 経験値クリスタル
        this.xpCrystals.draw(ctx, cameraX, cameraY);

        // 敵
        this.enemies.draw(ctx, cameraX, cameraY);

        // 弾
        this.bullets.draw(ctx, cameraX, cameraY);

        // 武器エフェクト
        this.weapons.draw(ctx, cameraX, cameraY, this.player);

        // プレイヤー
        this.player.draw(ctx, cameraX, cameraY);

        // HUD
        this.hud.drawWithPlayer(ctx, this.player, this.gameTime, this.enemies.kills);

        // レベルUP UI
        if (this.state === 'levelup') {
            this.levelUpUI.draw(ctx);
        }

        // パウズ表示
        if (this.state === 'paused') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 48px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSE', w / 2, h / 2);
            ctx.font = '20px sans-serif';
            ctx.fillText('再開するにはクリック', w / 2, h / 2 + 40);
        }
    }

    drawGrid(ctx, cameraX, cameraY) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        const gridSize = 100;
        const startX = -(cameraX % gridSize);
        const startY = -(cameraY % gridSize);

        for (let x = startX; x < this.canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }

        for (let y = startY; y < this.canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }

    drawTitle(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // タイトル
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('マジックナイト', w / 2, h / 2 - 60);
        ctx.fillText('・サバイバー', w / 2, h / 2 - 10);

        // 説明
        ctx.fillStyle = '#FFF';
        ctx.font = '18px sans-serif';
        ctx.fillText('敵を倒して経験値を集め、武器を強化せよ！', w / 2, h / 2 + 40);

        // スタート
        ctx.fillStyle = '#4FC3F7';
        ctx.font = 'bold 24px sans-serif';
        const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillText('クリックしてスタート', w / 2, h / 2 + 100);
        ctx.globalAlpha = 1;

        // 操作方法
        ctx.fillStyle = '#BDC3C7';
        ctx.font = '14px sans-serif';
        ctx.fillText('PC: WASD/矢印キーで移動 | スマホ: タップ/ドラッグで移動', w / 2, h / 2 + 150);
    }

    drawGameOver(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#F44336';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 60);

        // 統計
        ctx.fillStyle = '#FFF';
        ctx.font = '20px sans-serif';
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = Math.floor(this.gameTime % 60);
        ctx.fillText(`生存時間: ${minutes}:${seconds.toString().padStart(2, '0')}`, w / 2, h / 2);
        ctx.fillText(`倒した敵: ${this.enemies.kills}`, w / 2, h / 2 + 30);
        ctx.fillText(`レベル: ${this.player.level}`, w / 2, h / 2 + 60);

        const score = this.enemies.kills * 10 + Math.floor(this.gameTime);
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`スコア: ${score}`, w / 2, h / 2 + 100);

        // リスタート
        ctx.fillStyle = '#4FC3F7';
        ctx.font = 'bold 20px sans-serif';
        const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
        ctx.globalAlpha = pulse;
        ctx.fillText('クリックしてリスタート', w / 2, h / 2 + 150);
        ctx.globalAlpha = 1;
    }

    handleLevelUp() {
        this.state = 'levelup';

        // 3つのカードをランダムに選択
        const available = [];
        
        // 既存武器の強化候補
        const existingWeapons = this.player.weapons.map(w => w.id);
        for (const id of existingWeapons) {
            available.push({ id: id, level: this.player.weapons.find(w => w.id === id).level });
        }

        // 新武器候補
        const newWeaponIds = ALL_WEAPON_IDS.filter(id => !existingWeapons.includes(id));
        for (const id of newWeaponIds) {
            available.push({ id: id, level: 0 });
        }

        // バフも追加
        for (const id of ALL_BUFF_IDS) {
            if (!this.player.buffs.find(b => b.id === id)) {
                available.push({ id: id, level: 0, isBuff: true });
            }
        }

        // 3つランダム選択
        const cards = [];
        const shuffled = [...available].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(3, shuffled.length); i++) {
            cards.push(shuffled[i]);
        }

        this.levelUpUI.show(cards);

        // カード選択後の処理
        const checkSelection = setInterval(() => {
            if (!this.levelUpUI.isShowing()) {
                const selection = this.levelUpUI.getSelection();
                if (selection) {
                    if (selection.isBuff) {
                        // バフを追加
                        const existingBuff = this.player.buffs.find(b => b.id === selection.id);
                        if (existingBuff) {
                            existingBuff.level++;
                        } else {
                            this.player.buffs.push({ id: selection.id, level: 1 });
                        }
                    } else {
                        this.player.addWeapon(selection.id);
                    }
                }
                this.state = 'playing';
                this.lastTime = performance.now();
                clearInterval(checkSelection);
            }
        }, 100);
    }
}

// ゲーム開始
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    canvas.width = 800;
    canvas.height = 600;

    const game = new Game(canvas);
    game.init();

    // クリックでスタート/リスタート
    canvas.addEventListener('click', () => {
        if (game.state === 'title') {
            game.start();
        } else if (game.state === 'gameover') {
            game.start();
        } else if (game.state === 'paused') {
            game.resume();
        }
    });

    // タッチでスタート
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (game.state === 'title') {
            game.start();
        } else if (game.state === 'gameover') {
            game.start();
        } else if (game.state === 'paused') {
            game.resume();
        }
    }, { passive: false });

    // ゲームループ
    const gameLoop = (timestamp) => {
        const dt = Math.min((timestamp - game.lastTime) / 1000, 0.05);
        game.lastTime = timestamp;

        game.update(dt);
        game.draw();

        requestAnimationFrame(gameLoop);
    };

    game.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
});
