import { InputManager } from './input.js?v=1777795577';
import { Player } from './player.js?v=1777795577';
import { EnemyManager } from './enemy.js?v=1777795577';
import { WeaponManager, WEAPON_DEFS } from './weapons.js?v=1777795577';
import { ExpCrystal } from './exp_crystal.js?v=1777795577';
import { HUD } from './hud.js?v=1777795577';
import { Camera } from './camera.js?v=1777795577';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.input = new InputManager(canvas);
        this.player = new Player(0, 0);
        this.enemyManager = new EnemyManager({});
        this.weaponManager = new WeaponManager(this.player);
        this.hud = new HUD(canvas);
        this.camera = new Camera(canvas.width, canvas.height);

        this.expCrystals = [];
        this.score = 0;
        this.time = 0;
        this.state = 'title'; // title, playing, paused, gameover, levelup
        this.levelUpChoices = [];

        // タップ/クリック処理
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            this.handleClick(mx, my);
        });

        canvas.addEventListener('touchstart', (e) => {
            if (this.state === 'levelup') {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                const mx = touch.clientX - rect.left;
                const my = touch.clientY - rect.top;
                this.handleClick(mx, my);
            }
        }, { passive: false });
    }

    init() {
        this.player.init();
        this.player.x = 0;
        this.player.y = 0;
        this.enemyManager.init();
        this.weaponManager.init();
        // 初期武器：マジックボウル
        this.weaponManager.addWeapon('magic_bowl');
        this.expCrystals = [];
        this.score = 0;
        this.time = 0;
        this.hud.setMenuActive(false);
    }

    start() {
        this.init();
        this.state = 'playing';
    }

    handleClick(mx, my) {
        if (this.state === 'title') {
            this.start();
            return;
        }

        if (this.state === 'gameover') {
            this.start();
            return;
        }

        if (this.state === 'levelup') {
            const idx = this.hud.getMenuSelection(mx, my);
            if (idx >= 0 && idx < this.levelUpChoices.length) {
                this.selectWeapon(this.levelUpChoices[idx].id);
            }
            return;
        }
    }

    update(dt) {
        if (this.state !== 'playing') return;

        this.input.update();
        this.time += dt;

        // プレイヤー更新
        this.player.update(dt, this.input, this);

        // カメラ更新
        this.camera.update(this.player.getX(), this.player.getY());

        // 敵更新
        this.enemyManager.update(dt, this.player, this);

        // 武器更新
        this.weaponManager.update(dt, this.enemyManager.getEnemies(), this);

        // 経験値クリスタル更新
        for (const c of this.expCrystals) {
            c.update(dt);
        }

        // プレイヤー死亡チェック
        if (!this.player.isAlive()) {
            this.state = 'gameover';
        }

        // レベルアップチェック
        const currentLevel = this.player.getLevel();
        if (this.player._lastLevel !== undefined && currentLevel > this.player._lastLevel) {
            this.showLevelUp();
        }
        this.player._lastLevel = currentLevel;
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

        // ゲーム描画
        ctx.save();
        this.camera.apply(ctx);

        // グリッド背景
        this.drawGrid(ctx);

        // 経験値クリスタル
        for (const c of this.expCrystals) {
            c.draw(ctx, this.camera);
        }

        // 敵
        this.enemyManager.draw(ctx, this.camera);

        // 武器エフェクト
        this.weaponManager.draw(ctx, this.camera);

        // プレイヤー
        this.player.draw(ctx, this.camera);

        ctx.restore();

        // HUD
        this.hud.draw(ctx, this.player, this);

        // レベルアップメニュー
        if (this.state === 'levelup') {
            this.hud.drawLevelUpMenu(ctx, this.levelUpChoices);
        }

        // ゲームオーバー
        if (this.state === 'gameover') {
            this.drawGameOver(ctx);
        }
    }

    drawGrid(ctx) {
        const gridSize = 50;
        const startX = Math.floor(this.camera.getX() / gridSize) * gridSize;
        const startY = Math.floor(this.camera.getY() / gridSize) * gridSize;
        const endX = startX + this.camera.getWidth() + gridSize;
        const endY = startY + this.camera.getHeight() + gridSize;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;

        for (let x = startX; x <= endX; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }
        for (let y = startY; y <= endY; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }
        ctx.lineWidth = 1;
    }

    drawTitle(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('マジックナイト', w / 2, h / 2 - 60);
        ctx.fillText('サバイバー', w / 2, h / 2 - 25);

        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.fillText('敵を倒して武器を強化して生き残れ！', w / 2, h / 2 + 20);

        ctx.fillStyle = '#3498db';
        ctx.font = '16px monospace';
        ctx.fillText('タップまたはクリックして開始', w / 2, h / 2 + 60);

        ctx.fillStyle = '#888';
        ctx.font = '12px monospace';
        ctx.fillText('WASD/矢印キーで移動 | スマホはタッチで移動', w / 2, h / 2 + 100);
    }

    drawGameOver(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 40);

        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        const minutes = Math.floor(this.time / 60);
        const seconds = Math.floor(this.time % 60);
        ctx.fillText(`生存時間: ${minutes}:${seconds.toString().padStart(2, '0')}`, w / 2, h / 2 + 10);
        ctx.fillText(`スコア: ${this.score}`, w / 2, h / 2 + 35);
        ctx.fillText(`到達レベル: ${this.player.level}`, w / 2, h / 2 + 60);

        ctx.fillStyle = '#3498db';
        ctx.font = '14px monospace';
        ctx.fillText('タップまたはクリックしてリスタート', w / 2, h / 2 + 100);
    }

    showLevelUp() {
        this.state = 'levelup';

        // ランダムに3つの武器を選ぶ
        const weaponIds = Object.keys(WEAPON_DEFS);
        const choices = [];

        // 既に持っている武器を優先
        const owned = Object.keys(this.weaponManager.weapons);
        const notOwned = weaponIds.filter(id => !owned.includes(id));

        // 1つは未所持から、残り2つはランダム
        if (notOwned.length > 0) {
            const randomNotOwned = notOwned.sort(() => Math.random() - 0.5).slice(0, 1);
            const randomAll = weaponIds.sort(() => Math.random() - 0.5).slice(0, 2);
            const pool = [...randomNotOwned, ...randomAll];
            // 重複除去
            const unique = [...new Set(pool)].slice(0, 3);
            while (unique.length < 3) {
                unique.push(weaponIds[Math.floor(Math.random() * weaponIds.length)]);
            }

            for (const id of unique.slice(0, 3)) {
                const def = WEAPON_DEFS[id];
                const currentLevel = this.weaponManager.weapons[id] ? this.weaponManager.weapons[id].level : 0;
                choices.push({ id, ...def, currentLevel });
            }
        } else {
            const random = weaponIds.sort(() => Math.random() - 0.5).slice(0, 3);
            for (const id of random) {
                const def = WEAPON_DEFS[id];
                const currentLevel = this.weaponManager.weapons[id] ? this.weaponManager.weapons[id].level : 0;
                choices.push({ id, ...def, currentLevel });
            }
        }

        this.levelUpChoices = choices;
        this.hud.setMenuActive(true, choices);
    }

    selectWeapon(weaponId) {
        this.weaponManager.addWeapon(weaponId);
        this.hud.setMenuActive(false);
        this.state = 'playing';
    }

    onEnemyKilled(enemy) {
        this.score += enemy.score || 10;

        // 経験値クリスタルをドロップ
        const expValue = Math.max(1, Math.floor(Math.random() * 3) + 1);
        const crystal = new ExpCrystal(enemy.x, enemy.y, expValue);
        this.expCrystals.push(crystal);
    }

    gameOver() {
        this.state = 'gameover';
    }

    restart() {
        this.start();
    }

    pause() {
        if (this.state === 'playing') this.state = 'paused';
    }

    resume() {
        if (this.state === 'paused') this.state = 'playing';
    }

    isRunning() {
        return this.state === 'playing' || this.state === 'paused';
    }

    isPaused() {
        return this.state === 'paused';
    }

    getWeaponChoices(level) {
        return this.levelUpChoices;
    }

    getState() {
        return this.state;
    }
}