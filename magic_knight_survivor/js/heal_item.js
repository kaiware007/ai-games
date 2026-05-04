export class HealItem {
    constructor(x, y, healAmount) {
        this.x = x;
        this.y = y;
        this.healAmount = healAmount; // 回復量
        this.radius = 8;
        this.bobTimer = Math.random() * Math.PI * 2;
        this.life = 15; // 15秒で消える
        this.isFullHeal = false; // 体力全開アイテムフラグ
    }

    update(dt) {
        this.bobTimer += dt * 3;
        this.life -= dt;
    }

    isAlive() {
        return this.life > 0;
    }

    draw(ctx, camera) {
        const bobY = Math.sin(this.bobTimer) * 3;
        const alpha = this.life < 3 ? this.life / 3 : 1;

        ctx.globalAlpha = alpha;

        if (this.isFullHeal) {
            // 体力全開アイテム（輝くピンク色のハート）
            const hx = this.x;
            const hy = this.y + bobY;
            const size = 12;

            // 光のエフェクト
            ctx.fillStyle = 'rgba(255, 105, 180, 0.3)';
            ctx.beginPath();
            ctx.arc(hx, hy, size + 5, 0, Math.PI * 2);
            ctx.fill();

            // ハート描画
            ctx.fillStyle = '#ff69b4';
            ctx.beginPath();
            ctx.moveTo(hx, hy + size * 0.4);
            ctx.bezierCurveTo(hx, hy - size * 0.4, hx - size, hy - size * 0.4, hx - size, hy + size * 0.1);
            ctx.bezierCurveTo(hx - size, hy + size * 0.7, hx, hy + size, hx, hy + size);
            ctx.bezierCurveTo(hx, hy + size, hx + size, hy + size * 0.7, hx + size, hy + size * 0.1);
            ctx.bezierCurveTo(hx + size, hy - size * 0.4, hx, hy - size * 0.4, hx, hy + size * 0.4);
            ctx.fill();

            // ハイライト
            ctx.fillStyle = '#ffb6c1';
            ctx.beginPath();
            ctx.arc(hx - 4, hy - 2, 3, 0, Math.PI * 2);
            ctx.fill();

            // テキスト
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('全回復', hx, hy - size - 5);
        } else {
            // 通常回復アイテム（赤いハート）
            const hx = this.x;
            const hy = this.y + bobY;
            const size = 8;

            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.moveTo(hx, hy + size * 0.4);
            ctx.bezierCurveTo(hx, hy - size * 0.4, hx - size, hy - size * 0.4, hx - size, hy + size * 0.1);
            ctx.bezierCurveTo(hx - size, hy + size * 0.7, hx, hy + size, hx, hy + size);
            ctx.bezierCurveTo(hx, hy + size, hx + size, hy + size * 0.7, hx + size, hy + size * 0.1);
            ctx.bezierCurveTo(hx + size, hy - size * 0.4, hx, hy - size * 0.4, hx, hy + size * 0.4);
            ctx.fill();

            // ハイライト
            ctx.fillStyle = '#ff8a80';
            ctx.beginPath();
            ctx.arc(hx - 3, hy - 1, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }

    getBounds() {
        return { x: this.x - this.radius, y: this.y - this.radius, width: this.radius * 2, height: this.radius * 2 };
    }

    getHealAmount() { return this.healAmount; }
    getX() { return this.x; }
    getY() { return this.y; }
}