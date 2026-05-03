import { InputManager } from './input.js?v=1777813204';
import { Player } from './player.js?v=1777813204';
import { EnemyManager } from './enemy.js?v=1777813204';
import { WeaponManager, WEAPON_DEFS, BUFF_DEFS } from './weapons.js?v=1777813204';
import { ExpCrystal } from './exp_crystal.js?v=1777813204';
import { HealItem } from './heal_item.js?v=1777813204';
import { HUD } from './hud.js?v=1777813204';
import { Camera } from './camera.js?v=1777813204';

// ゲームクリア時間（秒）
const GAME_CLEAR_TIME = 600; // 10分

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.state = 'title';
        this.input = new InputManager(canvas, () => this.state);

        this.player = new Player(0, 0);
        this.enemyManager = new EnemyManager({});
        this.weaponManager = new WeaponManager(this.player);
        this.hud = new HUD(canvas);
        this.camera = new Camera(canvas.width, canvas.height);

        this.expCrystals = [];
        this.healItems = [];
        this.score = 0;
        this.time = 0;
        this.levelUpChoices = [];

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            this.handleClick(mx, my);
        });

        canvas.addEventListener('touchstart', (e) => {
            if (this.state === 'title' || this.state === 'gameover' || this.state === 'levelup' || this.state === 'gameclear') {
                const touch = e.touches[0];
                const rect = canvas.getBoundingClientRect();
                const mx = touch.clientX - rect.left;
                const my = touch.clientY - rect.top;
                this.handleClick(mx, my);
            }
        }, { passive: true });
    }

    init() {
        this.player.init();
        this.player.x = 0;
        this.player.y = 0;
        this.enemyManager.init();
        this.weaponManager.init();
        this.weaponManager.addWeapon('magic_bowl');
        this.expCrystals = [];
        this.healItems = [];
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

        if (this.state === 'gameclear') {
            this.start();
            return;
        }

        if (this.state === 'levelup') {
            const idx = this.hud.getMenuSelection(mx, my);
            if (idx >= 0 && idx < this.levelUpChoices.length) {
                this.selectUpgrade(this.levelUpChoices[idx]);
            }
            return;
        }
    }

    update(dt) {
        if (this.state !== 'playing') return;

        this.input.update();
        this.time += dt;

        if (this.time >= GAME_CLEAR_TIME) {
            this.state = 'gameclear';
            return;
        }

        this.player.update(dt, this.input, this);
        this.camera.update(this.player.getX(), this.player.getY());
        this.enemyManager.update(dt, this.player, this);
        this.weaponManager.update(dt, this.enemyManager.getEnemies(), this);

        for (const c of this.expCrystals) {
            c.update(dt);
        }

        for (let i = this.healItems.length - 1; i >= 0; i--) {
            this.healItems[i].update(dt);
            if (!this.healItems[i].isAlive()) {
                this.healItems.splice(i, 1);
            }
        }

        if (!this.player.isAlive()) {
            this.state = 'gameover';
        }

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

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, w, h);

        if (this.state === 'title') {
            this.drawTitle(ctx);
            return;
        }

        ctx.save();
        this.camera.apply(ctx);

        this.drawGrid(ctx);

        for (const item of this.healItems) {
            item.draw(ctx, this.camera);
        }

        for (const c of this.expCrystals) {
            c.draw(ctx, this.camera);
        }

        this.enemyManager.draw(ctx, this.camera);
        this.weaponManager.draw(ctx, this.camera);
        this.player.draw(ctx, this.camera);

        ctx.restore();

        this.hud.draw(ctx, this.player, this);

        if (this.state === 'levelup') {
            this.hud.drawLevelUpMenu(ctx, this.levelUpChoices);
        }

        if (this.state === 'gameover') {
            this.drawGameOver(ctx);
        }

        if (this.state === 'gameclear') {
            this.drawGameClear(ctx);
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
        ctx.fillText('10分間生存して生き残れ！', w / 2, h / 2 + 20);

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

    drawGameClear(ctx) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#2ecc71';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME CLEAR!', w / 2, h / 2 - 50);

        ctx.fillStyle = '#f1c40f';
        ctx.font = '18px monospace';
        ctx.fillText('10分間生存に成功した！', w / 2, h / 2 - 15);

        ctx.fillStyle = '#fff';
        ctx.font = '16px monospace';
        ctx.fillText(`最終スコア: ${this.score}`, w / 2, h / 2 + 20);
        ctx.fillText(`到達レベル: ${this.player.level}`, w / 2, h / 2 + 45);

        ctx.fillStyle = '#3498db';
        ctx.font = '14px monospace';
        ctx.fillText('タップまたはクリックしてリスタート', w / 2, h / 2 + 90);
    }

    showLevelUp() {
        this.state = 'levelup';

        // 武器IDリスト
        const weaponIds = Object.keys(WEAPON_DEFS);
        // バフIDリスト
        const buffIds = Object.keys(BUFF_DEFS);

        const choices = [];

        // 既に持っている武器
        const ownedWeapons = Object.keys(this.weaponManager.weapons);
        // 既に持っているバフ
        const ownedBuffs = Object.keys(this.weaponManager.buffs);

        // 未所持武器
        const notOwnedWeapons = weaponIds.filter(id => !ownedWeapons.includes(id));

        // 武器とバフを混ぜてプールを作る
        // 武器: 未所持を優先、バフはすべて候補
        const weaponPool = notOwnedWeapons.length > 0 ? notOwnedWeapons : weaponIds;
        const allPool = [...weaponPool, ...buffIds];

        // ランダムに3つ選ぶ
        const shuffled = allPool.sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);

        for (const id of selected) {
            if (WEAPON_DEFS[id]) {
                const def = WEAPON_DEFS[id];
                const currentLevel = this.weaponManager.weapons[id] ? this.weaponManager.weapons[id].level : 0;
                choices.push({ id, ...def, currentLevel, type: 'weapon' });
            } else if (BUFF_DEFS[id]) {
                const def = BUFF_DEFS[id];
                const currentLevel = this.weaponManager.buffs[id] || 0;
                choices.push({ id, ...def, currentLevel, type: 'buff' });
            }
        }

        this.levelUpChoices = choices;
        this.hud.setMenuActive(true, choices);
    }

    selectUpgrade(choice) {
        if (choice.type === 'weapon') {
            this.weaponManager.addWeapon(choice.id);
        } else if (choice.type === 'buff') {
            this.weaponManager.addBuff(choice.id);
        }
        this.hud.setMenuActive(false);
        this.state = 'playing';
    }

    onEnemyKilled(enemy) {
        this.score += enemy.score || 10;

        // 経験値クリスタルをドロップ（バフ倍率適用）
        const expMult = this.weaponManager.getExpMultiplier();
        const expValue = Math.max(1, Math.floor((Math.random() * 3 + 1) * expMult));
        const crystal = new ExpCrystal(enemy.x, enemy.y, expValue);
        this.expCrystals.push(crystal);

        // 体力回復アイテムを5%の確率でドロップ
        if (Math.random() < 0.05) {
            const healAmount = 20;
            const healItem = new HealItem(enemy.x, enemy.y, healAmount);
            this.healItems.push(healItem);
        }
    }

    gameOver() { this.state = 'gameover'; }
    restart() { this.start(); }
    pause() { if (this.state === 'playing') this.state = 'paused'; }
    resume() { if (this.state === 'paused') this.state = 'playing'; }
    isRunning() { return this.state === 'playing' || this.state === 'paused'; }
    isPaused() { return this.state === 'paused'; }
    getWeaponChoices(level) { return this.levelUpChoices; }
    getState() { return this.state; }
}
