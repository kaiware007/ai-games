export class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.resetStats();
    }

    init() { this.resetStats(); }
    resetStats() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height * 0.75;
        this.hp = 3;
        this.maxHp = 3;
        this.speed = 250;
        this.level = 1;
        this.exp = 0;
        this.expToNext = 10;
        this.fireRate = 1;
        this.damage = 1;
        this.bulletSize = 1;
        this.expMultiplier = 1;
        this.alive = true;
        this.invincible = 0;
        this._levelUpTriggered = false;
    }

    update(dt, input, game) {
        if (!this.alive) return;
        if (this.invincible > 0) {
            this.invincible -= dt;
        }
        const targetX = input.x;
        const targetY = input.y;
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const speedMult = game && game.buffs ? game.buffs.getSpeedMultiplier() : 1;
        const maxMove = this.speed * dt * speedMult;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
            const move = Math.min(dist, maxMove);
            this.x += (dx / dist) * move;
            this.y += (dy / dist) * move;
        }
        const margin = 15;
        this.x = Math.max(margin, Math.min(this.canvas.width - margin, this.x));
        this.y = Math.max(margin, Math.min(this.canvas.height - margin, this.y));
        // 1フレームに1回だけレベルアップする（複数レベルアップ防止）
        if (this.exp >= this.expToNext && !this._levelUpTriggered) {
            this._levelUpTriggered = true;
            this.exp -= this.expToNext;
            this.level++;
            this.expToNext = Math.floor(this.expToNext * 1.2) + 3;
            if (game && game.onLevelUp) {
                game.onLevelUp();
            }
        }
        // レベルアップ画面が隠されたらフラグをリセット（次のレベルアップを可能にする）
        if (this._levelUpTriggered && game && game.levelUp && !game.levelUp.isShowing()) {
            this._levelUpTriggered = false;
        }
    }

    draw(ctx) {
        if (!this.alive) return;
        if (this.invincible > 0 && Math.floor(this.invincible * 10) % 2 === 0) {
            return;
        }
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#00ccff';
        ctx.strokeStyle = '#0088cc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.lineTo(-12, 12);
        ctx.lineTo(0, 6);
        ctx.lineTo(12, 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.moveTo(-5, 12);
        ctx.lineTo(0, 18 + Math.random() * 4);
        ctx.lineTo(5, 12);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    takeDamage() {
        if (this.invincible > 0) return false;
        this.hp--;
        this.invincible = 2;
        if (this.hp <= 0) {
            this.alive = false;
        }
        return true;
    }

    getBounds() {
        return { x: this.x - 10, y: this.y - 10, w: 20, h: 20 };
    }
}
