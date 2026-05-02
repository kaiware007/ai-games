// 弾管理クラス
export class BulletManager {
    constructor() {
        this.bullets = [];
    }

    clear() {
        this.bullets = [];
    }

    add(bullet) {
        this.bullets.push(bullet);
    }

    remove(bullet) {
        const idx = this.bullets.indexOf(bullet);
        if (idx >= 0) this.bullets.splice(idx, 1);
    }

    update(dt) {
        for (const b of this.bullets) {
            b.y += b.speed * dt;
        }
        // 画面外に出た弾を削除（speed が負=上向き、正=下向き）
        this.bullets = this.bullets.filter(b => b.y > -50 && b.y < 700);
    }

    getPlayerBullets() {
        return this.bullets.filter(b => b.isPlayer);
    }

    getEnemyBullets() {
        return this.bullets.filter(b => !b.isPlayer);
    }

    draw(ctx) {
        for (const b of this.bullets) {
            ctx.fillStyle = b.isPlayer ? '#ffff00' : '#ff4444';
            ctx.fillRect(b.x, b.y, b.width, b.height);
        }
    }
}
