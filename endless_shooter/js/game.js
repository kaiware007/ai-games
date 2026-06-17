import { InputManager } from './input.js?v=1781692918';
import { Player } from './player.js?v=1781692918';
import { WeaponSystem } from './weapons.js?v=1781692918';
import { Buffs } from './buffs.js?v=1781692918';
import { EnemyManager } from './enemies.js?v=1781692918';
import { Boss } from './boss.js?v=1781692918';
import { ItemManager } from './items.js?v=1781692918';
import { LevelUpSystem } from './levelup.js?v=1781692918';
import { HUD } from './hud.js?v=1781692918';
import { ParticleSystem } from './particles.js?v=1781692918';
import { AudioManager } from './audio.js?v=1781692918';
import { StarBackground } from './stars.js?v=1781692918';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = 'title';
        this.wave = 1;
        this.timeLeft = 60;
        this.bossActive = false;
        this.lastTime = 0;
        this.input = new InputManager(canvas);
        this.player = new Player(canvas);
        this.buffs = new Buffs();
        this.weapons = null;
        this.enemies = null;
        this.boss = null;
        this.items = new ItemManager();
        this.levelUp = null;
        this.hud = new HUD(canvas);
        this.particles = new ParticleSystem();
        this.audio = new AudioManager();
        this.stars = new StarBackground(canvas);
        this._setupTapHandler();
    }
    init() {
        this.player.init();
        this.buffs.reset();
        this.enemies = new EnemyManager(this.canvas, this.player, this);
        this.boss = new Boss(this.canvas, this.player);
        this.weapons = new WeaponSystem();
        this.weapons.setEnemyRefs(
            () => {
                let list = this.enemies ? this.enemies.getEnemies() : [];
                // ボスが生存中なら敵リストに含める（ホーミング弾が追尾するため）
                if (this.boss && this.boss.isAlive()) {
                    list = [...list, this.boss];
                }
                return list;
            },
            (id) => { if (this.enemies) this.enemies.killEnemy(id); },
            () => this.enemies ? this.enemies.getEnemyBullets() : []
        );
        this.weapons.setBuffs(this.buffs);
        this.items.clear();
        this.levelUp = new LevelUpSystem(this.canvas, this.player, this.weapons, this.buffs);
        this.particles.clear();
    }
    start() {
        this.state = 'playing';
        this.wave = 1;
        this.timeLeft = 60;
        this.bossActive = false;
        this.player.init();
        this.buffs.reset();
        this.enemies = new EnemyManager(this.canvas, this.player, this);
        this.boss = new Boss(this.canvas, this.player);
        this.weapons = new WeaponSystem();
        this.weapons.setEnemyRefs(
            () => {
                let list = this.enemies ? this.enemies.getEnemies() : [];
                if (this.boss && this.boss.isAlive()) {
                    list = [...list, this.boss];
                }
                return list;
            },
            (id) => { if (this.enemies) this.enemies.killEnemy(id); },
            () => this.enemies ? this.enemies.getEnemyBullets() : []
        );
        this.weapons.setBuffs(this.buffs);
        this.weapons.setMainWeapon('normalShot');
        this.items.clear();
        this.levelUp = new LevelUpSystem(this.canvas, this.player, this.weapons, this.buffs);
        this.particles.clear();
        this.hud.wave = this.wave;
        this.audio.init();
        this.enemies.score = 0;
    }
    update(dt) {
        if (this.state !== 'playing') {
            // gameover状態でもパーティクルと星は更新して自然に消えるようにする
            if (this.state === 'gameover') {
                this.particles.update(dt);
                this.stars.update(dt);
            }
            return;
        }
        const isLevelUpShowing = this.levelUp.isShowing();
        if (isLevelUpShowing) {
            // レベルアップ中表示中はタイマー停止・弾の更新のみ
            this.weapons.update(dt);
            this.particles.update(dt);
            this.buffs.update(dt);
            this.hud.update(dt);
            this.stars.update(dt);
            return;
        }
        this.input.update();
        this.player.update(dt, this.input, this);
        if (this.bossActive) {
            this.boss.update(dt);
            if (!this.boss.isAlive()) {
                this.onBossDefeated();
            }
        } else {
            // タイマーはレベルアップ中表示中でなければ常に減らす
            this.timeLeft -= dt;
            if (this.timeLeft < 0) this.timeLeft = 0;
            this.enemies.update(dt, this.wave, this.timeLeft);
            if (this.timeLeft <= 0) {
                this.onWaveClear();
            }
        }
        this.weapons.fire(dt, this.player);
        this.weapons.update(dt);
        this.items.update(dt);
        this.particles.update(dt);
        this.buffs.update(dt);
        this.stars.update(dt);
        // HUDにボスHP情報を渡す
        if (this.bossActive && this.boss.isAlive()) {
            this.hud.showBossHp = true;
            this.hud.bossHpPercent = this.boss.getHpPercent();
        } else {
            this.hud.showBossHp = false;
        }
        this.hud.update(dt);
        this._checkCollisions();
    }
    _checkCollisions() {
        if (!this.weapons || !this.enemies) return;
        // 武器の弾と敵の衝突判定は weapons.js の _checkHits で行う
        this.weapons._checkHits(this.buffs ? this.buffs.getDamageMultiplier() : 1);
        // 武器の弾とボスの衝突判定
        if (this.bossActive && this.boss.isAlive()) {
            this._checkBossHits();
        }
        // アイテム取得判定（ItemManager.collect で一括処理）
        if (this.player.alive) {
            this.items.collect(this.player, this.buffs);
        }
        // プレイヤー死亡チェック
        if (!this.player.alive && this.state === 'playing') {
            this.gameOver();
        }
    }
    // ゲームオーバー画面の描画
    _drawGameOver() {
        const ctx = this.ctx;
        const cx = this.canvas.width / 2;
        // 半透明のオーバーレイ
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // ゲームオーバーテキスト
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', cx, 180);
        // スコア表示
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px sans-serif';
        ctx.fillText(`スコア: ${this.enemies ? this.enemies.score : 0}`, cx, 230);
        ctx.fillText(`ウェーブ: ${this.wave}`, cx, 260);
        // リスタートボタン
        this._drawButton(ctx, cx, 340, 140, 44, 'リスタート', '#00ccff');
        // タイトルボタン
        this._drawButton(ctx, cx, 410, 140, 44, 'タイトル', '#aaaaaa');
    }
    _checkBossHits() {
        if (!this.weapons || !this.boss) return;
        const bx = this.boss.x, by = this.boss.y, br = 25; // ボスの当たり判定半径
        const dmg = this.buffs ? this.buffs.getDamageMultiplier() : 1;
        // 通常弾
        for (let i = this.weapons.bullets.length - 1; i >= 0; i--) {
            const b = this.weapons.bullets[i];
            const bulletRadius = b.size || 5;
            if (Math.hypot(b.x - bx, b.y - by) < br + bulletRadius) {
                this.boss.takeDamage(b.damage * dmg);
                this.particles.explode(b.x, b.y, '#ff4444', 3);
                if (!b.piercing) this.weapons.bullets.splice(i, 1);
            }
        }
        // レーザー
        for (const l of this.weapons.lasers) {
            if (Math.abs(bx - l.x) < br + l.width / 2 && by < l.playerY && by > 0) {
                this.boss.takeDamage(l.damage * dmg * 0.1);
            }
        }
        // カッター
        for (const c of this.weapons.cutters) {
            if (Math.hypot(c.x - bx, c.y - by) < br + c.radius) {
                this.boss.takeDamage(c.damage * dmg * 0.15);
            }
        }
    }
    gameOver() {
        this.state = 'gameover';
        this.audio.playGameOver();
    }
    reset() {
        this.start();
    }
    onLevelUp() {
        this.levelUp.generateUpgrades(this.weapons, this.buffs);
        this.levelUp.show();
    }
    _checkPendingLevelUp() {
        // レベルアップ画面が隠された後に、さらにレベルアップできるかチェック
        // player.js の update() でレベルアップ処理を行うので、ここではフラグリセットのみ
        if (this.player._levelUpTriggered && !this.levelUp.isShowing()) {
            this.player._levelUpTriggered = false;
        }
    }
    onBossDefeated() {
        this.bossActive = false;
        this.particles.explode(this.boss.x, this.boss.y, '#ff00ff', 20);
        this.audio.playExplosion();
        this.enemies.addScore(500);
        // ボス撃破でウェーブ終了 → 次のウェーブへ
        this.wave++;
        this.timeLeft = 60;
        this.hud.wave = this.wave;
        // ボス撃破時は経験値アイテムを大量に落とす（レベルアップなし）
        this.items.spawn(this.boss.x, this.boss.y, 30);
    }
    onWaveClear() {
        this.audio.playWaveClear();
        // 雑魚敵クリア → 同じウェーブ内でボス戦へ（ウェーブ番号は増やさない）
        this.enemies.clear();
        this.bossActive = true;
        this.boss.init(this.wave);
        this.audio.playBossAppear();
    }
    handleInput() {
        this.input.update();
    }
    showTitle() {
        this.state = 'title';
        this._helpScrollY = 0;
        this._helpMaxScroll = 0;
    }
    showGameOver() {
        this.state = 'gameover';
    }
    showPause() {
        if (this.state === 'playing') this.state = 'paused';
        else if (this.state === 'paused') this.state = 'playing';
    }
    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.state === 'title') { this._drawTitle(); return; }
        if (this.state === 'help') { this._drawHelp(); return; }
        // 星の背景を描画
        this.stars.draw(ctx);
        if (this.weapons) this.weapons.draw(ctx);
        if (!this.bossActive) this.enemies.draw(ctx);
        else this.boss.draw(ctx);
        this.items.draw(ctx);
        this.player.draw(ctx);
        this.particles.draw(ctx);
        this.levelUp.draw(ctx);
        this.hud.draw(ctx, this);
        if (this.state === 'gameover') this._drawGameOver();
    }
    _drawTitle() {
        const ctx = this.ctx;
        const cx = this.canvas.width / 2;
        // タイトル
        ctx.fillStyle = '#00ccff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('エンドレスシューティング', cx, 220);
        // バージョン情報
        ctx.font = '11px sans-serif'; ctx.fillStyle = '#666666';
        ctx.fillText('0.1.0', cx, 240);
        // スタートボタン
        this._drawButton(ctx, cx, 310, 140, 44, 'START', '#00ccff');
        // 説明ボタン
        this._drawButton(ctx, cx, 380, 140, 44, '説明', '#aaaaaa');
        // 操作説明
        ctx.font = '12px sans-serif'; ctx.fillStyle = '#666688';
        ctx.fillText('スマホ: タッチで移動', cx, 480);
        ctx.fillText('PC: 矢印キー / WASD', cx, 500);
    }
    _drawButton(ctx, x, y, w, h, text, color) {
        ctx.fillStyle = 'rgba(20,20,40,0.8)';
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.fillRect(x - w/2, y - h/2, w, h);
        ctx.strokeRect(x - w/2, y - h/2, w, h);
        ctx.fillStyle = color; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(text, x, y + h/2 - 14);
    }
    _drawHelp() {
        const ctx = this.ctx;
        const W = this.canvas.width, H = this.canvas.height;
        // 背景
        ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, W, H);
        // ヘッダー
        ctx.fillStyle = '#00ccff'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('ゲーム説明', W / 2, 30);
        // 戻るボタン（右上）
        this._drawButton(ctx, W - 40, 25, 60, 30, '戻る', '#ff6666');
        // スクロール領域
        const scrollTop = 55, scrollBottom = H - 10;
        const scrollH = scrollBottom - scrollTop;
        // コンテンツ描画（クリップしてスクロール）
        ctx.save();
        ctx.beginPath();
        ctx.rect(10, scrollTop, W - 20, scrollH);
        ctx.clip();
        const contentY = scrollTop - this._helpScrollY;
        let cy = contentY + 10;
        const lineH = 16;
        const padX = 20;
        // 概要
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText('■ 概要', padX, cy); cy += lineH + 4;
        ctx.fillStyle = '#cccccc'; ctx.font = '12px sans-serif';
        this._wrapText(ctx, '雑魚敵を倒して経験値を集めよう！', padX, cy); cy += lineH;
        this._wrapText(ctx, 'レベルアップで武器・バフを強化して、', padX, cy); cy += lineH;
        this._wrapText(ctx, 'ボスを倒してスコアを稼ごう！', padX, cy); cy += lineH + 8;
        // 操作方法
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText('■ 操作方法', padX, cy); cy += lineH + 4;
        ctx.fillStyle = '#cccccc'; ctx.font = '12px sans-serif';
        this._wrapText(ctx, '移動: タッチ・ドラッグ / キーボード', padX, cy); cy += lineH;
        this._wrapText(ctx, '攻撃: 自動連射（操作不要）', padX, cy); cy += lineH + 8;
        // レベルアップ
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText('■ レベルアップ', padX, cy); cy += lineH + 4;
        ctx.fillStyle = '#cccccc'; ctx.font = '12px sans-serif';
        this._wrapText(ctx, '経験値を集めてレベルアップすると、', padX, cy); cy += lineH;
        this._wrapText(ctx, '3つの選択肢から1つを選べる！', padX, cy); cy += lineH + 8;
        // メイン武器
        ctx.fillStyle = '#44aaff'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText('■ メイン武器（1つ装備）', padX, cy); cy += lineH + 4;
        ctx.fillStyle = '#cccccc'; ctx.font = '12px sans-serif';
        const mainWeapons = [
            '🔫 バルカン: 前方に弾を連射',
            '⚡ レーザー: 貫通レーザー',
            '🔱 トリプルショット: 3方向に弾を発射',
            '🌀 ヨーヨー: 往復する弾'
        ];
        for (const w of mainWeapons) {
            this._wrapText(ctx, w, padX, cy); cy += lineH;
        }
        cy += 4;
        // サブ武器
        ctx.fillStyle = '#44ff44'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText('■ サブ武器（最大2つ装備）', padX, cy); cy += lineH + 4;
        ctx.fillStyle = '#cccccc'; ctx.font = '12px sans-serif';
        const subWeapons = [
            '🌊 サイドウェーブ: 広範囲の波状弾',
            '🎯 ホーミング: 敵を追跡する弾',
            '🔪 カッター: 回転するカッター',
            '🛡️ サイドバリア: 敵弾を消すシールド'
        ];
        for (const w of subWeapons) {
            this._wrapText(ctx, w, padX, cy); cy += lineH;
        }
        cy += 4;
        // バフ
        ctx.fillStyle = '#ffcc00'; ctx.font = 'bold 14px sans-serif';
        ctx.fillText('■ バフ（最大3種類装備）', padX, cy); cy += lineH + 4;
        ctx.fillStyle = '#cccccc'; ctx.font = '12px sans-serif';
        const buffs = [
            '🔥 射速アップ: 発射速度が上がる',
            '💥 ダメージアップ: 攻撃力が上がる',
            '💨 移動速度アップ: 移動が速くなる',
            '✨ 経験値アップ: 獲得経験値が増える'
        ];
        for (const b of buffs) {
            this._wrapText(ctx, b, padX, cy); cy += lineH;
        }
        cy += 10;
        // スクロール最大値計算
        this._helpMaxScroll = Math.max(0, cy - scrollH);
        ctx.restore();
        // スクロールバー
        if (this._helpMaxScroll > 0) {
            const barW = 6, barH = Math.max(30, (scrollH / (cy)) * scrollH);
            const barY = scrollTop + (this._helpScrollY / this._helpMaxScroll) * (scrollH - barH);
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(W - 12, barY, barW, barH);
        }
    }
    _wrapText(ctx, text, x, y) {
        ctx.fillText(text, x, y);
    }
    _setupTapHandler() {
        const self = this;
        // ヘルプスクロール用変数
        this._helpScrollY = 0;
        this._helpMaxScroll = 0;
        this._helpDragging = false;
        this._helpDragStartY = 0;
        this._helpDragStartScroll = 0;
        this.canvas.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (self.state === 'title') {
                self._handleTitleTap(e);
                return;
            }
            if (self.state === 'help') {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width, scaleY = this.canvas.height / rect.height;
                const cx = (e.clientX - rect.left) * scaleX;
                const cy = (e.clientY - rect.top) * scaleY;
                // 戻るボタン（右上）
                if (cx > 320 - 40 - 30 && cx < 320 - 40 + 30 && cy > 25 - 15 && cy < 25 + 15) {
                    self.state = 'title';
                    self._helpScrollY = 0;
                    return;
                }
                // スクロール開始
                self._helpDragging = true;
                self._helpDragStartY = cy;
                self._helpDragStartScroll = self._helpScrollY;
                return;
            }
            if (self.state === 'gameover') {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width, scaleY = this.canvas.height / rect.height;
                const cx = (e.clientX - rect.left) * scaleX;
                const cy = (e.clientY - rect.top) * scaleY;
                const centerX = this.canvas.width / 2;
                // リスタートボタン (cx=centerX, cy=340, w=140, h=44)
                if (cx > centerX - 70 && cx < centerX + 70 && cy > 340 - 22 && cy < 340 + 22) {
                    self.start();
                    return;
                }
                // タイトルボタン (cx=centerX, cy=410, w=140, h=44)
                if (cx > centerX - 70 && cx < centerX + 70 && cy > 410 - 22 && cy < 410 + 22) {
                    self.state = 'title';
                    return;
                }
                return;
            }
            if (self.levelUp && self.levelUp.isShowing()) {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width, scaleY = this.canvas.height / rect.height;
                const cx = (e.clientX - rect.left) * scaleX, cy = (e.clientY - rect.top) * scaleY;
                self._handleLevelUpTap(cx, cy);
                return;
            }
        });
        // スクロール用 pointermove/pointerup
        this.canvas.addEventListener('pointermove', (e) => {
            if (self.state !== 'help' || !self._helpDragging) return;
            const rect = this.canvas.getBoundingClientRect();
            const scaleY = this.canvas.height / rect.height;
            const cy = (e.clientY - rect.top) * scaleY;
            const delta = cy - self._helpDragStartY;
            self._helpScrollY = Math.max(0, Math.min(self._helpMaxScroll, self._helpDragStartScroll - delta));
        });
        this.canvas.addEventListener('pointerup', () => {
            self._helpDragging = false;
        });
        this.canvas.addEventListener('pointerleave', () => {
            self._helpDragging = false;
        });
    }
    _handleTitleTap(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width, scaleY = this.canvas.height / rect.height;
        const cx = (e.clientX - rect.left) * scaleX;
        const cy = (e.clientY - rect.top) * scaleY;
        const centerX = this.canvas.width / 2;
        // スタートボタン (cx=180, cy=310, w=140, h=44)
        if (cx > centerX - 70 && cx < centerX + 70 && cy > 310 - 22 && cy < 310 + 22) {
            this.start();
            return;
        }
        // 説明ボタン (cx=180, cy=380, w=140, h=44)
        if (cx > centerX - 70 && cx < centerX + 70 && cy > 380 - 22 && cy < 380 + 22) {
            this.state = 'help';
            this._helpScrollY = 0;
            return;
        }
    }
    _handleLevelUpTap(tx, ty) {
        const cards = this.levelUp.cards;
        if (!cards || cards.length === 0) return;
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (tx >= card.x && tx <= card.x + card.w && ty >= card.y && ty <= card.y + card.h) {
                const upgrade = this.levelUp.select(i);
                if (upgrade && this.weapons) {
                    this.levelUp.apply(upgrade, this.weapons, this.buffs);
                }
                this.levelUp.hide();
                this.audio.playSelect();
                // レベルアップ選択後にさらにレベルアップできるかチェック
                this._checkPendingLevelUp();
                return;
            }
        }
    }
}
